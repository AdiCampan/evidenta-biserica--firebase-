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

// Determinar el entorno actual de manera más robusta
const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';
console.log(`Entorno actual: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
console.log(`Valor de import.meta.env.MODE: ${import.meta.env.MODE}`);
console.log(`Valor de import.meta.env.PROD: ${import.meta.env.PROD}`);


// Configuración dinámica según el entorno
// Asegurarse de que las variables de entorno estén definidas
const getEnvVar = (key) => {
  const value = import.meta.env[key];
  if (!value) {
    console.error(`Error: La variable de entorno ${key} no está definida`);
    // Proporcionar un valor por defecto para evitar errores de inicialización
    return key === 'VITE_PROJECT_ID' ? 'evidenta-bisericii' : '';
  }
  return value;
};

const firebaseConfig = {
  apiKey: getEnvVar('VITE_API_KEY'),
  authDomain: getEnvVar('VITE_AUTH_DOMAIN'),
  projectId: getEnvVar('VITE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_STORAGE_BUCKET').replace('gs://', ''),
  messagingSenderId: getEnvVar('VITE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_APP_ID'),
  databaseURL: getEnvVar('VITE_DATABASE_URL'),
};

console.log('Configuración de Firebase:', JSON.stringify(firebaseConfig, null, 2));


console.log(`Conectando a Firebase: ${firebaseConfig.projectId}`);


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
