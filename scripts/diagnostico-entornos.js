#!/usr/bin/env node

/**
 * Script de Diagnóstico de Entornos
 * Verifica qué configuración está usando cada sitio web
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// URLs a verificar
const URLS = {
  desarrollo: 'https://evidenta-bisericii.web.app',
  produccion: 'https://secretariat-ebenezer.web.app'
};

// Configuraciones esperadas
const CONFIGURACIONES_ESPERADAS = {
  desarrollo: {
    projectId: 'evidenta-bisericii',
    authDomain: 'evidenta-bisericii.firebaseapp.com',
    databaseURL: 'https://evidenta-bisericii-default-rtdb.europe-west1.firebasedatabase.app'
  },
  produccion: {
    projectId: 'secretariat-ebenezer',
    authDomain: 'secretariat-ebenezer.firebaseapp.com',
    databaseURL: 'https://secretariat-ebenezer-default-rtdb.europe-west1.firebasedatabase.app'
  }
};

console.log('🔍 DIAGNÓSTICO DE ENTORNOS');
console.log('=' .repeat(50));
console.log('');

// Función para obtener configuración de un sitio
function obtenerConfiguracion(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          // Buscar configuración de Firebase en el HTML
          const configMatch = data.match(/window\.__FIREBASE_CONFIG__\s*=\s*({[^}]+})/)
            || data.match(/firebase\.initializeApp\(\s*({[^}]+})\s*\)/)
            || data.match(/firebaseConfig\s*=\s*({[^}]+})/);
          
          if (configMatch) {
            const config = JSON.parse(configMatch[1]);
            resolve(config);
          } else {
            // Buscar variables VITE en el código
            const viteMatches = {
              projectId: data.match(/VITE_PROJECT_ID["']?\s*:\s*["']([^"']+)["']/),
              authDomain: data.match(/VITE_AUTH_DOMAIN["']?\s*:\s*["']([^"']+)["']/),
              databaseURL: data.match(/VITE_DATABASE_URL["']?\s*:\s*["']([^"']+)["']/)
            };
            
            const config = {};
            Object.keys(viteMatches).forEach(key => {
              if (viteMatches[key]) {
                config[key] = viteMatches[key][1];
              }
            });
            
            if (Object.keys(config).length > 0) {
              resolve(config);
            } else {
              resolve({ error: 'No se encontró configuración de Firebase' });
            }
          }
        } catch (error) {
          resolve({ error: 'Error parseando configuración: ' + error.message });
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Función para verificar un entorno
async function verificarEntorno(nombre, url) {
  console.log(`📍 Verificando ${nombre.toUpperCase()}: ${url}`);
  
  try {
    const config = await obtenerConfiguracion(url);
    const esperada = CONFIGURACIONES_ESPERADAS[nombre];
    
    if (config.error) {
      console.log(`   ❌ Error: ${config.error}`);
      return false;
    }
    
    console.log(`   📋 Configuración encontrada:`);
    console.log(`      Project ID: ${config.projectId || 'No encontrado'}`);
    console.log(`      Auth Domain: ${config.authDomain || 'No encontrado'}`);
    console.log(`      Database URL: ${config.databaseURL || 'No encontrado'}`);
    
    // Verificar si es correcta
    const esCorrecta = 
      config.projectId === esperada.projectId &&
      config.authDomain === esperada.authDomain &&
      config.databaseURL === esperada.databaseURL;
    
    if (esCorrecta) {
      console.log(`   ✅ CORRECTO: Apunta al entorno de ${nombre}`);
      return true;
    } else {
      console.log(`   ❌ INCORRECTO: NO apunta al entorno de ${nombre}`);
      console.log(`   📋 Configuración esperada:`);
      console.log(`      Project ID: ${esperada.projectId}`);
      console.log(`      Auth Domain: ${esperada.authDomain}`);
      console.log(`      Database URL: ${esperada.databaseURL}`);
      
      // Detectar a qué entorno apunta realmente
      const apuntaAProduccion = 
        config.projectId === CONFIGURACIONES_ESPERADAS.produccion.projectId;
      const apuntaADesarrollo = 
        config.projectId === CONFIGURACIONES_ESPERADAS.desarrollo.projectId;
      
      if (apuntaAProduccion) {
        console.log(`   🔄 Está apuntando a PRODUCCIÓN`);
      } else if (apuntaADesarrollo) {
        console.log(`   🔄 Está apuntando a DESARROLLO`);
      } else {
        console.log(`   ❓ Está apuntando a un entorno desconocido`);
      }
      
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error conectando: ${error.message}`);
    return false;
  }
}

// Función principal
async function diagnosticar() {
  let todosCorrecto = true;
  
  for (const [nombre, url] of Object.entries(URLS)) {
    const correcto = await verificarEntorno(nombre, url);
    todosCorrecto = todosCorrecto && correcto;
    console.log('');
  }
  
  console.log('=' .repeat(50));
  
  if (todosCorrecto) {
    console.log('🎉 DIAGNÓSTICO: Todos los entornos están configurados correctamente');
  } else {
    console.log('⚠️  DIAGNÓSTICO: Hay problemas de configuración');
    console.log('');
    console.log('🛠️  POSIBLES SOLUCIONES:');
    console.log('   1. Verificar variables de entorno en GitHub Secrets');
    console.log('   2. Revisar logs de GitHub Actions');
    console.log('   3. Hacer un nuevo deploy manual');
    console.log('   4. Limpiar cache del navegador (Ctrl+F5)');
    console.log('');
    console.log('📖 Ver: docs/DIAGNOSTICO_GITHUB_ACTIONS.md');
  }
  
  console.log('');
}

// Ejecutar diagnóstico
diagnosticar().catch(console.error);