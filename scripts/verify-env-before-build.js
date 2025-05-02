// Script para verificar variables de entorno antes del build en GitHub Actions
require('dotenv').config();

const requiredEnvVars = [
  'VITE_API_KEY',
  'VITE_AUTH_DOMAIN',
  'VITE_PROJECT_ID',
  'VITE_STORAGE_BUCKET',
  'VITE_MESSAGING_SENDER_ID',
  'VITE_APP_ID',
  'VITE_DATABASE_URL'
];

console.log('Verificando variables de entorno para GitHub Actions...');
let missingVars = [];
let formatErrors = [];

// Verificar presencia de variables
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
}

// Verificar formato específico de VITE_DATABASE_URL
if (process.env.VITE_DATABASE_URL) {
  const databaseURLRegex = /^https:\/\/[\w-]+\.firebaseio\.com$/;
  if (!databaseURLRegex.test(process.env.VITE_DATABASE_URL)) {
    formatErrors.push(`VITE_DATABASE_URL tiene un formato incorrecto: ${process.env.VITE_DATABASE_URL}\nDebe tener el formato: https://<nombre-proyecto>.firebaseio.com`);
  }
}

if (missingVars.length > 0) {
  console.error('Error: Faltan variables de entorno requeridas:', missingVars.join(', '));
  process.exit(1);
} else if (formatErrors.length > 0) {
  console.error('Error: Problemas con el formato de variables de entorno:');
  formatErrors.forEach(error => console.error(`- ${error}`));
  console.error('\nSugerencia: Verifica que VITE_DATABASE_URL sea exactamente https://evidenta-bisericii.firebaseio.com');
  process.exit(1);
} else {
  console.log('✅ Todas las variables de entorno requeridas están presentes');
  console.log('✅ Todas las variables de entorno tienen el formato correcto');
  console.log('✅ Procediendo con el build...');
}