#!/usr/bin/env node

/**
 * Script temporal para debuggear variables de desarrollo
 */

const fs = require('fs');
const path = require('path');

// Leer archivo .env si existe
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📋 Contenido del archivo .env:');
  console.log(envContent);
  console.log('\n' + '='.repeat(50));
  
  // Parsear variables
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  const vars = {};
  
  lines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      vars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  console.log('\n🔍 Variables parseadas:');
  console.log('PROJECT_ID:', vars.VITE_PROJECT_ID || 'NO ENCONTRADO');
  console.log('AUTH_DOMAIN:', vars.VITE_AUTH_DOMAIN || 'NO ENCONTRADO');
  console.log('DATABASE_URL:', vars.VITE_DATABASE_URL || 'NO ENCONTRADO');
  
  // Verificar si apunta a desarrollo o producción
  const projectId = vars.VITE_PROJECT_ID;
  if (projectId === 'evidenta-bisericii') {
    console.log('\n✅ Las variables apuntan a DESARROLLO');
  } else if (projectId === 'secretariat-ebenezer') {
    console.log('\n❌ Las variables apuntan a PRODUCCIÓN (ERROR)');
  } else {
    console.log('\n❓ Las variables apuntan a un entorno DESCONOCIDO');
  }
  
} else {
  console.log('❌ No se encontró archivo .env');
  console.log('Este script debe ejecutarse después de que GitHub Actions cree el archivo .env');
}