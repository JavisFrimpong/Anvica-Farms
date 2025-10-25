import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import FormspreeOrderForm from '../components/FormspreeOrderForm';

const PreviewPage = () => {
  const { items, customerDetails, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const cartItems = Object.entries(items).map(([productId, quantity]) => ({
    ...products[productId],
    quantity
  }));

  if (!customerDetails) {
    return (
      <div className="min-h-screen py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <h2 className="text-3xl font-bold text-gray-600 mb-4">No Customer Details</h2>
            <p className="text-gray-500 mb-8">Please provide your details first.</p>
            <Link to="/details" className="btn-primary">
              <i className="fas fa-arrow-left mr-2"></i>
              Go to Details
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
          <h1 className="text-3xl font-bold text-primary-600">Order Preview</h1>
          <Link to="/details" className="btn-secondary">
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Details
          </Link>
        </div>

        <div className="space-y-8">
          {/* Customer Details */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-primary-600 mb-6">Customer Details</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Name</p>
                <p className="font-semibold text-primary-600">{customerDetails.name}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <p className="font-semibold text-primary-600">{customerDetails.phone}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl md:col-span-1">
                <p className="text-sm text-gray-600 mb-1">Location</p>
                <p className="font-semibold text-primary-600">{customerDetails.location}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-primary-600 mb-6">Order Summary</h2>
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
            
            <div className="mt-6 p-4 bg-primary-50 rounded-xl text-center">
              <h3 className="text-2xl font-bold text-primary-600">
                Total Amount: ₵{getTotalPrice().toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/" className="btn-secondary">
              <i className="fas fa-home mr-2"></i>
              Home
            </Link>
          </div>

          {/* Formspree Order Form */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-primary-600 mb-6">Submit Your Order</h2>
            <FormspreeOrderForm onSubmit={() => navigate('/success')} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
