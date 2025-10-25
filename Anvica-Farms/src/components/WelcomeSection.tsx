import React from 'react';
import { contactInfo } from '../data/products';

const WelcomeSection = () => {
  return (
    <div className="gradient-bg py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-600 mb-4 text-shadow">
            Welcome to Anvica Farms
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed">
            Your trusted source for premium poultry products in Ghana. We deliver fresh, 
            healthy, and high-quality chickens, eggs, and poultry products directly to your doorstep.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-primary-600 mb-6">
            Get in Touch
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center justify-center space-x-3 p-4 bg-primary-50 rounded-xl">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                <i className="fas fa-phone text-white text-lg"></i>
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-600">Call Us</p>
                <p className="font-semibold text-primary-600">{contactInfo.phone}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3 p-4 bg-primary-50 rounded-xl">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                <i className="fas fa-map-marker-alt text-white text-lg"></i>
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold text-primary-600">{contactInfo.location}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl">
            <p className="text-gray-700">
              <i className="fas fa-info-circle text-yellow-500 mr-2"></i>
              <strong>Free delivery</strong> is available for those within Konongo-Agogo and surrounding areas. 
              Contact us for delivery to other regions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
