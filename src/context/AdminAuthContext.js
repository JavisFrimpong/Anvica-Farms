import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

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
    // Check if Firebase is configured
    if (!auth || !db) {
      // Fallback to localStorage-based authentication
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
      return;
    }

    // Listen for authentication state changes (Firebase)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, fetch admin details from Firestore
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
            // If admin document doesn't exist, create it
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
        // User is signed out
        setAdmin(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    // Fallback to localStorage if Firebase is not configured
    if (!auth || !db) {
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
    }

    // Use Firebase Authentication
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update last login time in Firestore
      if (user && db) {
        try {
          const adminDocRef = doc(db, 'admins', user.uid);
          await setDoc(adminDocRef, {
            lastLogin: new Date().toISOString(),
          }, { merge: true }); // Use merge to not overwrite existing data
        } catch (firestoreError) {
          // Log but don't fail login if Firestore update fails
          console.warn('Failed to update last login time:', firestoreError);
        }
      }

      // The onAuthStateChanged listener will handle updating the admin state
      return { success: true };
    } catch (error) {
      let errorMessage = 'An error occurred during login';
      
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
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        default:
          errorMessage = error.message || 'Login failed. Please try again.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (name, email, password) => {
    // Fallback to localStorage if Firebase is not configured
    if (!auth || !db) {
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
    }

    // Use Firebase Authentication
    try {
      // Validate password length before attempting signup
      if (password.length < 6) {
        return { 
          success: false, 
          error: 'Password must be at least 6 characters long' 
        };
      }

      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('✅ User created in Firebase Auth:', user.uid);

      // Save admin details to Firestore
      try {
        const adminDocRef = doc(db, 'admins', user.uid);
        const adminData = {
          email: email,
          name: name,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        
        await setDoc(adminDocRef, adminData);
        console.log('✅ Admin details saved to Firestore');
      } catch (firestoreError) {
        console.error('❌ Error saving admin to Firestore:', firestoreError);
        console.error('Error code:', firestoreError.code);
        // Don't fail signup if Firestore save fails - user is still created in Auth
        if (firestoreError.code === 'permission-denied') {
          console.warn('Firestore permission denied. Check your Firestore security rules.');
        }
      }

      // The onAuthStateChanged listener will handle updating the admin state
      return { success: true };
    } catch (error) {
      let errorMessage = 'An error occurred during signup';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use a stronger password (at least 6 characters)';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        default:
          errorMessage = error.message || 'Signup failed. Please try again.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    // Fallback to localStorage if Firebase is not configured
    if (!auth) {
      setAdmin(null);
      localStorage.removeItem('admin_user');
      return;
    }

    // Use Firebase Authentication
    try {
      await signOut(auth);
      // The onAuthStateChanged listener will handle updating the admin state
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback to localStorage cleanup
      setAdmin(null);
      localStorage.removeItem('admin_user');
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

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

