import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  getProducts,
  updateProduct,
  addProduct,
  deleteProduct,
  generateProductKey,
  subscribeToProducts,
  migrateProductsToFirestore,
} from '../services/productService';

const AdminDashboardPage = () => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    images: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    let isMounted = true;
    let unsubscribe = null;

    const initializeProducts = async () => {
      try {
        // Migrate products to Firestore on first load (if needed)
        const migrationResult = await migrateProductsToFirestore();
        if (migrationResult.success && migrationResult.migrated) {
          console.log('✅ Products migrated to Firestore');
        }

        // Load products initially
        if (isMounted) {
          await loadProducts();
        }
        
        // Set up real-time listener for products
        if (isMounted) {
          unsubscribe = subscribeToProducts((updatedProducts) => {
            if (isMounted) {
              setProducts(updatedProducts);
              loadCategoriesFromProducts(updatedProducts);
            }
          });
        }
      } catch (error) {
        console.error('Error initializing products:', error);
        if (isMounted) {
          // Load from localStorage as fallback
          const storedProducts = localStorage.getItem('anvica_products');
          if (storedProducts) {
            const products = JSON.parse(storedProducts);
            setProducts(products);
            loadCategoriesFromProducts(products);
          }
        }
      }
    };

    initializeProducts();

    return () => {
      isMounted = false;
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const loadCategoriesFromProducts = (productsData) => {
    // Extract unique categories from all products
    const uniqueCategories = [...new Set(Object.values(productsData).map(p => p.category).filter(Boolean))];
    setCategories(uniqueCategories.sort());
  };

  const loadCategories = async () => {
    const allProducts = await getProducts();
    loadCategoriesFromProducts(allProducts);
  };

  const loadProducts = async () => {
    const allProducts = await getProducts();
    setProducts(allProducts);
    loadCategoriesFromProducts(allProducts);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Optimize image: compress and resize to match existing image properties
  const optimizeImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }

          // Create canvas to resize and compress
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          // Use high-quality image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };
        img.onerror = (error) => reject(error);
        img.src = e.target.result;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageProcessing(true);
    setError('');

    try {
      // Optimize and convert all images to base64 with consistent properties
      const optimizedImages = await Promise.all(
        files.map((file) => {
          // Validate file type
          if (!file.type.startsWith('image/')) {
            throw new Error(`Invalid file type: ${file.name}. Please upload image files only.`);
          }
          // Optimize image (resize, compress) to match existing image properties
          return optimizeImage(file);
        })
      );

      // Append new optimized images to existing ones
      const updatedImages = [...formData.images, ...optimizedImages];
      setImageFiles([...imageFiles, ...optimizedImages]);
      setFormData({ ...formData, images: updatedImages });
      setSuccess(`${files.length} image(s) added successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Error processing images. Please try again.');
      console.error(error);
    } finally {
      setImageProcessing(false);
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newFiles = imageFiles.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setImageFiles(newFiles);
  };

  const handleEdit = (productKey, product) => {
    setEditingProduct(productKey);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      images: product.images || [],
    });
    // Keep existing images (they might be URLs from imported assets or base64)
    setImageFiles([]);
    setError('');
    setSuccess('');
    setIsAddingNewCategory(false);
    setNewCategoryName('');
  };

  const handleAdd = () => {
    setIsAddingProduct(true);
    setFormData({
      name: '',
      price: '',
      category: '',
      description: '',
      images: [],
    });
    setImageFiles([]);
    setError('');
    setSuccess('');
    setIsAddingNewCategory(false);
    setNewCategoryName('');
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === '__add_new__') {
      setIsAddingNewCategory(true);
      setNewCategoryName('');
      setFormData({ ...formData, category: '' });
    } else {
      setIsAddingNewCategory(false);
      setFormData({ ...formData, category: value });
    }
  };

  const handleNewCategorySubmit = () => {
    if (!newCategoryName.trim()) {
      setError('Please enter a category name');
      return;
    }
    
    const trimmedCategory = newCategoryName.trim();
    
    // Check if category already exists
    if (categories.includes(trimmedCategory)) {
      setError('This category already exists');
      return;
    }

    // Add new category to the list
    const updatedCategories = [...categories, trimmedCategory].sort();
    setCategories(updatedCategories);
    
    // Set the form category to the new category
    setFormData({ ...formData, category: trimmedCategory });
    setIsAddingNewCategory(false);
    setNewCategoryName('');
    setError('');
    setSuccess('Category added successfully!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleCancelNewCategory = () => {
    setIsAddingNewCategory(false);
    setNewCategoryName('');
    setFormData({ ...formData, category: '' });
  };

  const handleDeleteCategory = async (categoryToDelete) => {
    // Check if any products are using this category
    const allProducts = await getProducts();
    const productsUsingCategory = Object.values(allProducts).filter(
      (p) => p.category === categoryToDelete
    );

    if (productsUsingCategory.length > 0) {
      setError(
        `Cannot delete category "${categoryToDelete}". ${productsUsingCategory.length} product(s) are using this category. Please change the category of those products first.`
      );
      setTimeout(() => setError(''), 5000);
      return;
    }

    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete the category "${categoryToDelete}"?`)) {
      return;
    }

    // Remove category from list
    const updatedCategories = categories.filter((cat) => cat !== categoryToDelete);
    setCategories(updatedCategories);

    // Clear form category if it was the deleted category
    if (formData.category === categoryToDelete) {
      setFormData({ ...formData, category: '' });
    }

    setSuccess(`Category "${categoryToDelete}" deleted successfully!`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setIsAddingProduct(false);
    setFormData({
      name: '',
      price: '',
      category: '',
      description: '',
      images: [],
    });
    setImageFiles([]);
    setError('');
    setSuccess('');
    setIsAddingNewCategory(false);
    setNewCategoryName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validation
      if (isAddingNewCategory && !newCategoryName.trim()) {
        setError('Please complete adding the new category or cancel and select an existing category');
        setLoading(false);
        return;
      }

      if (!formData.name || !formData.price || !formData.category || !formData.description) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (formData.images.length === 0) {
        setError('Please add at least one image');
        setLoading(false);
        return;
      }

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description,
        images: formData.images,
      };

      if (isAddingProduct) {
        // Add new product
        const productKey = generateProductKey(formData.name);
        const existingProducts = await getProducts();
        
        if (existingProducts[productKey]) {
          setError('A product with a similar name already exists. Please use a different name.');
          setLoading(false);
          return;
        }

        productData.id = productKey;
        const result = await addProduct(productKey, productData);
        if (result.success) {
          setSuccess('Product added successfully!');
          // Products will update automatically via real-time listener
          setTimeout(() => {
            handleCancel();
          }, 1500);
        } else {
          setError(result.error || 'Failed to add product');
        }
      } else {
        // Update existing product
        const result = await updateProduct(editingProduct, productData);
        if (result.success) {
          setSuccess('Product updated successfully!');
          // Products will update automatically via real-time listener
          setTimeout(() => {
            handleCancel();
          }, 1500);
        } else {
          setError(result.error || 'Failed to update product');
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productKey) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const result = await deleteProduct(productKey);
      if (result.success) {
        setSuccess('Product deleted successfully!');
        // Products will update automatically via real-time listener
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError(result.error || 'Failed to delete product');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {admin?.name || admin?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Add Product Button */}
        {!isAddingProduct && !editingProduct && (
          <div className="mb-6">
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <i className="fas fa-plus mr-2"></i>
              Add New Product
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {(isAddingProduct || editingProduct) && (
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isAddingProduct ? 'Add New Product' : 'Edit Product'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Product Name * <span className="text-red-500 text-xs font-normal">(Most Essential)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-primary-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg font-medium"
                    placeholder="Enter product name (e.g., Live Poultry (Adult))"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be the primary display name for the product</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₵) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  {!isAddingNewCategory ? (
                    <div>
                      <select
                        value={formData.category}
                        onChange={handleCategoryChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                        <option value="__add_new__">+ Add New Category</option>
                      </select>
                      {categories.length > 0 && (
                        <div className="mt-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Manage Categories:
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                              <span
                                key={category}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                              >
                                {category}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(category)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full p-0.5 transition-colors"
                                  title={`Delete category "${category}"`}
                                >
                                  <i className="fas fa-times text-xs"></i>
                                </button>
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Categories with products cannot be deleted
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Enter new category name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleNewCategorySubmit();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleNewCategorySubmit}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelNewCategory}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {isAddingNewCategory && (
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a new category name and click Add, or select an existing category
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={imageProcessing || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can select multiple images. Images will be automatically optimized (resized and compressed) to match existing image properties.
                  </p>
                  {imageProcessing && (
                    <p className="text-xs text-blue-600 mt-1">
                      <i className="fas fa-spinner fa-spin mr-1"></i>
                      Processing images...
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Preview
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : isAddingProduct ? 'Add Product' : 'Update Product'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        {!isAddingProduct && !editingProduct && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Products</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(products).map(([key, product]) => (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <i className="fas fa-image text-gray-400"></i>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">₵{product.price}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {product.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(key, product)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          <i className="fas fa-edit mr-1"></i>Edit
                        </button>
                        <button
                          onClick={() => handleDelete(key)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <i className="fas fa-trash mr-1"></i>Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;

