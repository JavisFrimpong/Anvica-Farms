import React, { createContext, useState, useContext, useEffect } from 'react';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in on mount
    const storedAdmin = localStorage.getItem('admin_user');
    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (error) {
        console.error('Error parsing admin data:', error);
        localStorage.removeItem('admin_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Check if admin exists in localStorage
    const storedAdmins = JSON.parse(localStorage.getItem('admin_users') || '[]');
    const foundAdmin = storedAdmins.find(
      (admin) => admin.email === email && admin.password === password
    );

    if (foundAdmin) {
      const adminData = { email: foundAdmin.email, name: foundAdmin.name };
      setAdmin(adminData);
      localStorage.setItem('admin_user', JSON.stringify(adminData));
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const signup = async (name, email, password) => {
    // Check if admin already exists
    const storedAdmins = JSON.parse(localStorage.getItem('admin_users') || '[]');
    const existingAdmin = storedAdmins.find((admin) => admin.email === email);

    if (existingAdmin) {
      return { success: false, error: 'Admin with this email already exists' };
    }

    // Create new admin
    const newAdmin = { name, email, password };
    storedAdmins.push(newAdmin);
    localStorage.setItem('admin_users', JSON.stringify(storedAdmins));

    // Auto login after signup
    const adminData = { email: newAdmin.email, name: newAdmin.name };
    setAdmin(adminData);
    localStorage.setItem('admin_user', JSON.stringify(adminData));

    return { success: true };
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin_user');
  };

  const value = {
    admin,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!admin,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

