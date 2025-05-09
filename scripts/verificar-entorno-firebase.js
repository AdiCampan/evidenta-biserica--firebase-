/**
 * Script para verificar la configuración de Firebase antes de iniciar la aplicación
 * Este script comprueba que todas las variables de entorno necesarias estén presentes
 * y muestra información sobre el entorno activo (desarrollo o producción)
 */

const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Determinar el modo de ejecución (development o production)
const mode = process.env.NODE_ENV || 'development';
const envFile = `.env.${mode}`;

// Cargar variables de entorno según el modo
const result = dotenv.config({ path: envFile });

if (result.error) {
  console.error(`\x1b[31m[ERROR] No se pudo cargar el archivo ${envFile}\x1b[0m`);
  console.error('Asegúrate de que el archivo existe y tiene el formato correcto.');
  process.exit(1);
}

// Variables requeridas para Firebase
const requiredVars = [
  'VITE_API_KEY',
  'VITE_AUTH_DOMAIN',
  'VITE_DATABASE_URL',
  'VITE_PROJECT_ID',
  'VITE_STORAGE_BUCKET',
  'VITE_MESSAGING_SENDER_ID',
  'VITE_APP_ID'
];

// Verificar que todas las variables requeridas estén presentes
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('\x1b[31m[ERROR] Faltan las siguientes variables de entorno:\x1b[0m');
  missingVars.forEach(varName => console.error(`- ${varName}`));
  process.exit(1);
}

// Verificar el formato de VITE_DATABASE_URL
const databaseUrl = process.env.VITE_DATABASE_URL;
if (!databaseUrl.match(/^https:\/\/[\w-]+\.firebaseio\.com$/)) {
  console.error('\x1b[31m[ERROR] El formato de VITE_DATABASE_URL es incorrecto\x1b[0m');
  console.error('Debe tener el formato: https://nombre-proyecto.firebaseio.com');
  console.error(`Valor actual: ${databaseUrl}`);
  process.exit(1);
}

// Mostrar información sobre el entorno activo
console.log('\x1b[32m=== CONFIGURACIÓN DE FIREBASE ===\x1b[0m');
console.log(`\x1b[36mEntorno: \x1b[33m${mode.toUpperCase()}\x1b[0m`);
console.log(`\x1b[36mProyecto: \x1b[33m${process.env.VITE_PROJECT_ID}\x1b[0m`);
console.log(`\x1b[36mBase de datos: \x1b[33m${process.env.VITE_DATABASE_URL}\x1b[0m`);
console.log('\x1b[32m===============================\x1b[0m');

console.log('\x1b[32m[OK] Configuración de Firebase verificada correctamente\x1b[0m');