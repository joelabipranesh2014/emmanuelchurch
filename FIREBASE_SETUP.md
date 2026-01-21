# Firebase Setup Instructions

## Prerequisites

1. **Enable Firestore Database** in Firebase Console:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `emmanuel-church-e7274`
   - Go to **Firestore Database** in the left menu
   - Click **Create Database**
   - Choose **Start in test mode** (for development) or configure security rules
   - Select a location for your database

2. **Enable Firebase Storage** (if not already enabled):
   - Go to **Storage** in Firebase Console
   - Click **Get Started**
   - Start in test mode or configure security rules
   - Choose a location (preferably same as Firestore)

## Firebase Admin SDK Setup

For server-side operations, Firebase Admin SDK is used. You have two options:

### Option 1: Application Default Credentials (Recommended for Production)

If deploying to Google Cloud Platform, Firebase Admin SDK will automatically use Application Default Credentials.

### Option 2: Service Account Key (For Local Development)

**Quick Setup (Recommended):**

Run the setup script:
- **Windows PowerShell**: `.\setup-firebase-credentials.ps1`
- **Linux/Mac**: `bash setup-firebase-credentials.sh`

**Manual Setup:**

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click **Generate New Private Key**
3. Save the JSON file securely (DO NOT commit to git)
4. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   ```
   Or on Windows PowerShell:
   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account-key.json"
   ```
   
   **To make it permanent on Windows:**
   ```powershell
   [System.Environment]::SetEnvironmentVariable('GOOGLE_APPLICATION_CREDENTIALS', 'C:\path\to\service-account-key.json', 'User')
   ```

### Option 3: Initialize with Service Account Key File (Alternative)

If you prefer to use a service account key file directly, update `src/lib/firebase-admin.ts`:

```typescript
import { initializeApp, cert } from 'firebase-admin/app';
import serviceAccount from './path/to/service-account-key.json';

const adminApp = initializeApp({
  credential: cert(serviceAccount as any),
  projectId: "emmanuel-church-e7274",
  storageBucket: "emmanuel-church-e7274.firebasestorage.app",
});
```

**Note**: Make sure to add `service-account-key.json` to `.gitignore`!

## Security Rules

### Firestore Rules

Update your Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to sermons
    match /sermons/{document=**} {
      allow read: if true;
      allow write: if request.auth != null; // Require authentication for writes
    }
    
    // Allow read access to song PDFs
    match /songPdfs/{document=**} {
      allow read: if true;
      allow write: if request.auth != null; // Require authentication for writes
    }
  }
}
```

### Storage Rules

Update your Storage security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /song-pdfs/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null; // Require authentication for uploads
    }
  }
}
```

## Testing

After setup, test the API endpoints:

1. Start the dev server: `npm run dev`
2. Test GET `/api/sermons` - should return empty array `[]` initially
3. Test POST `/api/sermons` - should create a new sermon
4. Test GET `/api/song-pdfs` - should return empty array `[]` initially

## Troubleshooting

### Error: "NOT_FOUND" (Code: 5)

This means Firestore database is not enabled. Follow **Prerequisites** step 1 above.

### Error: "Permission denied" or Authentication errors

- Check that Firestore and Storage are enabled
- Verify security rules allow the operations you're trying to perform
- For Admin SDK, ensure credentials are properly configured

### Error: "Failed to initialize Firebase Admin"

- Ensure `firebase-admin` is installed: `npm install firebase-admin`
- Check that credentials are set up correctly (see Option 2 above)

