import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Configuration provided by user
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB1TkJoTM02SBsDSvB0zFLDgculptobX9k",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "choki-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "choki-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "choki-app.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1046631547148",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1046631547148:web:d0deb3506f29c253604929",
  measurementId: "G-8MNWVHYKX1"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Fallback to undefined to prevent crash, though app won't work fully
  // We can't really recover if init fails.
}

export { auth, db };
export default app!;
