// runAddTestAdmins.js - Script para ejecutar la adición de administradores de prueba
import { addTestAdmins } from './addTestAdmins';

// Función autoejecutable para añadir los administradores de prueba
(async () => {
  console.log('Iniciando proceso para añadir administradores al entorno de prueba...');
  
  try {
    const result = await addTestAdmins();
    
    if (result.success) {
      console.log('✅ ' + result.message);
    } else {
      console.error('❌ Error: ' + result.error);
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
  
  console.log('Proceso finalizado.');
})();