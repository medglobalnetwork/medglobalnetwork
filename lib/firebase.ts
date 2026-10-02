// ============================================================
// Firebase Client Initialization & Phone Auth Provider
// lib/firebase.ts
// ============================================================

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult, type Auth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAW9yizJTVn1d7tbj8DVGCPVH9wpgEqfHo",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "medglobalnetwork.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "medglobalnetwork",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "medglobalnetwork.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "241814547071",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:241814547071:web:b539e467e30614e94bad4a",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-0ZGTQJFTP4",
};

// Initialize or get existing Firebase App singleton
export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

// Get Firebase Auth instance
export function getFirebaseAuth(): Auth {
  const app = getFirebaseApp();
  return getAuth(app);
}

export { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult };
