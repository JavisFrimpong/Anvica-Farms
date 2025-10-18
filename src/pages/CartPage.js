import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';

const CartPage = () => {
  const { items, removeFromCart, removeItemCompletely, getTotalPrice } = useCart();

  const cartItems = Object.entries(items).map(([productId, quantity]) => ({
    ...products[productId],
    quantity
  }));

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-shopping-cart text-4xl text-gray-400"></i>
            </div>
            <h2 className="text-3xl font-bold text-gray-600 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-500 mb-8">Add some products to get started!</p>
            <Link to="/" className="btn-primary">
              <i className="fas fa-arrow-left mr-2"></i>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">Shopping Cart</h1>
          <Link to="/" className="btn-secondary">
            <i className="fas fa-arrow-left mr-2"></i>
            Continue Shopping
          </Link>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          {cartItems.map((item) => (
            <div key={item.id} className="card p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Product Image */}
                <div className="w-full md:w-32 h-32 bg-gray-200 rounded-xl overflow-hidden">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/200x200/2c5530/ffffff?text=${item.name.replace(/\s+/g, '+')}`;
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-primary-600 mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 mb-2">{item.category}</p>
                  <p className="text-lg font-bold text-primary-600">
                    ₵{item.price.toLocaleString()} each
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="quantity-btn"
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <span className="text-xl font-bold text-primary-600 min-w-[40px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="quantity-btn"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeItemCompletely(item.id)}
                    className="btn-danger"
                  >
                    <i className="fas fa-trash mr-2"></i>
                    Remove
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">
                    ₵{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="card p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-primary-600 mb-6">
              Order Summary
            </h3>
            <div className="text-3xl font-bold text-primary-600 mb-8">
              Total: ₵{getTotalPrice().toLocaleString()}
            </div>
            <Link to="/checkout" className="btn-success w-full">
              <i className="fas fa-credit-card mr-2"></i>
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
