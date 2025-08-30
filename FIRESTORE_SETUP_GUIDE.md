# 🔥 Firestore Connection Troubleshooting Guide

## 🚨 Current Issue: Cannot Connect to Firestore

### **Step 1: Verify Firebase Project Setup**

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: "referral-rating-app"
3. **Check if Firestore is enabled**:
   - Go to "Firestore Database" in the left sidebar
   - If you see "Get started" button, click it to create the database
   - Choose a location (preferably close to your users)
   - Start in test mode (we'll add security rules later)

### **Step 2: Update google-services.json**

Your current `google-services.json` might be outdated. Here's how to get the latest one:

1. **In Firebase Console**:
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click on your Android app
   - Download the new `google-services.json`
   - Replace the file in `android/app/google-services.json`

### **Step 3: Enable Firestore in Firebase Console**

1. **Navigate to Firestore Database**:
   - Click "Firestore Database" in the left sidebar
   - Click "Create database"
   - Choose "Start in test mode" (we'll add security rules later)
   - Select a location (choose the closest to your users)

### **Step 4: Deploy Security Rules**

1. **In Firestore Database**:
   - Click on the "Rules" tab
   - Replace the default rules with our custom rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anonymous users to read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth == null && resource.data.userId == userId;
      allow create: if request.auth == null;
    }
    
    match /user_filters/{userId} {
      allow read, write: if request.auth == null && resource.data.userId == userId;
      allow create: if request.auth == null;
    }
    
    match /search_history/{docId} {
      allow read, write: if request.auth == null && resource.data.userId == request.resource.data.userId;
      allow create: if request.auth == null;
    }
    
    match /user_locations/{userId} {
      allow read, write: if request.auth == null && resource.data.userId == userId;
      allow create: if request.auth == null;
    }
    
    match /referred_places/{docId} {
      allow read, write: if request.auth == null && resource.data.userId == request.resource.data.userId;
      allow create: if request.auth == null;
    }
    
    match /device_mappings/{deviceFingerprint} {
      allow read, write: if request.auth == null;
    }
    
    // Allow test connections
    match /test_connection/{docId} {
      allow read, write: if request.auth == null;
    }
    
    // Default rule - deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

2. **Click "Publish"** to deploy the rules

### **Step 5: Test the Connection**

1. **Add the test component to your app temporarily**:
   ```javascript
   import SimpleFirestoreTest from './src/components/examples/SimpleFirestoreTest';
   
   // Add this to your main screen or App.js temporarily
   <SimpleFirestoreTest />
   ```

2. **Run the test** and check the console for detailed error messages

### **Step 6: Common Issues and Solutions**

#### **Issue 1: "Firestore is not enabled"**
- **Solution**: Enable Firestore in Firebase Console as described in Step 3

#### **Issue 2: "Permission denied"**
- **Solution**: Deploy the security rules as described in Step 4

#### **Issue 3: "Project not found"**
- **Solution**: Update your `google-services.json` file as described in Step 2

#### **Issue 4: "Network error"**
- **Solution**: Check your internet connection and try again

#### **Issue 5: "Version mismatch"**
- **Solution**: We already fixed this by updating to version 23.1.1

### **Step 7: Verify Everything is Working**

After completing the above steps:

1. **Clean and rebuild your app**:
   ```bash
   cd android && ./gradlew clean
   cd .. && npx react-native run-android
   ```

2. **Run the SimpleFirestoreTest component**
3. **Check the console for success messages**
4. **If successful, remove the test component**

### **Step 8: Next Steps**

Once Firestore is working:

1. **Remove the test components** from your app
2. **Start using the Firebase Store service** for your app features
3. **Monitor the Firebase Console** for usage and errors

## 📞 Need Help?

If you're still having issues:

1. **Check the console logs** for specific error messages
2. **Verify your Firebase project ID** matches in all places
3. **Make sure you're using the correct API key**
4. **Try the test component** to isolate the issue

## ✅ Success Indicators

You'll know Firestore is working when:

- ✅ The SimpleFirestoreTest shows "Firestore connection successful!"
- ✅ No error messages in the console
- ✅ You can see data in the Firebase Console
- ✅ Your app can read and write data without errors
