import { initializeApp } from "@firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "@firebase/auth";
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "firebase/storage";
import { FIREBASE_API_KEY } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "smartrecipeassistant.firebaseapp.com",
  projectId: "smartrecipeassistant",
  storageBucket: "smartrecipeassistant.appspot.com",
  messagingSenderId: "360667604691",
  appId: "1:360667604691:web:d12f279bd86f1738955626",
  measurementId: "G-HWYT7M933V",
};

// initialize Firebase App
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// initialize Firebase Auth for that app immediately
initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { app, getAuth, db, storage };
