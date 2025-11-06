import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { getProducts, subscribeToProducts } from '../services/productService';

const FormspreeOrderForm = ({ onSubmit }) => {
  const { items, customerDetails, getTotalPrice } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState({});

  // Load products and listen for real-time updates
  useEffect(() => {
    const loadProducts = async () => {
      const allProducts = await getProducts();
      setProducts(allProducts);
    };
    
    loadProducts();
    
    // Set up real-time listener for products
    const unsubscribe = subscribeToProducts((updatedProducts) => {
      setProducts(updatedProducts);
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 🧠 Build clean cart list
  const cartItems = Object.entries(items).map(([productKey, quantity]) => {
    const productFromKey = products[productKey];
    const productById = Object.values(products).find((p) => p.id === productKey);
    const product = productFromKey || productById || null;

    return {
      id: product ? (product.id ?? productKey) : productKey,
      name: product ? product.name : 'Unknown product',
      quantity,
    };
  });

  // 🧾 Handle submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 🕒 Format current date and time (with day name)
      const now = new Date();
      const dayName = now.toLocaleDateString('en-GB', { weekday: 'long' });
      const formattedDate = now.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      const fullDate = `${dayName}, ${formattedDate}`;

      // 🧩 Build human-friendly email body
      const intro = `Hello Anvica Farms,\r\nPlease find my order details below:\r\n\r\n`;

      const customerInfo =
        `Name: ${customerDetails?.name || 'N/A'}\r\n` +
        `Phone: ${customerDetails?.phone || 'N/A'}\r\n` +
        `Location: ${customerDetails?.location || 'N/A'}\r\n` +
        `Date & Time: ${fullDate}\r\n`;

      // 🧾 Add numbering if more than one product
      const orderItemsText = cartItems
        .map(
          (item, index) =>
            `${cartItems.length > 1 ? `${index + 1}. ` : ''}${item.name}\r\nQuantity: ${item.quantity}`
        )
        .join('\r\n\r\n');

      const totalText = `\r\n\r\nThank you.`;

      const finalText = intro + orderItemsText + totalText;

      // 🧠 Prepare FormData
      const formData = new FormData();
      const customerName = customerDetails?.name || 'Customer';

      // ✅ Add the custom email subject
      formData.append('_subject', `Order from ${customerName} from Anvica Farms website`);

      formData.append('Name', customerDetails?.name || '');
      formData.append('Phone Number', customerDetails?.phone || '');
      formData.append('Location', customerDetails?.location || '');
      formData.append('Order Details', finalText);
      formData.append('Total Amount', `GH₵${getTotalPrice().toLocaleString()}`);
      formData.append('Date', fullDate);

      // 🚀 Send
      const response = await fetch('https://formspree.io/f/xqaynnbj', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });

      if (response.ok) {
        console.log('Order submitted successfully');
        onSubmit();
      } else {
        const errorText = await response.text();
        console.error('Formspree error:', errorText);
        throw new Error('Formspree rejected submission');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('There was an error submitting your order. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 🧾 Order Summary */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-primary-600 mb-4">Order Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2 font-semibold">Product</th>
                <th className="text-center p-2 font-semibold">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <tr key={item.id}>
                  <td className="p-2">{item.name}</td>
                  <td className="text-center p-2">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-bold">
                <td className="p-2">Total Amount:</td>
                <td className="text-center p-2">GH₵{getTotalPrice().toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 👤 Customer Details */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-primary-600 mb-4">Customer Details</h3>
        <div className="space-y-2 text-sm">
          <div><strong>Name:</strong> {customerDetails?.name}</div>
          <div><strong>Phone:</strong> {customerDetails?.phone}</div>
          <div><strong>Location:</strong> {customerDetails?.location}</div>
        </div>
      </div>

      {/* ✅ Submit */}
      <button type="submit" disabled={isSubmitting} className="btn-success w-full">
        {isSubmitting ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>Submitting Order...
          </>
        ) : (
          <>
            Submit Order <i className="fas fa-check ml-2"></i>
          </>
        )}
      </button>
    </form>
  );
};

export default FormspreeOrderForm;
