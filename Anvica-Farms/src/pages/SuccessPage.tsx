import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const SuccessPage = () => {
  const { clearCart, clearCustomerDetails } = useCart();

  // Clear cart and customer details when component mounts
  React.useEffect(() => {
    clearCart();
    clearCustomerDetails();
  }, [clearCart, clearCustomerDetails]);

  return (
    <div className="min-h-screen py-16 px-4 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center">
        <div className="card p-12">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <i className="fas fa-check-circle text-5xl text-green-500"></i>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-primary-600 mb-6">
            Order Submitted Successfully!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Thank you for choosing Anvica Farms! We've received your order and will contact you 
            shortly to confirm the details and arrange delivery.
          </p>

          {/* Additional Info */}
          <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-xl mb-8">
            <div className="flex items-start">
              <i className="fas fa-info-circle text-green-500 text-xl mr-3 mt-1"></i>
              <div className="text-left">
                <h3 className="font-semibold text-green-800 mb-2">What happens next?</h3>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• We'll call you within 24 hours to confirm your order</li>
                  <li>• Delivery will be arranged based on your location</li>
                  <li>• Fresh products will be delivered to your doorstep</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Back to Home Button */}
          <Link to="/" className="btn-primary">
            <i className="fas fa-home mr-2"></i>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
