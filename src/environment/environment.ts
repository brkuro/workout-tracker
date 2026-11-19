// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCvggLM3a6i0kiRJykzp1VYSjl2orXEvho",
  authDomain: "ironlog-tracker.firebaseapp.com",
  projectId: "ironlog-tracker",
  storageBucket: "ironlog-tracker.firebasestorage.app",
  messagingSenderId: "677527117436",
  appId: "1:677527117436:web:338b2f47f3f6dd52f133f9",
  measurementId: "G-DVJV2VQX63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);