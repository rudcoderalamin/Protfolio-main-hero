import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc, getDoc, collection, addDoc, getDocs, query, orderBy, deleteDoc, updateDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase client
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use the provisioned Firestore database ID
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export { doc, onSnapshot, setDoc, getDoc, collection, addDoc, getDocs, query, orderBy, deleteDoc, updateDoc };
