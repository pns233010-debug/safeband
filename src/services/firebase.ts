import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Read from Vite environment variables (prefixed with VITE_)
const resolvedProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'safeband-c2bb9';
const rawDbUrl =
  import.meta.env.VITE_FIREBASE_DATABASE_URL ||
  (resolvedProjectId ? `https://${resolvedProjectId}-default-rtdb.firebaseio.com` : '');
const resolvedDbUrl = rawDbUrl.trim().replace(/\/+$/, '');

const envConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${resolvedProjectId}.firebaseapp.com`,
  databaseURL: resolvedDbUrl,
  projectId: resolvedProjectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${resolvedProjectId}.firebasestorage.app`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Check if credentials are user-configured (not empty and not generic placeholder)
export const isFirebaseConfigured: boolean = Boolean(
  envConfig.apiKey &&
  envConfig.apiKey !== 'AIzaSyYourFirebaseApiKeyHere' &&
  envConfig.projectId &&
  envConfig.projectId !== 'safeband-project'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let rtdb: Database | null = null;

try {
  if (isFirebaseConfigured) {
    app = getApps().length > 0 ? getApp() : initializeApp(envConfig);
    auth = getAuth(app);
    rtdb = getDatabase(app, envConfig.databaseURL);
    console.info('[SafeBand Firebase] Connected to Realtime Database:', envConfig.databaseURL);
  } else {
    // Demo / Sandbox fallback: Initialize mock-safe Firebase app if possible or log notice
    console.warn(
      '[SafeBand Firebase] Environment variables not configured or using placeholders. Running in Local Simulation / Sandbox mode. Configure .env with your Firebase RTDB credentials to sync live with ESP32.'
    );
  }
} catch (error) {
  console.error('[SafeBand Firebase] Initialization error:', error);
}

export { app, auth, rtdb, envConfig };
