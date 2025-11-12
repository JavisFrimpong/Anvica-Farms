// src/scripts/migrateProducts.js
import { db } from '../config/firebase.js'; // your firebase.js path
import { products } from '../data/products.js'; // your local products data path
import { doc, setDoc, collection } from 'firebase/firestore';

const COLLECTION_NAME = 'products';

const migrateProducts = async () => {
  try {
    console.log('🔹 Starting product migration to Firebase...');

    const collectionRef = collection(db, COLLECTION_NAME);

    for (const [key, product] of Object.entries(products)) {
      const docRef = doc(collectionRef, product.id);
      await setDoc(docRef, {
        ...product,
        createdAt: new Date().toISOString(),
      });
      console.log(`✅ Migrated product: ${product.name} (${product.id})`);
    }

    console.log('🎉 All products have been migrated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error migrating products:', error);
    process.exit(1);
  }
};

migrateProducts();
