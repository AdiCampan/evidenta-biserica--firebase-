// Script para cargar variables de entorno desde .env
require('dotenv').config();

// Verificar si se cargaron correctamente
const requiredEnvVars = [
  'VITE_API_KEY',
  'VITE_AUTH_DOMAIN',
  'VITE_PROJECT_ID',
  'VITE_STORAGE_BUCKET',
  'VITE_MESSAGING_SENDER_ID',
  'VITE_APP_ID',
  'VITE_DATABASE_URL'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Error: No se encontraron las siguientes variables en el archivo .env:', missingVars.join(', '));
  console.error('Por favor, asegúrate de que tu archivo .env contiene todas las variables necesarias.');
  process.exit(1);
} else {
  console.log('✅ Archivo .env cargado correctamente con todas las variables requeridas');
}