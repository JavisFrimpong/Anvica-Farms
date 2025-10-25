import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper';
import { useCart } from '../context/CartContext';
// import type { Product } from '../types'; // optional - if you have a types file
import type { FC } from 'react';

// If you don't have a Product type, use `any` for now:
const ProductCard: FC<{ product: any }> = ({ product }) => {
  const { items, addToCart, removeFromCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const quantity = (items as any)[product.id] ?? 0;

  return (
    <div className="card p-6 hover:shadow-2xl transition-all duration-500">
      {/* Product Images Swiper */}
      <div className="relative mb-6">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation={true}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          className="rounded-xl overflow-hidden"
          onSlideChange={(swiper) => setCurrentImageIndex(swiper.activeIndex)}
        >
          {Array.isArray(product.images) && product.images.map((image: string, index: number) => (
            <SwiperSlide key={index}>
              <div className="relative h-64 bg-gray-200 rounded-xl overflow-hidden">
                  <img
                  src={image}
                  alt={`${product.name} - Image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://via.placeholder.com/500x400/2c5530/ffffff?text=${encodeURIComponent(
                        product.name || 'product'
                      )}`;
                  }}
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                  {index + 1}/{product.images.length}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Product Info */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-primary-600 mb-2 border-b-2 border-primary-100 pb-2">
          {product.category}
        </h3>
        <h4 className="text-xl font-semibold text-gray-800 mb-2">
          {product.name}
        </h4>
        <p className="text-gray-600 text-sm mb-4">
          {product.description}
        </p>
        <div className="text-2xl font-bold text-primary-600 mb-6">
          ₵{product.price.toLocaleString()}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => removeFromCart(product.id)}
            disabled={quantity === 0}
            className="quantity-btn"
          >
            <i className="fas fa-minus"></i>
          </button>
          
          <div className="bg-gray-100 rounded-full px-6 py-2 min-w-[60px]">
            <span className="text-xl font-bold text-primary-600">
              {quantity}
            </span>
          </div>
          
          <button
            onClick={() => addToCart(product.id)}
            className="quantity-btn"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>

        {/* Add to Cart Status */}
        {quantity > 0 && (
          <div className="mt-4 p-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium animate-slide-up">
            <i className="fas fa-check-circle mr-2"></i>
            {quantity} item{quantity > 1 ? 's' : ''} in cart
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

