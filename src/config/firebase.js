import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// These should be set as environment variables for production
// For Vercel deployment, add these as environment variables in your project settings
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
};

// Validate that all required environment variables are present
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID',
];

const missingVars = requiredEnvVars.filter(
  (varName) => !process.env[varName] || process.env[varName] === ''
);

// Check if Firebase is configured
const isFirebaseConfigured = missingVars.length === 0;

if (!isFirebaseConfigured) {
  console.error(
    '❌ Firebase Configuration Error: Missing environment variables:',
    missingVars.join(', ')
  );
  console.error(
    '\n📝 To fix this:\n' +
    '1. Create a .env file in the root directory of your project\n' +
    '2. Add the following variables with your Firebase project credentials:\n' +
    requiredEnvVars.map((v) => `   ${v}=your_value_here`).join('\n') +
    '\n\n💡 You can find these values in your Firebase Console:\n' +
    '   Project Settings > General > Your apps > Web app config\n' +
    '\n⚠️  The app will use localStorage fallback until Firebase is configured.'
  );
}

// Initialize Firebase only if configured
let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    console.error(
      'Please check your Firebase configuration and environment variables.'
    );
  }
} else {
  console.warn(
    '⚠️  Firebase not initialized. Admin authentication will use localStorage fallback.'
  );
}

// Export Firebase services (will be null if not configured)
export { auth, db };
export default app;

