import type { PropsWithChildren } from 'react';
import { createContext, useContext, useReducer } from 'react';

type ProductId = 'live-chicken' | 'dressed-chicken' | 'eggs' | 'small-chicken';

type CartItems = Record<ProductId, number>;

type State = {
  items: CartItems;
  customerDetails: Record<string, string> | null;
};

type AddAction = { type: 'add'; id: ProductId; qty?: number };
type RemoveAction = { type: 'remove'; id: ProductId };
type RemoveCompletelyAction = { type: 'removeCompletely'; id: ProductId };
type SetCustomerAction = { type: 'setCustomer'; details: Record<string, string> };
type ClearCustomerAction = { type: 'clearCustomer' };
type ClearCartAction = { type: 'clearCart' };

type Action =
  | AddAction
  | RemoveAction
  | RemoveCompletelyAction
  | SetCustomerAction
  | ClearCustomerAction
  | ClearCartAction;

const PRICES: Record<ProductId, { price: number }> = {
  'live-chicken': { price: 120 },
  'dressed-chicken': { price: 180 },
  eggs: { price: 12 },
  'small-chicken': { price: 90 },
};

const initialState: State = {
  items: { 'live-chicken': 0, 'dressed-chicken': 0, eggs: 0, 'small-chicken': 0 },
  customerDetails: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add': {
      const qty = action.qty ?? 1;
      return { ...state, items: { ...state.items, [action.id]: (state.items[action.id] ?? 0) + qty } };
    }
    case 'remove': {
      const curr = Math.max((state.items[action.id] ?? 0) - 1, 0);
      return { ...state, items: { ...state.items, [action.id]: curr } };
    }
    case 'removeCompletely': {
      return { ...state, items: { ...state.items, [action.id]: 0 } };
    }
    case 'setCustomer':
      return { ...state, customerDetails: action.details };
    case 'clearCustomer':
      return { ...state, customerDetails: null };
    case 'clearCart':
      return { ...state, items: { 'live-chicken': 0, 'dressed-chicken': 0, eggs: 0, 'small-chicken': 0 } };
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItems;
  customerDetails: Record<string, string> | null;
  addToCart: (id: ProductId, qty?: number) => void;
  removeFromCart: (id: ProductId) => void;
  removeItemCompletely: (id: ProductId) => void;
  setCustomerDetails: (details: Record<string, string>) => void;
  clearCustomerDetails: () => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemsList: () => { id: ProductId; quantity: number }[];
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: PropsWithChildren<{}>) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addToCart = (id: ProductId, qty = 1) => dispatch({ type: 'add', id, qty });
  const removeFromCart = (id: ProductId) => dispatch({ type: 'remove', id });
  const removeItemCompletely = (id: ProductId) => dispatch({ type: 'removeCompletely', id });
  const setCustomerDetails = (details: Record<string, string>) => dispatch({ type: 'setCustomer', details });
  const clearCustomerDetails = () => dispatch({ type: 'clearCustomer' });
  const clearCart = () => dispatch({ type: 'clearCart' });

  const getTotalItems = () => Object.values(state.items).reduce((s, v) => s + (v || 0), 0);

  const getTotalPrice = () =>
    (Object.entries(state.items) as [ProductId, number][]).reduce((acc, [id, qty]) => {
      const p = PRICES[id];
      return acc + (p ? p.price * (qty || 0) : 0);
    }, 0);

  const getItemsList = () =>
    (Object.entries(state.items) as [ProductId, number][])
      .filter(([, q]) => q > 0)
      .map(([id, quantity]) => ({ id, quantity }));

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        customerDetails: state.customerDetails,
        addToCart,
        removeFromCart,
        removeItemCompletely,
        setCustomerDetails,
        clearCustomerDetails,
        clearCart,
        getTotalItems,
        getTotalPrice,
        getItemsList,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
