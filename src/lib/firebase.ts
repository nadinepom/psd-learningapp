/**
 * Firebase-Konfiguration
 *
 * Die Werte kommen aus der .env-Datei (wird nicht ins Git eingecheckt).
 * Vorlage: .env.example
 *
 * So bekommst du deine Werte:
 * 1. Gehe zu https://console.firebase.google.com
 * 2. Erstelle ein neues Projekt (z. B. "psd-learningapp")
 * 3. Klicke auf das Web-Symbol </> um eine Web-App hinzuzufügen
 * 4. Kopiere die Werte in deine .env-Datei
 * 5. Aktiviere unter "Authentication" > "Sign-in method" die Option "Anonymous"
 * 6. Aktiviere unter "Firestore Database" eine neue Datenbank (Start im Testmodus)
 */
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Prüft ob die Werte ausgefüllt wurden – verhindert Abstürze während der Entwicklung
export const isFirebaseConfigured = !!firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('YOUR_');

export const app = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
