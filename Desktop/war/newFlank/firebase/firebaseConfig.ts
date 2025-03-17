import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'; 

const firebaseConfig = {
  apiKey: "AIzaSyCv8X0ffIIFeXB9RUD8FCX6KSlU0kfyIgQ",
  authDomain: "moscow-9cace.firebaseapp.com",
  projectId: "moscow-9cace",
  storageBucket: "moscow-9cace.firebasestorage.app",
  messagingSenderId: "559409167719",
  appId: "1:559409167719:web:a855cfe6dbc6122cd8c3c2",
  measurementId: "G-JEDXGYLZ6J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth, RecaptchaVerifier, signInWithPhoneNumber, app };