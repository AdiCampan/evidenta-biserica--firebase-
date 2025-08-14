import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Timestamp,
} from "@firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Determinamos el entorno
const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';

// Función para obtener variables de entorno con valores por defecto seguros
const getEnvVar = (key, defaultValue = '') => {
  const value = import.meta.env[key];
  if (!value && defaultValue === '') {
    console.warn(`Advertencia: La variable ${key} no está definida`);
  }
  return value || defaultValue;
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

if (isProduction) {
  console.log('Ejecutando en producción');
} else {
  console.log('Ejecutando en desarrollo');
  console.log('Configuración:', JSON.stringify(firebaseConfig, null, 2));
}

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Inicializamos Firestore con persistencia
const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

const db = getDatabase(app);
const storage = getStorage(app);
const analytics = isProduction ? getAnalytics(app) : null;

// Exportamos todo usando sintaxis ESM
export { firestore, db, storage, Timestamp, analytics };
export const auth = getAuth(app);

// Exportación por defecto alternativa
export default app;