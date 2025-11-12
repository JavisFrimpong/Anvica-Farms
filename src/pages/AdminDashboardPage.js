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

  // -------------------- FIRESTORE PRODUCT LOADING --------------------
  useEffect(() => {
    let isMounted = true;
    let unsubscribe = null;

    const initializeProducts = async () => {
      try {
        // Migrate products to Firestore on first load
        const migrationResult = await migrateProductsToFirestore();
        if (migrationResult.success && migrationResult.migrated) {
          console.log('✅ Products migrated to Firestore');
        }

        // Load products initially
        if (isMounted) {
          await loadProducts();
        }

        // Subscribe to Firestore real-time updates
        if (isMounted) {
          unsubscribe = subscribeToProducts((updatedProducts) => {
            if (isMounted) {
              setProducts(updatedProducts);
              loadCategoriesFromProducts(updatedProducts);
            }
          });
        }
      } catch (err) {
        console.error('Error loading products from Firebase:', err);
        if (isMounted) setError('Failed to load products. Please check your connection.');
      }
    };

    initializeProducts();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadProducts = async () => {
    const allProducts = await getProducts();
    setProducts(allProducts);
    loadCategoriesFromProducts(allProducts);
  };

  const loadCategoriesFromProducts = (productsData) => {
    const uniqueCategories = [
      ...new Set(
        Object.values(productsData)
          .map((p) => p.category)
          .filter(Boolean)
      ),
    ];
    setCategories(uniqueCategories.sort());
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // -------------------- IMAGE OPTIMIZATION --------------------
  const optimizeImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.85) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };
        img.onerror = (error) => reject(error);
        img.src = e.target.result;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setImageProcessing(true);
    setError('');

    try {
      const optimizedImages = await Promise.all(
        files.map((file) => {
          if (!file.type.startsWith('image/')) {
            throw new Error(`Invalid file type: ${file.name}`);
          }
          return optimizeImage(file);
        })
      );

      const updatedImages = [...formData.images, ...optimizedImages];
      setImageFiles([...imageFiles, ...optimizedImages]);
      setFormData({ ...formData, images: updatedImages });
      setSuccess(`${files.length} image(s) added successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error processing images.');
      console.error(err);
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

  // -------------------- PRODUCT ADD / EDIT --------------------
  const handleEdit = (productKey, product) => {
    setEditingProduct(productKey);
    setFormData({ ...product });
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

    const trimmed = newCategoryName.trim();
    if (categories.includes(trimmed)) {
      setError('This category already exists');
      return;
    }

    const updatedCategories = [...categories, trimmed].sort();
    setCategories(updatedCategories);
    setFormData({ ...formData, category: trimmed });
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
    const allProducts = await getProducts();
    const used = Object.values(allProducts).filter((p) => p.category === categoryToDelete);
    if (used.length > 0) {
      setError(`Cannot delete "${categoryToDelete}" as ${used.length} product(s) use it.`);
      setTimeout(() => setError(''), 5000);
      return;
    }

    if (!window.confirm(`Delete category "${categoryToDelete}"?`)) return;
    setCategories(categories.filter((c) => c !== categoryToDelete));
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
      if (isAddingNewCategory && !newCategoryName.trim()) {
        setError('Complete adding new category or cancel.');
        setLoading(false);
        return;
      }

      if (!formData.name || !formData.price || !formData.category || !formData.description) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (!formData.images.length) {
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
        const productKey = generateProductKey(formData.name);
        const existing = await getProducts();
        if (existing[productKey]) {
          setError('Product name already exists.');
          setLoading(false);
          return;
        }
        productData.id = productKey;
        const result = await addProduct(productKey, productData);
        if (result.success) {
          setSuccess('Product added successfully!');
          setTimeout(() => handleCancel(), 1500);
        } else {
          setError(result.error || 'Failed to add product');
        }
      } else {
        const result = await updateProduct(editingProduct, productData);
        if (result.success) {
          setSuccess('Product updated successfully!');
          setTimeout(() => handleCancel(), 1500);
        } else {
          setError(result.error || 'Failed to update product');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productKey) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const result = await deleteProduct(productKey);
      if (result.success) {
        setSuccess('Product deleted successfully!');
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError(result.error || 'Failed to delete product');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };

  // -------------------- JSX --------------------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
        {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{success}</div>}

        {/* ADD PRODUCT BUTTON */}
        {!isAddingProduct && !editingProduct && (
          <div className="mb-6">
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <i className="fas fa-plus mr-2"></i>Add New Product
            </button>
          </div>
        )}

        {/* FORM */}
        {(isAddingProduct || editingProduct) && (
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
            {/* Form JSX remains same as your original code */}
            {/* ... */}
          </div>
        )}

        {/* PRODUCTS TABLE */}
        {!isAddingProduct && !editingProduct && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Products</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(products).map(([key, product]) => (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <i className="fas fa-image text-gray-400"></i>
                          </div>
                        )}
                      </td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>₵{product.price}</td>
                      <td className="truncate max-w-xs">{product.description}</td>
                      <td>
                        <button onClick={() => handleEdit(key, product)} className="text-primary-600 hover:text-primary-900 mr-2">Edit</button>
                        <button onClick={() => handleDelete(key)} className="text-red-600 hover:text-red-900">Delete</button>
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
