import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyB1TkJoTM02SBsDSvB0zFLDgculptobX9k",
  authDomain: "choki-app.firebaseapp.com",
  projectId: "choki-app",
  storageBucket: "choki-app.firebasestorage.app",
  messagingSenderId: "1046631547148",
  appId: "1:1046631547148:web:d0deb3506f29c253604929",
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
