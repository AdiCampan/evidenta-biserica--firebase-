// Script para verificar variables de entorno antes del despliegue
const requiredEnvVars = [
  'VITE_API_KEY',
  'VITE_AUTH_DOMAIN',
  'VITE_PROJECT_ID',
  'VITE_STORAGE_BUCKET',
  'VITE_MESSAGING_SENDER_ID',
  'VITE_APP_ID',
  'VITE_DATABASE_URL'
];

let missingVars = [];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
}

if (missingVars.length > 0) {
  console.error('Error: Faltan variables de entorno requeridas:', missingVars.join(', '));
  process.exit(1);
} else {
  console.log('✅ Todas las variables de entorno requeridas están presentes');
  console.log('✅ Procediendo con el despliegue...');
}