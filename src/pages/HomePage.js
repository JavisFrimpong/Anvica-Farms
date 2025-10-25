import React from 'react';
import WelcomeSection from '../components/WelcomeSection';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Welcome Section */}
      <WelcomeSection />
      
      {/* Products Section */}
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary-600 mb-4">
              Our Premium Products
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our carefully selected range of poultry products. 
              All our products are sourced from healthy and well-cared-for poultry farms.
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {Object.values(products).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-primary-600 mb-4">
                Ready to Order?
              </h3>
              <p className="text-gray-600 mb-6">
                Add items to your cart and proceed to checkout. We'll contact you 
                to confirm your order and arrange delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="btn-primary"
                >
                  <i className="fas fa-shopping-cart mr-2"></i>
                  View Cart
                </button>
                <a 
                  href={`tel:${products.contactInfo?.phone || '0555824836, 0545127675'}`}
                  className="btn-secondary"
                >
                  <i className="fas fa-phone mr-2"></i>
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
