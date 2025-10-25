import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import FormspreeOrderForm from '../components/FormspreeOrderForm';

const PreviewPage = () => {
  const { items, customerDetails, getTotalPrice } = useCart();
  const navigate = useNavigate();

  // Build cart items defensively (support lookup by product key or product.id)
  const cartItems = Object.entries(items).map(([productKey, quantity]) => {
    const productFromKey = products[productKey];
    const productById = Object.values(products).find((p) => p.id === productKey);
    const product = productFromKey || productById || null;

    return {
      productKey,
      id: product ? (product.id ?? productKey) : productKey,
      name: product ? product.name : 'Unknown product',
      price: product ? product.price : 0,
      quantity
    };
  });

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
          <Link to="/" className="btn-secondary">
              <i className="fas fa-home mr-2"></i>
              Home
            </Link>
          <Link to="/details" className="btn-secondary">
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Details
          </Link>
        </div>

        <div className="space-y-8">
      

          {/* Formspree Order Form */}
          <div className="card p-8">
            {/* <h2 className="text-2xl font-bold text-primary-600 mb-6">Submit Your Order</h2> */}
            <FormspreeOrderForm onSubmit={() => navigate('/success')} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
