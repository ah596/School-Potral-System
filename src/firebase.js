import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


export const firebaseConfig = {
    apiKey: "AIzaSyCXM00b7kBiTzjXhwUUA-JJgBA2l8_AKcY",
    authDomain: "kgs-school-portal.firebaseapp.com",
    projectId: "kgs-school-portal",
    storageBucket: "kgs-school-portal.firebasestorage.app",
    messagingSenderId: "353001444028",
    appId: "1:353001444028:web:9c790f242d7b8c749d76b9",
    measurementId: "G-6PR7XZGXNL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

