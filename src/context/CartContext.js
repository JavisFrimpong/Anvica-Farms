import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { products as productsData } from '../data/products';

// Cart version for migrations
const CURRENT_CART_VERSION = 1;

// Logging utility
const logCartAction = (action, state, nextState) => {
  console.debug(
    `[Cart] ${action.type}:`,
    {
      payload: action.payload,
      itemCount: Object.keys(nextState.items || {}).length,
      totalQuantity: Object.values(nextState.items || {}).reduce((a, b) => a + b, 0)
    }
  );
};

const CartContext = createContext();

const cartReducer = (state, action) => {
  let nextState;

  switch (action.type) {
    case 'SET_CART':
      nextState = {
        ...state,
        items: validateCartItems(action.payload || {})
      };
      break;
    
    case 'ADD_TO_CART':
      if (!action.payload?.id) {
        console.warn('[Cart] Invalid ADD_TO_CART payload:', action.payload);
        return state;
      }
      nextState = {
        ...state,
        items: {
          ...state.items,
          [action.payload.id]: (state.items[action.payload.id] || 0) + 1
        }
      };
      break;
    
    case 'REMOVE_FROM_CART':
      if (!action.payload?.id || !state.items[action.payload.id]) {
        console.warn('[Cart] Invalid REMOVE_FROM_CART payload:', action.payload);
        return state;
      }
      const newItems = { ...state.items };
      if (newItems[action.payload.id] > 1) {
        newItems[action.payload.id] -= 1;
      } else {
        delete newItems[action.payload.id];
      }
      nextState = { ...state, items: newItems };
      break;
    
    case 'REMOVE_ITEM_COMPLETELY':
      if (!action.payload?.id || !state.items[action.payload.id]) {
        console.warn('[Cart] Invalid REMOVE_ITEM_COMPLETELY payload:', action.payload);
        return state;
      }
      const updatedItems = { ...state.items };
      delete updatedItems[action.payload.id];
      nextState = { ...state, items: updatedItems };
      break;
    
    case 'CLEAR_CART':
      nextState = { ...state, items: {} };
      break;
    
    case 'SET_CUSTOMER_DETAILS':
      nextState = { ...state, customerDetails: action.payload };
      break;
    
    case 'CLEAR_CUSTOMER_DETAILS':
      nextState = { ...state, customerDetails: null };
      break;
    
    default:
      return state;
  }

  // Log the action and state change
  logCartAction(action, state, nextState);
  return nextState;
};

// Validate cart data structure
const validateCartItems = (items) => {
  if (!items || typeof items !== 'object') return {};
  
  // Filter out invalid entries and normalize quantities
  const validItems = Object.entries(items).reduce((acc, [key, quantity]) => {
    // Verify the product exists (either by key or id)
    const productExists = productsData[key] || Object.values(productsData).some(p => p.id === key);
    if (!productExists) {
      console.warn(`[Cart] Removing invalid product: ${key}`);
      return acc;
    }
    
    // Ensure quantity is a positive number
    const validQuantity = Math.max(0, parseInt(quantity) || 0);
    if (validQuantity > 0) {
      acc[key] = validQuantity;
    }
    return acc;
  }, {});
  
  return validItems;
};

// Migrate cart data between versions
const migrateCart = (savedCart) => {
  try {
    const parsed = JSON.parse(savedCart);
    const version = parsed.version || 0;
    
    // Version 0 -> 1: Add version number, validate items
    if (version < 1) {
      return {
        version: CURRENT_CART_VERSION,
        items: validateCartItems(parsed.items),
        customerDetails: parsed.customerDetails || null,
        lastUpdated: new Date().toISOString()
      };
    }
    
    // Cart is current version
    return {
      ...parsed,
      items: validateCartItems(parsed.items),
      lastUpdated: new Date().toISOString()
    };
  } catch (e) {
    console.error('[Cart] Migration failed:', e);
    return null;
  }
};

const getInitialState = () => {
  const savedCart = localStorage.getItem('anvicaCart');
  if (savedCart) {
    try {
      const migrated = migrateCart(savedCart);
      if (migrated) {
        console.debug('[Cart] Loaded saved cart:', {
          version: migrated.version,
          itemCount: Object.keys(migrated.items).length
        });
        return {
          items: migrated.items,
          customerDetails: migrated.customerDetails || null
        };
      }
    } catch (e) {
      console.error('[Cart] Error loading saved cart:', e);
    }
  }
  
  // Return empty cart if nothing valid was loaded
  return {
    items: {},
    customerDetails: null
  };
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, getInitialState());

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('anvicaCart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.items) {
        dispatch({ type: 'SET_CART', payload: parsedCart.items });
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const cartData = {
      version: CURRENT_CART_VERSION,
      items: state.items,
      customerDetails: state.customerDetails,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('anvicaCart', JSON.stringify(cartData));
  }, [state]);

  const addToCart = (productId) => {
    dispatch({ type: 'ADD_TO_CART', payload: { id: productId } });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id: productId } });
  };

  const removeItemCompletely = (productId) => {
    dispatch({ type: 'REMOVE_ITEM_COMPLETELY', payload: { id: productId } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setCustomerDetails = (details) => {
    dispatch({ type: 'SET_CUSTOMER_DETAILS', payload: details });
  };

  const clearCustomerDetails = () => {
    dispatch({ type: 'CLEAR_CUSTOMER_DETAILS' });
  };

  const getTotalItems = () => {
    return Object.values(state.items).reduce((total, quantity) => total + quantity, 0);
  };

  const getTotalPrice = () => {
    // Build a price lookup that supports both product key (object key)
    // and the product's internal `id` so cart keys of either type work.
    const priceLookup = {};
    Object.entries(productsData).forEach(([key, p]) => {
      if (p && typeof p.price === 'number') {
        priceLookup[key] = p.price;
        if (p.id) priceLookup[p.id] = p.price; // map internal id too
      }
    });

    return Object.entries(state.items).reduce((total, [productId, quantity]) => {
      const price = priceLookup[productId] ?? 0;
      return total + price * quantity;
    }, 0);
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    clearCart,
    setCustomerDetails,
    clearCustomerDetails,
    getTotalItems,
    getTotalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
