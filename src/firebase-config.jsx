import { initializeApp } from "firebase/app";
import { getFirestore, Timestamp } from "@firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: "evidenta-bisericii",
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  databaseURL: import.meta.env.VITE_DATABASE_URL,
};
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const db = getDatabase(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { firestore, db, storage, Timestamp, analytics };

export const auth = getAuth(app);
