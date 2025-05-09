// add-test-admins-admin-sdk.js - Script para añadir administradores autorizados al entorno de prueba usando Firebase Admin SDK
const admin = require('firebase-admin');
const path = require('path');
const { config } = require('dotenv');
const { expand } = require('dotenv-expand');

// Cargar variables de entorno
const myEnv = config({ path: path.resolve(process.cwd(), '.env.development') });
expand(myEnv);

// Ruta al archivo de credenciales de servicio (ajusta según sea necesario)
// IMPORTANTE: Debes generar este archivo desde la consola de Firebase
// Proyecto > Configuración > Cuentas de servicio > Generar nueva clave privada
const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');

// Inicializar Firebase Admin con credenciales de servicio
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    databaseURL: process.env.VITE_DATABASE_URL
  });
  console.log('✅ Firebase Admin SDK inicializado correctamente');
} catch (error) {
  console.error('❌ Error al inicializar Firebase Admin SDK:', error);
  console.error('Asegúrate de haber generado y descargado el archivo serviceAccountKey.json');
  process.exit(1);
}

const firestore = admin.firestore();

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
    
    const authorizedCollection = firestore.collection('authorizedAdmins');
    
    // Procesar cada correo
    for (const email of adminEmails) {
      // Verificar si el correo ya existe
      const snapshot = await authorizedCollection.where('email', '==', email).get();
      
      if (snapshot.empty) {
        // Si no existe, añadirlo
        await authorizedCollection.add({
          email: email,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
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