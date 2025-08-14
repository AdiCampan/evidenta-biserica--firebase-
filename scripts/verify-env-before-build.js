// Script para verificar variables de entorno antes del build en GitHub Actions
// Lee variables del archivo .env creado por GitHub Actions

const fs = require('fs');
const path = require('path');

const requiredEnvVars = [
  'VITE_API_KEY',
  'VITE_AUTH_DOMAIN',
  'VITE_PROJECT_ID',
  'VITE_STORAGE_BUCKET',
  'VITE_MESSAGING_SENDER_ID',
  'VITE_APP_ID',
  'VITE_DATABASE_URL'
];

console.log('🔍 Verificando variables de entorno para GitHub Actions...');

// Leer archivo .env si existe
const envPath = path.join(process.cwd(), '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
  console.log('📄 Leyendo archivo .env...');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key] = value;
      // También establecer en process.env para compatibilidad
      process.env[key] = value;
    }
  });
} else {
  console.log('⚠️  No se encontró archivo .env, usando process.env...');
}

let missingVars = [];
let formatErrors = [];

// Verificar presencia de variables
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    missingVars.push(varName);
  } else {
    console.log(`✅ ${varName}: ${process.env[varName].substring(0, 20)}...`);
  }
}

// Verificar formato de DATABASE_URL
if (process.env.VITE_DATABASE_URL) {
  const databaseURLRegex = /^https:\/\/[\w-]+-default-rtdb\.[\w-]+\.firebasedatabase\.app$/;
  if (!databaseURLRegex.test(process.env.VITE_DATABASE_URL)) {
    formatErrors.push(`VITE_DATABASE_URL tiene un formato incorrecto: ${process.env.VITE_DATABASE_URL}\nDebe tener el formato: https://<nombre-proyecto>-default-rtdb.<region>.firebasedatabase.app`);
  }
}

if (missingVars.length > 0) {
  console.error('❌ Error: Faltan variables de entorno requeridas:', missingVars.join(', '));
  console.error('\n📋 Variables disponibles en process.env:');
  Object.keys(process.env)
    .filter(key => key.startsWith('VITE_'))
    .forEach(key => console.error(`   ${key}: ${process.env[key] ? 'SET' : 'NOT SET'}`));
  process.exit(1);
} else if (formatErrors.length > 0) {
  console.error('❌ Error: Problemas con el formato de variables de entorno:');
  formatErrors.forEach(error => console.error(error));
  process.exit(1);
} else {
  console.log('✅ Todas las variables de entorno requeridas están presentes');
  console.log('✅ Todas las variables de entorno tienen el formato correcto');
  console.log('✅ Procediendo con el build...');
}