// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // ✅ ADD THIS

const firebaseConfig = {
   apiKey: process.env.NEXT_PUBLIC_PRIMARY_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_PRIMARY_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PRIMARY_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_PRIMARY_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_PRIMARY_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_PRIMARY_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_PRIMARY_FIREBASE_MEASUREMENT_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// ✅ ADD THESE TWO LINES
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider , app}; // ✅ MAKE SURE these are exported
