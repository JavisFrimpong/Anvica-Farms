# Anvica Farms - React Poultry Website

A modern, responsive React website for Anvica Farms poultry business with Tailwind CSS styling and Formspree integration.

## Features

- 🐔 **Product Catalog**: Live chickens, dressed chicken, fresh eggs, and small chickens
- 🖼️ **Image Galleries**: Swipeable image galleries for each product (4+ images per product)
- 🛒 **Shopping Cart**: Add/remove items with quantity controls
- 📱 **Fully Responsive**: Works perfectly on desktop, tablet, and mobile
- 💰 **Cedis Currency**: All prices displayed in Ghana Cedis (₵)
- 📞 **Contact Information**: Welcome section with phone and location details
- 📋 **Order Management**: Complete order flow from cart to submission
- 📧 **Formspree Integration**: Order submission via Formspree forms
- 🎨 **Modern UI**: Beautiful design with Tailwind CSS

## Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase (Optional but Recommended)**
   - Go to [Firebase Console](https://console.firebase.google.com) and create a new project
   - Enable Authentication (Email/Password provider)
   - Create a Firestore database
   - Go to Project Settings > General > Your apps
   - Add a web app and copy the configuration values
   - Create a `.env` file in the root directory:
     ```env
     REACT_APP_FIREBASE_API_KEY=your_api_key_here
     REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
     REACT_APP_FIREBASE_PROJECT_ID=your_project_id
     REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     REACT_APP_FIREBASE_APP_ID=your_app_id
     ```
   - **Note**: If Firebase is not configured, the app will use localStorage-based authentication as a fallback

3. **Configure Formspree**
   - Go to [Formspree.io](https://formspree.io) and create a new form
   - Copy your form ID
   - Replace `YOUR_FORM_ID` in `src/components/FormspreeOrderForm.js` with your actual form ID

4. **Start Development Server**
   ```bash
   npm start
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── Navbar.js              # Navigation bar with logo and cart
│   ├── ProductCard.js         # Product cards with image galleries
│   ├── WelcomeSection.js     # Welcome section with contact info
│   └── FormspreeOrderForm.js # Formspree integration
├── context/
│   └── CartContext.js        # Cart state management
├── data/
│   └── products.js           # Product data and contact info
├── pages/
│   ├── HomePage.js           # Main homepage
│   ├── CartPage.js           # Shopping cart
│   ├── CheckoutPage.js       # Order summary
│   ├── DetailsPage.js        # Customer details form
│   ├── PreviewPage.js        # Order preview
│   └── SuccessPage.js        # Order confirmation
├── App.js                    # Main app component
├── index.js                  # React entry point
└── index.css                 # Tailwind CSS styles
```

## Key Features Explained

### Product Image Galleries
- Each product has 4+ high-quality images
- Swipeable galleries using Swiper.js
- Auto-play functionality
- Responsive design

### Cart Management
- Persistent cart using localStorage
- Cart only clears after successful order submission
- Real-time quantity updates
- Total price calculations

### Formspree Integration
- Order data sent to Formspree
- Includes customer details and order items
- Automatic email notifications
- Error handling for failed submissions

### Responsive Design
- Mobile-first approach
- Tailwind CSS for styling
- Touch-friendly interactions
- Optimized for all screen sizes

## Customization

### Adding New Products
Edit `src/data/products.js` to add new products:

```javascript
'new-product': {
  id: 'new-product',
  name: 'Product Name',
  price: 100,
  category: 'Category',
  description: 'Product description',
  images: [
    'image1.jpg',
    'image2.jpg',
    'image3.jpg',
    'image4.jpg'
  ]
}
```

### Updating Contact Information
Edit `src/data/products.js` contactInfo object:

```javascript
export const contactInfo = {
  phone: '+233 24 123 4567',
  location: 'Kumasi, Ashanti Region, Ghana',
  email: 'info@anvicafarms.com'
};
```

### Styling Changes
- Modify `tailwind.config.js` for theme customization
- Update `src/index.css` for custom styles
- Use Tailwind utility classes throughout components

## Deployment

### Netlify
1. Build the project: `npm run build`
2. Deploy the `build` folder to Netlify
3. Configure Formspree endpoint

### Vercel
1. Connect your GitHub repository to Vercel
2. Vercel will automatically build and deploy
3. Add Firebase environment variables in Vercel project settings:
   - Go to Settings > Environment Variables
   - Add all `REACT_APP_FIREBASE_*` variables from your `.env` file
   - Redeploy after adding variables

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License
This project is created for Anvica Farms. All rights reserved.

## Support
For support or questions, contact Anvica Farms at +233 24 123 4567 or info@anvicafarms.com
