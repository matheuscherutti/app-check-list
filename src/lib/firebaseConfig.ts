import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    // Use VITE_ prefix for Vite environment variables
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'dummy_api_key',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'dummy_auth_domain',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'dummy_project_id',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'dummy_bucket',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'dummy_sender',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || 'dummy_app_id'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
