import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import logo from '../photos/logo.jpg'

const Navbar = () => {
  const { getTotalItems } = useCart();

  return (
    <nav className="hero-gradient shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between p-2 items-center h-30">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 text-white hover:text-yellow-200 transition-colors duration-300">
            <div className="w-20 h-30 bg-white rounded-full flex items-center justify-center">
              <img src={logo} alt="Anvica logo" className="rounded-full" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Anvica Farms</h1>
              <p className="text-2xs text-yellow-200 hover:text-white-200 transition-colors duration-300">Premium Poultry</p>
            </div>
          </Link>

          {/* Cart Button */}
          <Link 
            to="/cart" 
            className="relative bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
          >
            <i className="fas fa-shopping-cart text-lg"></i>
            <span className="font-semibold">Cart</span>
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-bounce-gentle">
                {getTotalItems()}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
