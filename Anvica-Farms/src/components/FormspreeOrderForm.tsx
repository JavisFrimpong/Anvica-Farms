import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';

const FormspreeOrderForm = ({ onSubmit }: { onSubmit?: (payload: any) => void }) => {
  const { getItemsList, customerDetails, getTotalPrice } = useCart();
  const items = getItemsList();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build cart items with product metadata
  const cartItems = items.map((it) => {
    const p = products[it.id as keyof typeof products];
    return {
      ...p,
      quantity: it.quantity,
    };
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderData = {
        customerName: customerDetails?.name ?? '',
        customerPhone: customerDetails?.phone ?? '',
        customerLocation: customerDetails?.location ?? '',
        orderItems: cartItems.map((item) => ({
          product: item.name,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        })),
        totalAmount: getTotalPrice(),
        orderDate: new Date().toLocaleString(),
        currency: 'GHS',
      };

      // Submit to Formspree (swap form ID if needed)
      const response = await fetch('https://formspree.io/f/xqaynnbj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        if (onSubmit) onSubmit(orderData);
      } else {
        throw new Error('Failed to submit order');
      }
    } catch (err) {
      console.error('Error submitting order:', err);
      alert('There was an error submitting your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="_subject" value="New Order from Anvica Farms" />
      <input type="hidden" name="_replyto" value={customerDetails?.phone || ''} />

      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-primary-600 mb-4">Order Summary</h3>
        <div className="space-y-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.name} (x{item.quantity})
              </span>
              <span>₵{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t pt-2 font-bold">
            <div className="flex justify-between">
              <span>Total:</span>
              <span>₵{getTotalPrice().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-primary-600 mb-4">Customer Details</h3>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Name:</strong> {customerDetails?.name}
          </div>
          <div>
            <strong>Phone:</strong> {customerDetails?.phone}
          </div>
          <div>
            <strong>Location:</strong> {customerDetails?.location}
          </div>
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-success w-full">
        {isSubmitting ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Submitting Order...
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
