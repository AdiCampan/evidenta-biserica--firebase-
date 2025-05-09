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
                    isTestAdmin: true
                });
                console.log(`✅ Administrador autorizado añadido: ${email}`);
            } else {
                console.log(`ℹ️ El administrador ${email} ya está autorizado`);
            }
            
            // 2. Verificar si existe como usuario en Authentication
            try {
                const userRecord = await admin.auth().getUserByEmail(email);
                console.log(`ℹ️ Usuario ya existe en Authentication: ${email}`);
            } catch (error) {
                if (error.code === 'auth/user-not-found') {
                    // Crear usuario en Authentication
                    await admin.auth().createUser({
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