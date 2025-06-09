// add-production-admins-admin-sdk.js - Script para añadir administradores autorizados al entorno de producción usando Firebase Admin SDK
const admin = require('firebase-admin');
const path = require('path');

// Ruta al archivo de credenciales de servicio
const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');

// Inicializar Firebase Admin con credenciales de servicio
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    databaseURL: "https://secretariat-ebenezer.firebaseio.com"
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
 * para el entorno de producción
 */
async function addProductionAdmins() {
  try {
    console.log('Añadiendo administradores autorizados para el entorno de producción...');
    console.log(`Proyecto Firebase: secretariat-ebenezer`);
    
    // Lista de correos a añadir como administradores
    const adminEmails = [
      'victor.calatayud.espinosa@gmail.com',
      'secretariatebenezercastellon@gmail.com',
      'adicampan1974@gmail.com',
      'cristiandinica38@gmail.com'
      // Añade aquí más correos si es necesario
    ];
    
    const authorizedCollection = firestore.collection('authorizedAdmins');
    const usersCollection = firestore.collection('users');
    const tempPassword = 'Admin2025!'; // Contraseña temporal
    
    // Procesar cada correo
    for (const email of adminEmails) {
      // 1. Verificar si ya está en authorizedAdmins
      const adminSnapshot = await authorizedCollection.where('email', '==', email).get();
      
      if (adminSnapshot.empty) {
        // Añadir a authorizedAdmins
        await authorizedCollection.add({
          email: email,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isProductionAdmin: true
        });
        console.log(`✅ Administrador autorizado añadido: ${email}`);
      } else {
        console.log(`ℹ️ El administrador ${email} ya está autorizado`);
      }
      
      // 2. Verificar si existe como usuario en Authentication
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(email);
        console.log(`ℹ️ Usuario ya existe en Authentication: ${email}`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Crear usuario en Authentication
          userRecord = await admin.auth().createUser({
            email: email,
            password: tempPassword,
            emailVerified: true
          });
          console.log(`✅ Usuario creado en Authentication: ${email}`);
          
          // Opcional: enviar correo de restablecimiento de contraseña
          await admin.auth().generatePasswordResetLink(email);
          console.log(`✉️ Enlace de restablecimiento enviado a: ${email}`);
        }
      }
      
      // Establecer custom claims para privilegios de administrador
      if (userRecord) {
        await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
        console.log(`✅ Custom claims (admin: true) establecidos para: ${email}`);
      }
      
      // 3. Añadir o actualizar en colección users
      await usersCollection.doc(email).set({
        email: email,
        roles: ['admin', 'user'],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      console.log(`✅ Información de usuario guardada en Firestore: ${email}`);
    }
    
    console.log('✅ Proceso completo: administradores añadidos y usuarios creados');
    return true;
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
    console.error(error.stack);
    return false;
  }
}

// Ejecutar la función
addProductionAdmins()
  .then(() => {
    console.log('Proceso finalizado.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error inesperado:', error);
    process.exit(1);
  });
