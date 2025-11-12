import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getProducts, subscribeToProducts } from '../services/productService';

// Firestore collection and doc for cart
const CART_COLLECTION = 'carts';
const CURRENT_CART_VERSION = 1;

// Logging utility
const logCartAction = (action, state, nextState) => {
  console.debug(`[Cart] ${action.type}:`, {
    payload: action.payload,
    itemCount: Object.keys(nextState.items || {}).length,
    totalQuantity: Object.values(nextState.items || {}).reduce((a, b) => a + b, 0),
  });
};

const CartContext = createContext();

// Cart reducer
const cartReducer = (state, action) => {
  let nextState;

  switch (action.type) {
    case 'SET_CART':
      nextState = { ...state, items: action.payload?.items || {}, customerDetails: action.payload?.customerDetails || null };
      break;

    case 'ADD_TO_CART':
      if (!action.payload?.id) return state;
      nextState = {
        ...state,
        items: { ...state.items, [action.payload.id]: (state.items[action.payload.id] || 0) + 1 },
      };
      break;

    case 'REMOVE_FROM_CART':
      if (!action.payload?.id || !state.items[action.payload.id]) return state;
      const newItems = { ...state.items };
      if (newItems[action.payload.id] > 1) {
        newItems[action.payload.id] -= 1;
      } else {
        delete newItems[action.payload.id];
      }
      nextState = { ...state, items: newItems };
      break;

    case 'REMOVE_ITEM_COMPLETELY':
      if (!action.payload?.id || !state.items[action.payload.id]) return state;
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

  logCartAction(action, state, nextState);
  return nextState;
};

// Firestore path for current user's cart
// For simplicity, using a fixed user ID. Replace with auth UID in real apps.
const CART_DOC_REF = doc(db, CART_COLLECTION, 'default_user_cart');

// Load cart from Firestore
const loadCartFromFirestore = async (dispatch) => {
  try {
    const docSnap = await getDoc(CART_DOC_REF);
    if (docSnap.exists()) {
      const data = docSnap.data();
      dispatch({ type: 'SET_CART', payload: data });
    } else {
      // Initialize cart
      await setDoc(CART_DOC_REF, { version: CURRENT_CART_VERSION, items: {}, customerDetails: null, lastUpdated: new Date().toISOString() });
      dispatch({ type: 'SET_CART', payload: { items: {}, customerDetails: null } });
    }
  } catch (error) {
    console.error('[Cart] Failed to load from Firestore:', error);
  }
};

// Save cart to Firestore
const saveCartToFirestore = async (cart) => {
  try {
    await setDoc(CART_DOC_REF, { ...cart, lastUpdated: new Date().toISOString() });
  } catch (error) {
    console.error('[Cart] Failed to save to Firestore:', error);
  }
};

export const CartProvider = ({ children }) => {
  const [productsData, setProductsData] = useState({});
  const [state, dispatch] = useReducer(cartReducer, { items: {}, customerDetails: null });

  // Load products and subscribe to real-time updates
  useEffect(() => {
    const loadProducts = async () => {
      const products = await getProducts();
      setProductsData(products);
    };
    loadProducts();

    const unsubscribeProducts = subscribeToProducts(setProductsData);
    return () => unsubscribeProducts && unsubscribeProducts();
  }, []);

  // Load cart from Firestore on mount
  useEffect(() => {
    loadCartFromFirestore(dispatch);

    const unsubscribeCart = onSnapshot(CART_DOC_REF, (docSnap) => {
      if (docSnap.exists()) {
        dispatch({ type: 'SET_CART', payload: docSnap.data() });
      }
    });

    return () => unsubscribeCart();
  }, []);

  // Sync cart changes to Firestore
  useEffect(() => {
    saveCartToFirestore({
      version: CURRENT_CART_VERSION,
      items: state.items,
      customerDetails: state.customerDetails,
    });
  }, [state]);

  const addToCart = (id) => dispatch({ type: 'ADD_TO_CART', payload: { id } });
  const removeFromCart = (id) => dispatch({ type: 'REMOVE_FROM_CART', payload: { id } });
  const removeItemCompletely = (id) => dispatch({ type: 'REMOVE_ITEM_COMPLETELY', payload: { id } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const setCustomerDetails = (details) => dispatch({ type: 'SET_CUSTOMER_DETAILS', payload: details });
  const clearCustomerDetails = () => dispatch({ type: 'CLEAR_CUSTOMER_DETAILS' });

  const getTotalItems = () => Object.values(state.items).reduce((a, b) => a + b, 0);

  const getTotalPrice = () => {
    const priceLookup = {};
    Object.entries(productsData).forEach(([key, p]) => {
      if (p?.price) {
        priceLookup[key] = p.price;
        if (p.id) priceLookup[p.id] = p.price;
      }
    });
    return Object.entries(state.items).reduce((total, [id, qty]) => total + (priceLookup[id] ?? 0) * qty, 0);
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
    getTotalPrice,
    getProductsData: () => productsData,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};