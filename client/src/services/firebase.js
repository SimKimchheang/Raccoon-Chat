import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBIBGX2jWuzlPdLUNUGlWhtQMMC3tgctmY",
  authDomain: "raccoon-9bf56.firebaseapp.com",
  projectId: "raccoon-9bf56",
  storageBucket: "raccoon-9bf56.firebasestorage.app",
  messagingSenderId: "99240764081",
  appId: "1:99240764081:web:851a0a4f48594505cfb890",
  measurementId: "G-8NCQBD1Q74"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);