// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA7JWhu7KGLQDDGNk6raGed_XrZqalDAJk",
  authDomain: "health-e-patient.firebaseapp.com",
  projectId: "health-e-patient",
  storageBucket: "health-e-patient.appspot.com",
  messagingSenderId: "1078546752605",
  appId: "1:1078546752605:web:f3165f3c1b956f0f3999b4",
  measurementId: "G-TWSJMRZW4R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

// Export function that initializes Firebase
export const initFirebase = () => {
  return app;
}
