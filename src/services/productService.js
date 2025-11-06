import { products as defaultProducts } from '../data/products';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';

const PRODUCTS_COLLECTION = 'products';
const PRODUCTS_DOC_ID = 'all_products';

// Check if Firebase is available
const isFirebaseAvailable = () => {
  return db !== null && db !== undefined;
};

// Get products from Firestore or fallback to localStorage/default
export const getProducts = async () => {
  try {
    if (isFirebaseAvailable()) {
      try {
        // Try to get from Firestore
        const productsDocRef = doc(db, PRODUCTS_COLLECTION, PRODUCTS_DOC_ID);
        const productsDoc = await getDoc(productsDocRef);
        
        if (productsDoc.exists()) {
          const data = productsDoc.data();
          console.log('✅ Products loaded from Firestore');
          return data.products || {};
        } else {
          // Initialize Firestore with default products if not exists
          console.log('📝 Initializing Firestore with default products...');
          const initialProducts = defaultProducts;
          try {
            await setDoc(productsDocRef, { 
              products: initialProducts,
              lastUpdated: new Date().toISOString()
            });
            console.log('✅ Default products saved to Firestore');
          } catch (writeError) {
            console.error('❌ Error saving default products to Firestore:', writeError);
            // Fallback to localStorage
            localStorage.setItem('anvica_products', JSON.stringify(initialProducts));
          }
          return initialProducts;
        }
      } catch (firestoreError) {
        console.error('❌ Firestore error:', firestoreError);
        console.error('Error code:', firestoreError.code);
        // Fallback to localStorage on Firestore error
        throw firestoreError;
      }
    } else {
      console.log('📦 Using localStorage fallback (Firebase not available)');
      // Fallback to localStorage
      const storedProducts = localStorage.getItem('anvica_products');
      if (storedProducts) {
        return JSON.parse(storedProducts);
      }
      // Initialize with default products if not exists
      localStorage.setItem('anvica_products', JSON.stringify(defaultProducts));
      return defaultProducts;
    }
  } catch (error) {
    console.error('❌ Error getting products:', error);
    // Fallback to localStorage on error
    const storedProducts = localStorage.getItem('anvica_products');
    if (storedProducts) {
      console.log('📦 Falling back to localStorage');
      return JSON.parse(storedProducts);
    }
    console.log('📦 Using default products');
    return defaultProducts;
  }
};

// Sync products to Firestore (for real-time updates)
export const syncProductsToFirestore = async (products) => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, cannot sync to Firestore');
    return { success: false, error: 'Firebase not available' };
  }

  try {
    const productsDocRef = doc(db, PRODUCTS_COLLECTION, PRODUCTS_DOC_ID);
    await setDoc(productsDocRef, {
      products: products,
      lastUpdated: new Date().toISOString()
    });
    
    console.log('✅ Products synced to Firestore successfully');
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('productsUpdated'));
    return { success: true };
  } catch (error) {
    console.error('❌ Error syncing products to Firestore:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // If permission denied, try localStorage fallback
    if (error.code === 'permission-denied') {
      console.warn('Firestore permission denied. Check your Firestore security rules.');
    }
    
    return { success: false, error: error.message };
  }
};

// Save products (Firestore if available, otherwise localStorage)
export const saveProducts = async (products) => {
  try {
    if (isFirebaseAvailable()) {
      const result = await syncProductsToFirestore(products);
      // If Firestore save fails, fallback to localStorage
      if (!result.success) {
        console.warn('Firestore save failed, falling back to localStorage');
        localStorage.setItem('anvica_products', JSON.stringify(products));
        window.dispatchEvent(new Event('productsUpdated'));
        return { success: true, warning: 'Saved to localStorage (Firestore unavailable)' };
      }
      return result;
    } else {
      // Fallback to localStorage
      console.log('📦 Saving to localStorage (Firebase not available)');
      localStorage.setItem('anvica_products', JSON.stringify(products));
      window.dispatchEvent(new Event('productsUpdated'));
      return { success: true };
    }
  } catch (error) {
    console.error('❌ Error saving products:', error);
    // Last resort: save to localStorage
    try {
      localStorage.setItem('anvica_products', JSON.stringify(products));
      window.dispatchEvent(new Event('productsUpdated'));
      return { success: true, warning: 'Saved to localStorage due to error' };
    } catch (localError) {
      return { success: false, error: error.message };
    }
  }
};

// Set up real-time listener for products
export const subscribeToProducts = (callback) => {
  if (!isFirebaseAvailable()) {
    // Fallback to localStorage events
    const handleStorage = async () => {
      const products = await getProducts();
      callback(products);
    };
    window.addEventListener('productsUpdated', handleStorage);
    // Initial load
    handleStorage();
    return () => window.removeEventListener('productsUpdated', handleStorage);
  }

  try {
    const productsDocRef = doc(db, PRODUCTS_COLLECTION, PRODUCTS_DOC_ID);
    const unsubscribe = onSnapshot(productsDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback(data.products || {});
      }
    }, (error) => {
      console.error('Error listening to products:', error);
      // Fallback to localStorage
      const storedProducts = localStorage.getItem('anvica_products');
      if (storedProducts) {
        callback(JSON.parse(storedProducts));
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up products listener:', error);
    return () => {};
  }
};

// Migrate localStorage products to Firestore (one-time migration)
export const migrateProductsToFirestore = async () => {
  if (!isFirebaseAvailable()) {
    return { success: false, error: 'Firebase not available' };
  }

  try {
    const storedProducts = localStorage.getItem('anvica_products');
    if (!storedProducts) {
      return { success: false, error: 'No local products to migrate' };
    }

    const products = JSON.parse(storedProducts);
    const productsDocRef = doc(db, PRODUCTS_COLLECTION, PRODUCTS_DOC_ID);
    const productsDoc = await getDoc(productsDocRef);

    // Only migrate if Firestore doesn't have products or if local is newer
    if (!productsDoc.exists()) {
      await setDoc(productsDocRef, {
        products: products,
        lastUpdated: new Date().toISOString(),
        migrated: true
      });
      console.log('✅ Products migrated to Firestore successfully');
      return { success: true, migrated: true };
    }

    return { success: true, migrated: false, message: 'Products already in Firestore' };
  } catch (error) {
    console.error('Error migrating products:', error);
    return { success: false, error: error.message };
  }
};

// Update a product
export const updateProduct = async (productKey, updatedProduct) => {
  const products = await getProducts();
  if (products[productKey]) {
    products[productKey] = { ...products[productKey], ...updatedProduct };
    return await saveProducts(products);
  }
  return { success: false, error: 'Product not found' };
};

// Add a new product
export const addProduct = async (productKey, product) => {
  const products = await getProducts();
  if (products[productKey]) {
    return { success: false, error: 'Product key already exists' };
  }
  products[productKey] = product;
  return await saveProducts(products);
};

// Delete a product
export const deleteProduct = async (productKey) => {
  const products = await getProducts();
  if (products[productKey]) {
    delete products[productKey];
    return await saveProducts(products);
  }
  return { success: false, error: 'Product not found' };
};

// Generate a unique product key from name
export const generateProductKey = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

