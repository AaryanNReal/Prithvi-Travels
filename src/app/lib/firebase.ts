// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // ✅ ADD THIS

const firebaseConfig = {
  apiKey: "AIzaSyBmmVS6bpeMW9UyYMPHV7yOczlid7krb00",
  authDomain: "pruthvi-travels-6d10a.firebaseapp.com",
  projectId: "pruthvi-travels-6d10a",
  storageBucket: "pruthvi-travels-6d10a.firebasestorage.app",
  messagingSenderId: "1066483473483",
  appId: "1:1066483473483:web:07ec9b6e61fcd1f6c001ce",
  measurementId: "G-YCEVPRPPZH"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// ✅ ADD THESE TWO LINES
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider , app}; // ✅ MAKE SURE these are exported
