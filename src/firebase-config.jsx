import { initializeApp } from "firebase/app";
import {
  initializeFirestore, // Usamos esta función en lugar de getFirestore
  persistentLocalCache,
  persistentMultipleTabManager,
  Timestamp,
} from "@firebase/firestore";
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

// Inicializamos Firestore con la persistencia local y soporte para varias pestañas
const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

const db = getDatabase(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { firestore, db, storage, Timestamp, analytics };
export const auth = getAuth(app);

// import { initializeApp } from "firebase/app";
// import {
//   getFirestore,
//   Timestamp,
//   enableIndexedDbPersistence,
// } from "@firebase/firestore";
// import { getDatabase } from "firebase/database";
// import { getAuth } from "firebase/auth";
// import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_API_KEY,
//   authDomain: import.meta.env.VITE_AUTH_DOMAIN,
//   projectId: "evidenta-bisericii",
//   storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_APP_ID,
//   databaseURL: import.meta.env.VITE_DATABASE_URL,
// };

// const app = initializeApp(firebaseConfig);
// const firestore = getFirestore(app);
// const db = getDatabase(app);
// const storage = getStorage(app);
// const analytics = getAnalytics(app);

// // Habilitar la persistencia local en Firestore
// enableIndexedDbPersistence(firestore)
//   .then(() => {
//     console.log("Persistencia de Firestore habilitada");
//   })
//   .catch((err) => {
//     if (err.code === "failed-precondition") {
//       console.log(
//         "Persistencia fallida: solo puede estar habilitada en una pestaña a la vez"
//       );
//     } else if (err.code === "unimplemented") {
//       console.log(
//         "Persistencia no disponible: el navegador no soporta todas las características necesarias"
//       );
//     }
//   });

// export { firestore, db, storage, Timestamp, analytics };
// export const auth = getAuth(app);
