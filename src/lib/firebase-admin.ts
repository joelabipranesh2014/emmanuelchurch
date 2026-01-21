// Firebase Admin SDK for server-side operations
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

// Firebase project configuration from environment variables
const projectId = process.env.FIREBASE_PROJECT_ID || "emmanuel-church-e7274";
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;

// Helper function to get service account credentials
function getServiceAccountCredentials(): any | null {
  // Option 1: Check for JSON string in environment variable (for Vercel/deployment)
  const envKeyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (envKeyJson) {
    try {
      console.log('✅ Loading Firebase Admin credentials from FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
      return JSON.parse(envKeyJson);
    } catch (error: any) {
      console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error.message);
      return null;
    }
  }

  // Option 2: Try environment variable pointing to file path
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (envPath && existsSync(envPath)) {
    try {
      console.log(`✅ Loading Firebase Admin credentials from: ${envPath}`);
      return JSON.parse(readFileSync(envPath, 'utf-8'));
    } catch (error: any) {
      console.error(`❌ Error reading file from GOOGLE_APPLICATION_CREDENTIALS:`, error.message);
      return null;
    }
  }
  
  // Option 3: Try default file locations relative to project root
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = resolve(__filename, '..', '..', '..');
  const defaultPaths = [
    join(__dirname, 'firebase', 'firebase-admin-key.json'),
    join(__dirname, 'service-account-key.json'),
  ];
  
  for (const path of defaultPaths) {
    if (existsSync(path)) {
      try {
        console.log(`✅ Loading Firebase Admin credentials from: ${path}`);
        return JSON.parse(readFileSync(path, 'utf-8'));
      } catch (error: any) {
        console.error(`❌ Error reading file ${path}:`, error.message);
        continue;
      }
    }
  }
  
  return null;
}

// Initialize Firebase Admin (singleton pattern)
let adminApp;
if (getApps().length === 0) {
  try {
    const serviceAccount = getServiceAccountCredentials();
    
    if (serviceAccount) {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: projectId,
        storageBucket: storageBucket,
      });
      console.log('✅ Firebase Admin SDK initialized successfully');
      console.log(`📦 Storage bucket configured: ${storageBucket}`);
      console.log(`💡 If you get bucket errors, ensure Firebase Storage is enabled in Firebase Console`);
    } else {
      // Try Application Default Credentials (works on Google Cloud or if gcloud is configured)
      console.warn('⚠️  No service account key found, trying Application Default Credentials...');
      adminApp = initializeApp({
        projectId: projectId,
        storageBucket: storageBucket,
      });
    }
  } catch (error: any) {
    console.error('\n❌ Failed to initialize Firebase Admin SDK');
    console.error('Error:', error.message);
    console.error('\n📋 To fix this, you need to set up Firebase Admin credentials:');
    console.error('\nOption 1: Use environment variable (For Vercel/Deployment):');
    console.error('  Set FIREBASE_SERVICE_ACCOUNT_KEY with the full JSON content');
    console.error('  (Copy entire contents of firebase-admin-key.json as a single line)');
    console.error('\nOption 2: Use .env.local file (For Local Development):');
    console.error('  Create .env.local file in project root with:');
    console.error('  FIREBASE_PROJECT_ID=your-project-id');
    console.error('  FIREBASE_STORAGE_BUCKET=your-bucket-name');
    console.error('  GOOGLE_APPLICATION_CREDENTIALS=firebase/firebase-admin-key.json');
    console.error('\nOption 3: Set environment variables manually:');
    console.error('  PowerShell: $env:GOOGLE_APPLICATION_CREDENTIALS="$PWD\\firebase\\firebase-admin-key.json"');
    console.error('  Then restart your dev server: npm run dev');
    console.error('\nOption 4: Place the key file in default location:');
    console.error('  - firebase/firebase-admin-key.json');
    console.error('\nOption 5: See FIREBASE_SETUP.md or DEPLOYMENT_GUIDE.md for detailed instructions');
    throw error;
  }
} else {
  adminApp = getApps()[0];
}

// Initialize Firestore Admin
export const db = getFirestore(adminApp);

// Initialize Storage Admin
export const storage = getStorage(adminApp);

export default adminApp;

