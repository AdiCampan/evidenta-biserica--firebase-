// createAdmin.js - Script para crear un usuario administrador
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, collection } from 'firebase/firestore';
import { auth, firestore } from '../firebase-config';

/**
 * Crea un usuario administrador con el correo electrónico especificado
 * @param {string} email - Correo electrónico del administrador
 * @param {string} password - Contraseña del administrador
 * @returns {Promise<Object>} - Objeto con información del usuario creado
 */
export const createAdminUser = async (email, password) => {
  try {
    // 1. Crear el usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 2. Actualizar el perfil del usuario
    await updateProfile(user, {
      displayName: 'Administrador'
    });
    
    // 3. Crear un documento en la colección 'userRoles' para almacenar el rol
    await setDoc(doc(firestore, 'userRoles', user.uid), {
      email: user.email,
      role: 'admin',
      createdAt: new Date(),
      displayName: 'Administrador'
    });
    
    console.log('Usuario administrador creado exitosamente:', user.email);
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        role: 'admin'
      }
    };
  } catch (error) {
    console.error('Error al crear usuario administrador:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Ejemplo de uso:
// Para usar este script, importa la función y llámala con el correo y contraseña
// import { createAdminUser } from './scripts/createAdmin';
// createAdminUser('victor.calatayud.espinosa@gmail.com', 'contraseña_segura');