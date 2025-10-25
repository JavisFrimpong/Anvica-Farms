import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const DetailsPage = () => {
  const { setCustomerDetails, customerDetails } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(customerDetails || {
    name: '',
    phone: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim() || !formData.location.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    // Basic phone validation
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert('Please enter a valid phone number.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save customer details to context
      setCustomerDetails(formData);
      
      // Navigate to preview page
      navigate('/preview');
    } catch (error) {
      console.error('Error saving details:', error);
      alert('There was an error processing your details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">Customer Information</h1>
          <Link to="/checkout" className="btn-secondary">
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Checkout
          </Link>
        </div>

        {/* Form */}
        <div className="card p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Please provide your details
            </h2>
            <p className="text-gray-600">
              We need this information to process your order and arrange delivery.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., +233 24 123 4567"
                required
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                Location/Address *
              </label>
              <textarea
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="input-field h-24 resize-none"
                placeholder="Enter your complete address including landmarks"
                required
              />
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl">
              <p className="text-blue-800 text-sm">
                <i className="fas fa-info-circle mr-2"></i>
                <strong>Note:</strong> We'll contact you at the provided phone number to confirm your order and arrange delivery.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Processing...
                </>
              ) : (
                <>
                  Preview Order <i className="fas fa-eye ml-2"></i>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;
