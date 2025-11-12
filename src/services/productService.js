import { db } from '../config/firebase';
import { doc, getDoc, setDoc, collection, onSnapshot } from 'firebase/firestore';

const PRODUCTS_COLLECTION = 'products';
const PRODUCTS_DOC_ID = 'all_products';

// Check if Firebase is available
const isFirebaseAvailable = () => db !== null && db !== undefined;

// Get products from Firestore
export const getProducts = async () => {
  if (!isFirebaseAvailable()) throw new Error('Firebase is not available');

  const productsDocRef = doc(db, PRODUCTS_COLLECTION, PRODUCTS_DOC_ID);
  const productsDoc = await getDoc(productsDocRef);

  if (productsDoc.exists()) {
    const data = productsDoc.data();
    return data.products || {};
  } else {
    // Initialize empty products
    await setDoc(productsDocRef, { products: {}, lastUpdated: new Date().toISOString() });
    return {};
  }
};

// Save products to Firestore
export const saveProducts = async (products) => {
  if (!isFirebaseAvailable()) throw new Error('Firebase is not available');

  try {
    const productsDocRef = doc(db, PRODUCTS_COLLECTION, PRODUCTS_DOC_ID);
    await setDoc(productsDocRef, {
      products,
      lastUpdated: new Date().toISOString()
    });
    window.dispatchEvent(new Event('productsUpdated'));
    return { success: true };
  } catch (error) {
    console.error('Error saving products to Firestore:', error);
    return { success: false, error: error.message };
  }
};

// Real-time subscription to products
export const subscribeToProducts = (callback) => {
  if (!isFirebaseAvailable()) throw new Error('Firebase is not available');

  const productsDocRef = doc(db, PRODUCTS_COLLECTION, PRODUCTS_DOC_ID);
  const unsubscribe = onSnapshot(productsDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback(data.products || {});
    }
  }, (error) => {
    console.error('Error subscribing to products:', error);
  });

  return unsubscribe;
};

// Migrate products (optional)
export const migrateProductsToFirestore = async () => {
  // Since fallback is removed, migration is unnecessary
  return { success: true, migrated: false, message: 'No migration needed' };
};

// Update a product
export const updateProduct = async (productKey, updatedProduct) => {
  const products = await getProducts();
  if (!products[productKey]) return { success: false, error: 'Product not found' };

  products[productKey] = { ...products[productKey], ...updatedProduct };
  return await saveProducts(products);
};

// Add a new product
export const addProduct = async (productKey, product) => {
  const products = await getProducts();
  if (products[productKey]) return { success: false, error: 'Product key already exists' };

  products[productKey] = product;
  return await saveProducts(products);
};

// Delete a product
export const deleteProduct = async (productKey) => {
  const products = await getProducts();
  if (!products[productKey]) return { success: false, error: 'Product not found' };

  delete products[productKey];
  return await saveProducts(products);
};

// Generate a unique product key
export const generateProductKey = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};