// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_URL,
  authDomain: "spiral-stake.firebaseapp.com",
  projectId: "spiral-stake",
  storageBucket: "spiral-stake.firebasestorage.app",
  messagingSenderId: "1008653200380",
  appId: "1:1008653200380:web:df14844a8dbff432de2079",
  measurementId: "G-0P3X3EB7EX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
const db = getFirestore(app);

export { db };
