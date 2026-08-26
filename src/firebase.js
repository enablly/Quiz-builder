import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use the specific firestoreDatabaseId configured in firebase-applet-config.json
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

export { doc, onSnapshot, setDoc, updateDoc, serverTimestamp };
