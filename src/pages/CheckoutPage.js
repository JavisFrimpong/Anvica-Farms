import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';

const CheckoutPage = () => {
  const { items, getTotalPrice } = useCart();

  const cartItems = Object.entries(items).map(([productId, quantity]) => ({
    ...products[productId],
    quantity
  }));

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <h2 className="text-3xl font-bold text-gray-600 mb-4">No Items to Checkout</h2>
            <p className="text-gray-500 mb-8">Please add items to your cart first.</p>
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
          <h1 className="text-3xl font-bold text-primary-600">Order Summary</h1>
          <Link to="/cart" className="btn-secondary">
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Cart
          </Link>
        </div>

        {/* Order Items */}
        <div className="card p-8 mb-8">
          <h2 className="text-2xl font-bold text-primary-600 mb-6">Your Order</h2>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary-600">
                    {item.name}
                  </h3>
                  <p className="text-gray-600">
                    Quantity: {item.quantity} × ₵{item.price.toLocaleString()} = ₵{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">
                    ₵{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="card p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-primary-600 mb-6">
              Total Amount
            </h3>
            <div className="text-4xl font-bold text-primary-600 mb-8">
              ₵{getTotalPrice().toLocaleString()}
            </div>
            <Link to="/details" className="btn-success w-full">
              Next <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
