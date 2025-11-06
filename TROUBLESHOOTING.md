# Troubleshooting Guide

## Common Issues and Solutions

### 1. Accounts Not Showing in Firebase Console

**Check Firebase Authentication:**
- Go to Firebase Console → Authentication → Users
- Accounts appear here when created
- If you don't see accounts, check:
  - Email/Password provider is enabled in Authentication → Sign-in method
  - Environment variables are set correctly in Vercel

**Check Firestore Database:**
- Go to Firebase Console → Firestore Database
- Look for `admins` collection
- Each document ID is the user's UID
- If empty, check Firestore security rules (see FIRESTORE_RULES.md)

### 2. Products Not Syncing Across Devices

**Check Firestore:**
- Go to Firebase Console → Firestore Database
- Look for `products` collection → `all_products` document
- Products should be stored here

**Check Browser Console:**
- Open browser DevTools (F12)
- Look for console messages:
  - ✅ Firebase initialized successfully
  - ✅ Products loaded from Firestore
  - ❌ Error messages (report these)

**Check Firestore Security Rules:**
- Must allow read access to products
- Must allow write access for authenticated users
- See FIRESTORE_RULES.md for correct rules

### 3. Environment Variables in Vercel

**How to Add:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable:
   - REACT_APP_FIREBASE_API_KEY
   - REACT_APP_FIREBASE_AUTH_DOMAIN
   - REACT_APP_FIREBASE_PROJECT_ID
   - REACT_APP_FIREBASE_STORAGE_BUCKET
   - REACT_APP_FIREBASE_MESSAGING_SENDER_ID
   - REACT_APP_FIREBASE_APP_ID
3. **IMPORTANT:** Redeploy after adding variables
4. Check that all variables are set for "Production" environment

### 4. Firebase Console Setup Checklist

**Authentication:**
- [ ] Go to Authentication → Sign-in method
- [ ] Enable "Email/Password" provider
- [ ] Save changes

**Firestore Database:**
- [ ] Go to Firestore Database
- [ ] Create database (if not exists)
- [ ] Choose "Start in production mode" (we'll add rules)
- [ ] Go to Rules tab
- [ ] Copy rules from FIRESTORE_RULES.md
- [ ] Click "Publish"

**Get Firebase Config:**
- [ ] Go to Project Settings → General
- [ ] Scroll to "Your apps"
- [ ] Click on Web app (or create one)
- [ ] Copy the config values
- [ ] Add to Vercel environment variables

### 5. Debugging Steps

1. **Open Browser Console** (F12)
2. **Check for Firebase initialization:**
   - Should see: "✅ Firebase initialized successfully"
   - If not: Check environment variables

3. **Check for errors:**
   - Look for ❌ or Error messages
   - Note the error code and message

4. **Test Authentication:**
   - Try creating a new account
   - Check console for: "✅ User created in Firebase Auth"
   - Check Firebase Console → Authentication → Users

5. **Test Products:**
   - Add/edit a product
   - Check console for: "✅ Products synced to Firestore successfully"
   - Check Firebase Console → Firestore → products collection

### 6. Common Error Codes

**auth/invalid-api-key:**
- Environment variables not set correctly
- Check Vercel environment variables

**permission-denied:**
- Firestore security rules too restrictive
- Update rules (see FIRESTORE_RULES.md)

**unavailable:**
- Firebase not initialized
- Check environment variables

**network-request-failed:**
- Internet connection issue
- Firebase service temporarily down

