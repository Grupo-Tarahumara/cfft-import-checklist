import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyA0DVrVaoYYfAJfKBes1nrzE2ng1GT4ME0",
  authDomain: "checklist-93d62.firebaseapp.com",
  projectId: "checklist-93d62",
  storageBucket: "checklist-93d62.firebasestorage.app",
  messagingSenderId: "524103031921",
  appId: "1:524103031921:web:1faf721da77d1805208fd0",
  measurementId: "G-M15QW3CEJ9"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Cloud Messaging
let messaging: ReturnType<typeof getMessaging> | null = null;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

export { app, messaging, getToken, onMessage };
