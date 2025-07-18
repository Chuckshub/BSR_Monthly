# Deployment Guide - Vercel

This guide will help you deploy the BalanceSheet Reconciler to Vercel with Firebase integration.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Firebase Project**: Set up at [Firebase Console](https://console.firebase.google.com)
3. **GitHub Repository**: Code should be pushed to GitHub (already done)

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name (e.g., "bsr-monthly")
4. Disable Google Analytics (not needed)
5. Click "Create project"

### 2. Enable Firestore
1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select a location (choose closest to your users)
5. Click "Done"

### 3. Configure Security Rules
1. In Firestore, go to "Rules" tab
2. Replace the default rules with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
3. Click "Publish"

**⚠️ Security Note**: These rules allow public access. For production use, implement proper security rules.

### 4. Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon (</>) to add a web app
4. Enter app nickname (e.g., "BSR Web App")
5. Don't check "Firebase Hosting"
6. Click "Register app"
7. Copy the configuration object - you'll need these values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

## Vercel Deployment

### 1. Connect Repository
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository (`BSR_Monthly`)
4. Select the repository and click "Import"

### 2. Configure Build Settings
Vercel should auto-detect Next.js settings:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. Add Environment Variables
In the Vercel deployment configuration, add these environment variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Replace the values** with your actual Firebase configuration from step 4 above.

### 4. Deploy
1. Click "Deploy"
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be available at the provided Vercel URL

## Post-Deployment

### 1. Test the Application
1. Visit your Vercel URL
2. Check that the app loads without errors
3. Test the "Chart of Accounts" tab - it should load default accounts
4. Test the "Monthly Reconciliation" tab - try entering some balances
5. Check browser console for any errors

### 2. Verify Firebase Connection
1. Go to your Firebase Console
2. Navigate to Firestore Database
3. You should see collections being created:
   - `charts/demo-user` (when accounts are loaded)
   - `reconciliations/demo-user_YYYY_M` (when balances are entered)

### 3. Custom Domain (Optional)
1. In Vercel dashboard, go to your project
2. Click "Domains" tab
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key | `AIzaSyC...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `my-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | `my-project-12345` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `my-project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | `1:123:web:abc123` |

## Troubleshooting

### Build Errors
- Check that all environment variables are set correctly
- Ensure Firebase project is properly configured
- Check Vercel build logs for specific error messages

### Runtime Errors
- Open browser developer tools and check console
- Verify Firebase security rules allow public access
- Check that Firestore is enabled in your Firebase project

### Data Not Persisting
- Verify environment variables are correct
- Check Firebase Console to see if data is being written
- Ensure Firestore security rules allow write access

## Security Considerations

⚠️ **Important**: This app is configured for demo purposes with public Firebase access. For production use:

1. Implement proper authentication
2. Create restrictive Firestore security rules
3. Add input validation and sanitization
4. Consider rate limiting
5. Monitor Firebase usage and costs

## Support

If you encounter issues:
1. Check the [GitHub repository](https://github.com/Chuckshub/BSR_Monthly) for updates
2. Review Vercel deployment logs
3. Check Firebase Console for errors
4. Ensure all environment variables are correctly set

---

**Deployment Complete!** 🎉

Your BalanceSheet Reconciler should now be live and accessible via your Vercel URL.