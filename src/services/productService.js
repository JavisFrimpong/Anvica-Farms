import { products as defaultProducts } from '../data/products';

// Get products from localStorage or fallback to default
export const getProducts = () => {
  try {
    const storedProducts = localStorage.getItem('anvica_products');
    if (storedProducts) {
      return JSON.parse(storedProducts);
    }
    // Initialize with default products if not exists
    localStorage.setItem('anvica_products', JSON.stringify(defaultProducts));
    return defaultProducts;
  } catch (error) {
    console.error('Error getting products:', error);
    return defaultProducts;
  }
};

// Save products to localStorage
export const saveProducts = (products) => {
  try {
    localStorage.setItem('anvica_products', JSON.stringify(products));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('productsUpdated'));
    return { success: true };
  } catch (error) {
    console.error('Error saving products:', error);
    return { success: false, error: error.message };
  }
};

// Update a product
export const updateProduct = (productKey, updatedProduct) => {
  const products = getProducts();
  if (products[productKey]) {
    products[productKey] = { ...products[productKey], ...updatedProduct };
    return saveProducts(products);
  }
  return { success: false, error: 'Product not found' };
};

// Add a new product
export const addProduct = (productKey, product) => {
  const products = getProducts();
  if (products[productKey]) {
    return { success: false, error: 'Product key already exists' };
  }
  products[productKey] = product;
  return saveProducts(products);
};

// Delete a product
export const deleteProduct = (productKey) => {
  const products = getProducts();
  if (products[productKey]) {
    delete products[productKey];
    return saveProducts(products);
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

