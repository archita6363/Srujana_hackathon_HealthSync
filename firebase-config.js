// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCL1crs6TFPLZLZR607kBU1UHkYrGaCxmU",
  authDomain: "healthsync-7263e.firebaseapp.com",
  projectId: "healthsync-7263e",
  storageBucket: "healthsync-7263e.firebasestorage.app",
  messagingSenderId: "769113656753",
  appId: "1:769113656753:web:f80edc9673615912d44190",
  measurementId: "G-76VLXE3GQT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);