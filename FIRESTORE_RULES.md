# Firestore Security Rules

Add these rules to your Firestore Database in Firebase Console:

1. Go to Firebase Console → Firestore Database → Rules
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products collection - readable by all, writable by authenticated admins
    match /products/{document=**} {
      allow read: if true; // Anyone can read products
      allow write: if request.auth != null; // Only authenticated users can write
    }
    
    // Admins collection - readable/writable only by the admin themselves
    match /admins/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish" to save the rules

