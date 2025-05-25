  import { initializeApp, getApp, getApps } from "firebase/app";
  import { getAuth } from "firebase/auth";
  import { getFirestore } from "firebase/firestore";
  import { getStorage } from "firebase/storage";

  // Secondary Firebase Config
  const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_SECONDARY_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_SECONDARY_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_SECONDARY_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_SECONDARY_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_SECONDARY_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_SECONDARY_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_SECONDARY_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_SECONDARY_FIREBASE_MEASUREMENT_ID

  };

  // Initialize Firebase
  const appName = "secondary"; // Unique name for secondary app

  let app;
  if (getApps().find((a) => a.name === appName)) {
    app = getApp(appName);
  } else {
    app = initializeApp(firebaseConfig, appName);
  }

  // Initialize services
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  export { auth, db, storage };