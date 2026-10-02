import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDocFromServer,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import firebaseLocalConfig from '../../firebase-applet-config.json';

// Explicit configuration for lumen-link-nfc-cards with environment override support
export const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseLocalConfig.projectId || 'lumen-link-nfc-cards',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseLocalConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseLocalConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseLocalConfig.authDomain || 'lumen-link-nfc-cards.firebaseapp.com',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseLocalConfig.storageBucket || 'lumen-link-nfc-cards.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseLocalConfig.messagingSenderId || '412619035711',
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseLocalConfig.firestoreDatabaseId || '(default)',
};

// Initialize Firebase App as a singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with auto-detect long polling and multi-tab persistent cache for rock-solid mobile and offline support
export const db = (() => {
  const databaseId =
    firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
      ? firebaseConfig.firestoreDatabaseId
      : undefined;

  try {
    return initializeFirestore(
      app,
      {
        experimentalAutoDetectLongPolling: true,
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      },
      databaseId
    );
  } catch {
    try {
      return initializeFirestore(
        app,
        {
          experimentalForceLongPolling: true,
        },
        databaseId
      );
    } catch {
      return databaseId ? getFirestore(app, databaseId) : getFirestore(app);
    }
  }
})();

// Initialize Firebase Auth
export const auth = getAuth(app);

/**
 * Utility function to retrieve Firebase core instances
 */
export function getFirebaseInstances() {
  return {
    app,
    db,
    auth,
    projectId: firebaseConfig.projectId,
  };
}

/**
 * Utility function to test active connection to Firestore
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log(`Firestore connection verified successfully for ${firebaseConfig.projectId}.`);
    return true;
  } catch (error) {
    console.warn('Firestore connection check notice:', error);
    return false;
  }
}

// Default export with instances and helpers
export default {
  app,
  db,
  auth,
  config: firebaseConfig,
  getFirebaseInstances,
  testFirestoreConnection,
};
