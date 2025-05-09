// add-test-admins.js - Script para añadir administradores autorizados al entorno de prueba
const { initializeApp } = require('firebase/app');
const { collection, getDocs, addDoc, query, where, getFirestore } = require('firebase/firestore');

// Cargar variables de entorno
const { config } = require('dotenv');
const { expand } = require('dotenv-expand');
const path = require('path');

// Cargar el archivo .env.development para el entorno de prueba
const myEnv = config({ path: path.resolve(process.cwd(), '.env.development') });
expand(myEnv);

// Configuración de Firebase para el entorno de prueba
const firebaseConfig = {
  apiKey: process.env.VITE_API_KEY,
  authDomain: process.env.VITE_AUTH_DOMAIN,
  projectId: process.env.VITE_PROJECT_ID,
  storageBucket: process.env.VITE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_ID,
  measurementId: process.env.VITE_MEASUREMENT_ID,
  databaseURL: process.env.VITE_DATABASE_URL
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

/**
 * Esta función añade correos electrónicos específicos como administradores autorizados
 * para el entorno de prueba (test)
 */
async function addTestAdmins() {
  try {
    console.log('Añadiendo administradores autorizados para el entorno de prueba...');
    console.log(`Proyecto Firebase: ${process.env.VITE_PROJECT_ID}`);
    
    // Lista de correos a añadir como administradores
    const adminEmails = [
      'victor.calatayud.espinosa@gmail.com',
      'secretariatebenezercastellon@gmail.com',
      'adicampan1974@gmail.com'
    ];
    
    const authorizedCollection = collection(firestore, 'authorizedAdmins');
    
    // Procesar cada correo
    for (const email of adminEmails) {
      // Verificar si el correo ya existe
      const q = query(authorizedCollection, where('email', '==', email));
      const existingAdmin = await getDocs(q);
      
      if (existingAdmin.empty) {
        // Si no existe, añadirlo
        await addDoc(authorizedCollection, {
          email: email,
          createdAt: new Date(),
          isTestAdmin: true // Marcar como administrador de prueba
        });
        console.log(`✅ Administrador autorizado añadido: ${email}`);
      } else {
        console.log(`ℹ️ El administrador ${email} ya está autorizado`);
      }
    }
    
    console.log('✅ Proceso de añadir administradores de prueba completado');
    return true;
  } catch (error) {
    console.error('❌ Error al añadir administradores de prueba:', error);
    return false;
  }
}

// Ejecutar la función
addTestAdmins()
  .then(() => {
    console.log('Proceso finalizado.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error inesperado:', error);
    process.exit(1);
  });