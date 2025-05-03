import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA-3mgx0UKRtVPG7tdwRoj1e_MBdPx5LJ4",
    authDomain: "quizoo-bd800.firebaseapp.com",
    projectId: "quizoo-bd800",
    storageBucket: "quizoo-bd800.firebasestorage.app",
    messagingSenderId: "196817234572",
    appId: "1:196817234572:web:4cefc7c5c3fe1ee72ea9a9",
    measurementId: "G-GJ3C3NGKFY"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);
export { auth };
