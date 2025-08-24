// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyASOYZU9OI454p5t9obtZP3mkA6ncawCBw",
  authDomain: "eventify-5e54d.firebaseapp.com",
  projectId: "eventify-5e54d",
  storageBucket: "eventify-5e54d.firebasestorage.app",
  messagingSenderId: "1035518806464",
  appId: "1:1035518806464:web:c5fb9df49b319cd639a025",
  measurementId: "G-0ZC704LYMG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Set auth persistence
setPersistence(auth, browserLocalPersistence);

// Enable verbose Firestore logging for debugging
setLogLevel('debug');

console.log('Firebase initialized successfully');
