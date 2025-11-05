import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DetailsPage from './pages/DetailsPage';
import PreviewPage from './pages/PreviewPage';
import SuccessPage from './pages/SuccessPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  return (
    <AdminAuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Admin routes (no navbar) */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            
            {/* Public routes (with navbar) */}
            <Route
              path="/*"
              element={
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <main>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/details" element={<DetailsPage />} />
                      <Route path="/preview" element={<PreviewPage />} />
                      <Route path="/success" element={<SuccessPage />} />
                    </Routes>
                  </main>
                </div>
              }
            />
          </Routes>
        </Router>
      </CartProvider>
    </AdminAuthProvider>
  );
}

export default App;
