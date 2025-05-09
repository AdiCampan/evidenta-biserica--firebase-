// addTestAdmins.js - Script para añadir administradores autorizados al entorno de prueba
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { firestore } from '../firebase-config';

/**
 * Esta función añade correos electrónicos específicos como administradores autorizados
 * para el entorno de prueba (test)
 */
export const addTestAdmins = async () => {
  try {
    console.log('Añadiendo administradores autorizados para el entorno de prueba...');
    
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
        console.log(`Administrador autorizado añadido: ${email}`);
      } else {
        console.log(`El administrador ${email} ya está autorizado`);
      }
    }
    
    console.log('Proceso de añadir administradores de prueba completado');
    return {
      success: true,
      message: 'Administradores de prueba añadidos correctamente'
    };
  } catch (error) {
    console.error('Error al añadir administradores de prueba:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Para ejecutar este script directamente:
// import { addTestAdmins } from './scripts/addTestAdmins';
// addTestAdmins();