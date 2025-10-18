import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.id]: (state.items[action.payload.id] || 0) + 1
        }
      };
    
    case 'REMOVE_FROM_CART':
      const newItems = { ...state.items };
      if (newItems[action.payload.id] > 1) {
        newItems[action.payload.id] -= 1;
      } else {
        delete newItems[action.payload.id];
      }
      return { ...state, items: newItems };
    
    case 'REMOVE_ITEM_COMPLETELY':
      const updatedItems = { ...state.items };
      delete updatedItems[action.payload.id];
      return { ...state, items: updatedItems };
    
    case 'CLEAR_CART':
      return { ...state, items: {} };
    
    case 'SET_CUSTOMER_DETAILS':
      return { ...state, customerDetails: action.payload };
    
    case 'CLEAR_CUSTOMER_DETAILS':
      return { ...state, customerDetails: null };
    
    default:
      return state;
  }
};

const initialState = {
  items: {},
  customerDetails: null
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

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
    localStorage.setItem('anvicaCart', JSON.stringify(state));
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
    const products = {
      'live-chicken': { price: 350 },
      'dressed-chicken': { price: 280 },
      'eggs': { price: 5 },
      'small-chicken': { price: 120 }
    };

    return Object.entries(state.items).reduce((total, [productId, quantity]) => {
      const product = products[productId];
      return total + (product ? product.price * quantity : 0);
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
