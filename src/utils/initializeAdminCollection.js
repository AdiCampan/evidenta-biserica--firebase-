// Script para inicializar la colección de administradores autorizados en Firestore
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { firestore } from '../firebase-config';

/**
 * Esta función verifica si existe la colección 'authorizedAdmins' y si está vacía,
 * añade el correo electrónico del administrador por defecto.
 * Debe ejecutarse al iniciar la aplicación para garantizar que siempre haya al menos un administrador autorizado.
 */
export const initializeAuthorizedAdmins = async () => {
  try {
    // Verificar si la colección existe y tiene documentos
    const authorizedCollection = collection(firestore, 'authorizedAdmins');
    const snapshot = await getDocs(authorizedCollection);
    
    // Si la colección está vacía, añadir el administrador por defecto
    if (snapshot.empty) {
      console.log('Inicializando colección de administradores autorizados...');
      
      // Añadir el correo del administrador por defecto
      const defaultAdmin = 'victor.calatayud.espinosa@gmail.com';
      
      // Verificar si el correo ya existe (por si acaso)
      const q = query(authorizedCollection, where('email', '==', defaultAdmin));
      const existingAdmin = await getDocs(q);
      
      if (existingAdmin.empty) {
        await addDoc(authorizedCollection, {
          email: defaultAdmin,
          createdAt: new Date(),
          isDefault: true // Marcar como administrador por defecto
        });
        console.log('Administrador por defecto añadido correctamente');
      }
    } else {
      console.log('La colección de administradores autorizados ya está inicializada');
    }
  } catch (error) {
    console.error('Error al inicializar la colección de administradores:', error);
  }
};

export default initializeAuthorizedAdmins;