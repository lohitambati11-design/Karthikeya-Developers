import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    setDoc,
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBw6z69i56od2A4PObpydkWd8tOj77fqdY",
    authDomain: "nagarajukunta-phase-2.firebaseapp.com",
    projectId: "nagarajukunta-phase-2",
    storageBucket: "nagarajukunta-phase-2.firebasestorage.app",
    messagingSenderId: "974335170188",
    appId: "1:974335170188:web:cecde6396853dd0fc14da9",
    measurementId: "G-RQZKZ86HTS"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export {
    collection,
    getDocs,
    setDoc,
    doc,
    onSnapshot
};