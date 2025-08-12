#!/usr/bin/env node

/**
 * Script para verificar si las variables de entorno están configuradas en GitHub Secrets
 * y diagnosticar problemas de despliegue
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICACIÓN DE GITHUB SECRETS');
console.log('=' .repeat(50));
console.log('');

// Variables requeridas
const VARIABLES_REQUERIDAS = {
  DESARROLLO: [
    'DEV_VITE_API_KEY',
    'DEV_VITE_AUTH_DOMAIN', 
    'DEV_VITE_PROJECT_ID',
    'DEV_VITE_STORAGE_BUCKET',
    'DEV_VITE_MESSAGING_SENDER_ID',
    'DEV_VITE_APP_ID',
    'DEV_VITE_DATABASE_URL',
    'DEV_VITE_ENCRYPTION_KEY',
    'DEV_SERVER_URL'
  ],
  PRODUCCION: [
    'PROD_VITE_API_KEY',
    'PROD_VITE_AUTH_DOMAIN',
    'PROD_VITE_PROJECT_ID', 
    'PROD_VITE_STORAGE_BUCKET',
    'PROD_VITE_MESSAGING_SENDER_ID',
    'PROD_VITE_APP_ID',
    'PROD_VITE_DATABASE_URL',
    'PROD_VITE_ENCRYPTION_KEY',
    'PROD_SERVER_URL'
  ],
  SERVICE_ACCOUNTS: [
    'FIREBASE_SERVICE_ACCOUNT_EVIDENTA_BISERICII',
    'FIREBASE_SERVICE_ACCOUNT_SECRETARIAT_EBENEZER'
  ]
};

// Función para verificar si gh CLI está instalado
function verificarGhCli() {
  try {
    execSync('gh --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Función para verificar autenticación con GitHub
function verificarAutenticacion() {
  try {
    const result = execSync('gh auth status', { stdio: 'pipe', encoding: 'utf8' });
    return result.includes('Logged in');
  } catch (error) {
    return false;
  }
}

// Función para obtener secretos de GitHub
function obtenerSecretos() {
  try {
    const result = execSync('gh secret list', { stdio: 'pipe', encoding: 'utf8' });
    return result.split('\n')
      .filter(line => line.trim())
      .map(line => line.split('\t')[0])
      .filter(name => name && name !== 'NAME');
  } catch (error) {
    console.log(`❌ Error obteniendo secretos: ${error.message}`);
    return [];
  }
}

// Función para verificar variables
function verificarVariables() {
  console.log('📋 Verificando configuración de GitHub Secrets...');
  console.log('');
  
  if (!verificarGhCli()) {
    console.log('❌ GitHub CLI (gh) no está instalado');
    console.log('   Instalar con: brew install gh');
    console.log('');
    return false;
  }
  
  if (!verificarAutenticacion()) {
    console.log('❌ No estás autenticado con GitHub CLI');
    console.log('   Ejecutar: gh auth login');
    console.log('');
    return false;
  }
  
  const secretos = obtenerSecretos();
  
  if (secretos.length === 0) {
    console.log('❌ No se pudieron obtener los secretos de GitHub');
    console.log('');
    return false;
  }
  
  console.log(`✅ Encontrados ${secretos.length} secretos en GitHub`);
  console.log('');
  
  let todosCorrecto = true;
  
  // Verificar variables de desarrollo
  console.log('🔧 VARIABLES DE DESARROLLO:');
  VARIABLES_REQUERIDAS.DESARROLLO.forEach(variable => {
    const existe = secretos.includes(variable);
    console.log(`   ${existe ? '✅' : '❌'} ${variable}`);
    if (!existe) todosCorrecto = false;
  });
  console.log('');
  
  // Verificar variables de producción
  console.log('🏭 VARIABLES DE PRODUCCIÓN:');
  VARIABLES_REQUERIDAS.PRODUCCION.forEach(variable => {
    const existe = secretos.includes(variable);
    console.log(`   ${existe ? '✅' : '❌'} ${variable}`);
    if (!existe) todosCorrecto = false;
  });
  console.log('');
  
  // Verificar service accounts
  console.log('🔑 SERVICE ACCOUNTS:');
  VARIABLES_REQUERIDAS.SERVICE_ACCOUNTS.forEach(variable => {
    const existe = secretos.includes(variable);
    console.log(`   ${existe ? '✅' : '❌'} ${variable}`);
    if (!existe) todosCorrecto = false;
  });
  console.log('');
  
  return todosCorrecto;
}

// Función para verificar últimos workflows
function verificarWorkflows() {
  console.log('🔄 Verificando últimos workflows...');
  console.log('');
  
  try {
    const result = execSync('gh run list --limit 3', { stdio: 'pipe', encoding: 'utf8' });
    const lines = result.split('\n').filter(line => line.trim());
    
    if (lines.length > 1) {
      console.log('📊 Últimas ejecuciones:');
      lines.slice(1, 4).forEach(line => {
        const parts = line.split('\t');
        if (parts.length >= 2) {
          const status = parts[0].trim();
          const title = parts[1].trim();
          const icon = status === '✓' ? '✅' : status === 'X' ? '❌' : '🔄';
          console.log(`   ${icon} ${title}`);
        }
      });
    }
    console.log('');
  } catch (error) {
    console.log(`❌ Error verificando workflows: ${error.message}`);
    console.log('');
  }
}

// Función para mostrar instrucciones
function mostrarInstrucciones(variablesCorrectas) {
  console.log('=' .repeat(50));
  
  if (variablesCorrectas) {
    console.log('🎉 TODAS LAS VARIABLES ESTÁN CONFIGURADAS');
    console.log('');
    console.log('Si el problema persiste:');
    console.log('1. Ejecutar: npm run diagnostico-entornos');
    console.log('2. Verificar logs de GitHub Actions en el navegador');
    console.log('3. Hacer un nuevo push para forzar deploy');
  } else {
    console.log('⚠️  FALTAN VARIABLES DE ENTORNO');
    console.log('');
    console.log('🛠️  PASOS PARA SOLUCIONARLO:');
    console.log('');
    console.log('1. Ir a GitHub → Settings → Secrets and variables → Actions');
    console.log('2. Agregar las variables marcadas con ❌');
    console.log('3. Obtener los valores de Firebase Console:');
    console.log('   - Desarrollo: https://console.firebase.google.com/project/evidenta-bisericii');
    console.log('   - Producción: https://console.firebase.google.com/project/secretariat-ebenezer');
    console.log('4. Para service accounts, generar nuevas claves JSON');
    console.log('');
    console.log('📖 Ver guía completa: docs/CONFIGURACION_GITHUB_SECRETS.md');
  }
  
  console.log('');
}

// Función principal
function main() {
  const variablesCorrectas = verificarVariables();
  verificarWorkflows();
  mostrarInstrucciones(variablesCorrectas);
}

// Ejecutar
main();