import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Create the context
const AdminAuthContext = createContext();

// Custom hook to use the context
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

// Provider component
export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminDocRef = doc(db, 'admins', user.uid);
          const adminDoc = await getDoc(adminDocRef);

          if (adminDoc.exists()) {
            const adminData = adminDoc.data();
            setAdmin({
              uid: user.uid,
              email: user.email,
              name: adminData.name || user.email,
              createdAt: adminData.createdAt,
            });
          } else {
            // Create admin document if it doesn’t exist
            const adminData = {
              email: user.email,
              name: user.email?.split('@')[0] || 'Admin',
              createdAt: new Date().toISOString(),
            };
            await setDoc(adminDocRef, adminData);
            setAdmin({
              uid: user.uid,
              email: user.email,
              name: adminData.name,
              createdAt: adminData.createdAt,
            });
          }
        } catch (error) {
          console.error('Error fetching admin data:', error);
          setAdmin(null);
        }
      } else {
        setAdmin(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login method
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update last login time
      const adminDocRef = doc(db, 'admins', user.uid);
      await setDoc(adminDocRef, { lastLogin: new Date().toISOString() }, { merge: true });

      return { success: true };
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Invalid password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Check your connection.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      return { success: false, error: errorMessage };
    }
  };

  // Signup method
  const signup = async (name, email, password) => {
    try {
      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const adminData = {
        email,
        name,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      const adminDocRef = doc(db, 'admins', user.uid);
      await setDoc(adminDocRef, adminData);

      return { success: true };
    } catch (error) {
      let errorMessage = 'Signup failed. Please try again.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak (min 6 characters)';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Check your connection.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      return { success: false, error: errorMessage };
    }
  };

  // Logout method
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setAdmin(null);
    }
  };

  const value = {
    admin,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!admin,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};