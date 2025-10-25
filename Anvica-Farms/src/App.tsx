import React, { createContext, useContext, useReducer } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DetailsPage from './pages/DetailsPage';
import PreviewPage from './pages/PreviewPage';
import SuccessPage from './pages/SuccessPage';

type ProductId = 'live-chicken' | 'dressed-chicken' | 'eggs' | 'small-chicken';

type CartItem = {
    id: ProductId;
    quantity: number;
    details?: Record<string, any>;
};

type CartState = {
    items: CartItem[];
    total: number;
};

type AddAction = { type: 'add'; id: ProductId; quantity?: number };
type RemoveAction = { type: 'remove'; id: ProductId };
type UpdateQtyAction = { type: 'update'; id: ProductId; quantity: number };
type SetDetailsAction = { type: 'setDetails'; id: ProductId; details: Record<string, any> };
type ClearAction = { type: 'clear' };

type CartAction = AddAction | RemoveAction | UpdateQtyAction | SetDetailsAction | ClearAction;

const PRICES: Record<ProductId, { price: number }> = {
    'live-chicken': { price: 120 },
    'dressed-chicken': { price: 180 },
    eggs: { price: 12 },
    'small-chicken': { price: 90 },
};

const initialState: CartState = { items: [], total: 0 };

function recalcTotal(items: CartItem[]) {
    return items.reduce((acc, it) => {
        const priceObj = PRICES[it.id];
        const price = priceObj ? priceObj.price : 0;
        return acc + price * it.quantity;
    }, 0);
}

function reducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'add': {
            const existing = state.items.find(i => i.id === action.id);
            let items: CartItem[];
            if (existing) {
                items = state.items.map(i =>
                    i.id === action.id ? { ...i, quantity: i.quantity + (action.quantity ?? 1) } : i
                );
            } else {
                items = [...state.items, { id: action.id, quantity: action.quantity ?? 1 }];
            }
            return { items, total: recalcTotal(items) };
        }
        case 'remove': {
            const items = state.items.filter(i => i.id !== action.id);
            return { items, total: recalcTotal(items) };
        }
        case 'update': {
            const items = state.items.map(i => (i.id === action.id ? { ...i, quantity: action.quantity } : i));
            return { items, total: recalcTotal(items) };
        }
        case 'setDetails': {
            const items = state.items.map(i => (i.id === action.id ? { ...i, details: action.details } : i));
            return { items, total: recalcTotal(items) };
        }
        case 'clear':
            return { items: [], total: 0 };
        default:
            return state;
    }
}

type CartContextValue = {
    state: CartState;
    addToCart: (id: ProductId, quantity?: number) => void;
    removeFromCart: (id: ProductId) => void;
    updateQuantity: (id: ProductId, quantity: number) => void;
    setItemDetails: (id: ProductId, details: Record<string, any>) => void;
    clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const addToCart = (id: ProductId, quantity = 1) => dispatch({ type: 'add', id, quantity });
    const removeFromCart = (id: ProductId) => dispatch({ type: 'remove', id });
    const updateQuantity = (id: ProductId, quantity: number) => dispatch({ type: 'update', id, quantity });
    const setItemDetails = (id: ProductId, details: Record<string, any>) => dispatch({ type: 'setDetails', id, details });
    const clearCart = () => dispatch({ type: 'clear' });

    return (
        <CartContext.Provider value={{ state, addToCart, removeFromCart, updateQuantity, setItemDetails, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}

export default function App() {
    return (
        <CartProvider>
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/details/:id" element={<DetailsPage />} />
                    <Route path="/preview" element={<PreviewPage />} />
                    <Route path="/success" element={<SuccessPage />} />
                </Routes>
            </Router>
        </CartProvider>
    );
}
