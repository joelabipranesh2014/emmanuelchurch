// Firebase configuration and initialization
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration from environment variables
// Note: PUBLIC_ prefix is required for Astro to expose these to the client-side
const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// Validate required environment variables
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn('⚠️  Firebase client configuration is missing. Please check your .env.local file.');
  console.warn('   Required variables: PUBLIC_FIREBASE_API_KEY, PUBLIC_FIREBASE_PROJECT_ID');
}

// Initialize Firebase (singleton pattern)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;

