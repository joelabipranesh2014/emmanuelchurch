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

// Helper function to find service account key file
function findServiceAccountKey(): string | null {
  // Try environment variable first
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (envPath && existsSync(envPath)) {
    return resolve(envPath);
  }
  
  // Try default locations relative to project root
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = resolve(__filename, '..', '..', '..');
  const defaultPaths = [
    join(__dirname, 'firebase', 'firebase-admin-key.json'),
    join(__dirname, 'service-account-key.json'),
  ];
  
  for (const path of defaultPaths) {
    if (existsSync(path)) {
      return resolve(path);
    }
  }
  
  return null;
}

// Initialize Firebase Admin (singleton pattern)
let adminApp;
if (getApps().length === 0) {
  try {
    const serviceAccountPath = findServiceAccountKey();
    
    if (serviceAccountPath) {
      try {
        console.log(`✅ Loading Firebase Admin credentials from: ${serviceAccountPath}`);
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
        adminApp = initializeApp({
          credential: cert(serviceAccount),
          projectId: projectId,
          storageBucket: storageBucket,
        });
        console.log('✅ Firebase Admin SDK initialized successfully');
        console.log(`📦 Storage bucket configured: ${storageBucket}`);
        console.log(`💡 If you get bucket errors, ensure Firebase Storage is enabled in Firebase Console`);
      } catch (fileError: any) {
        console.error('❌ Error loading service account file:', fileError.message);
        throw new Error(`Failed to load service account key from ${serviceAccountPath}: ${fileError.message}`);
      }
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
    console.error('\nOption 1: Use .env.local file (Recommended):');
    console.error('  Create .env.local file in project root with:');
    console.error('  FIREBASE_PROJECT_ID=your-project-id');
    console.error('  FIREBASE_STORAGE_BUCKET=your-bucket-name');
    console.error('  GOOGLE_APPLICATION_CREDENTIALS=firebase/firebase-admin-key.json');
    console.error('  See .env.example for template');
    console.error('\nOption 2: Set environment variables manually:');
    console.error('  PowerShell: $env:GOOGLE_APPLICATION_CREDENTIALS="$PWD\\firebase\\firebase-admin-key.json"');
    console.error('  Then restart your dev server: npm run dev');
    console.error('\nOption 3: Place the key file in default location:');
    console.error('  - firebase/firebase-admin-key.json');
    console.error('\nOption 4: See FIREBASE_SETUP.md for detailed instructions');
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

