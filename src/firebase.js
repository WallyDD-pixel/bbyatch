import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// Optionnel : analytics si tu veux suivre les stats
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDNrT9xiUIO4yp9A1Tu6KaNkeFQ5ZG-iN8",
  authDomain: "bbyatch-917c3.firebaseapp.com",
  projectId: "bbyatch-917c3",
  storageBucket: "bbyatch-917c3.firebasestorage.app",
  messagingSenderId: "486528597916",
  appId: "1:486528597916:web:14566ff227aecfa007d259",
  measurementId: "G-BJ47W4Z9EC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
// Optionnel : exporte analytics si besoin
export const analytics = getAnalytics(app);