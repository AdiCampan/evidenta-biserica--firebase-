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
    console.log(`   🔍 Conectando a: ${url}`);
    const request = https.get(url, (response) => {
      console.log(`   📡 Respuesta HTTP: ${response.statusCode}`);
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          console.log(`   📄 HTML recibido: ${data.length} caracteres`);
          // Buscar el archivo JavaScript principal
          const jsMatch = data.match(/src="\/assets\/(index-[^"]+\.js)"/);          
          if (jsMatch) {
            const jsUrl = `${url}/assets/${jsMatch[1]}`;
            console.log(`   🔗 Archivo JS encontrado: ${jsUrl}`);
            // Obtener el archivo JavaScript
            obtenerArchivoJS(jsUrl).then(resolve).catch(reject);
          } else {
            console.log(`   ❌ No se encontró patrón de archivo JS en HTML`);
            console.log(`   📝 Primeros 500 caracteres del HTML:`);
            console.log(`   ${data.substring(0, 500)}...`);
            resolve({ error: 'No se encontró archivo JavaScript principal' });
          }
        } catch (error) {
          console.log(`   ❌ Error parseando HTML: ${error.message}`);
          resolve({ error: 'Error parseando HTML: ' + error.message });
        }
      });
    });
    
    request.on('error', (error) => {
      console.log(`   ❌ Error de conexión: ${error.message}`);
      reject(error);
    });
    
    request.setTimeout(15000, () => {
      console.log(`   ⏰ Timeout después de 15 segundos`);
      request.destroy();
      reject(new Error('Timeout conectando al sitio'));
    });
  });
}

// Función para obtener y analizar el archivo JavaScript
function obtenerArchivoJS(jsUrl) {
  return new Promise((resolve, reject) => {
    console.log(`   📥 Descargando JS: ${jsUrl}`);
    const request = https.get(jsUrl, (response) => {
      console.log(`   📡 Respuesta JS HTTP: ${response.statusCode}`);
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          console.log(`   📄 JavaScript recibido: ${data.length} caracteres`);
          // Buscar project IDs en el código compilado
          const tieneEvidenta = data.includes('evidenta-bisericii');
          const tieneSecretariat = data.includes('secretariat-ebenezer');
          
          console.log(`   🔍 Análisis del código:`);
          console.log(`      - Contiene 'evidenta-bisericii': ${tieneEvidenta}`);
          console.log(`      - Contiene 'secretariat-ebenezer': ${tieneSecretariat}`);
          
          let config = {};
          
          if (tieneEvidenta && !tieneSecretariat) {
            // Solo desarrollo
            config = {
              projectId: 'evidenta-bisericii',
              authDomain: 'evidenta-bisericii.firebaseapp.com',
              databaseURL: 'https://evidenta-bisericii-default-rtdb.europe-west1.firebasedatabase.app'
            };
            console.log(`   ✅ Configuración de desarrollo detectada`);
          } else if (tieneSecretariat && !tieneEvidenta) {
            // Solo producción
            config = {
              projectId: 'secretariat-ebenezer',
              authDomain: 'secretariat-ebenezer.firebaseapp.com',
              databaseURL: 'https://secretariat-ebenezer-default-rtdb.europe-west1.firebasedatabase.app'
            };
            console.log(`   ✅ Configuración de producción detectada`);
          } else if (tieneEvidenta && tieneSecretariat) {
            // Ambos (problema de configuración)
            config = {
              error: 'Configuración mixta detectada - contiene ambos entornos',
              detalles: 'El código contiene referencias a ambos proyectos Firebase'
            };
            console.log(`   ⚠️ Configuración mixta detectada`);
          } else {
            console.log(`   ❌ No se encontraron project IDs de Firebase en el código`);
            console.log(`   📝 Muestra del código (primeros 1000 caracteres):`);
            console.log(`   ${data.substring(0, 1000)}...`);
            config = { error: 'No se encontró configuración de Firebase' };
          }
          
          resolve(config);
        } catch (error) {
          console.log(`   ❌ Error analizando JavaScript: ${error.message}`);
          resolve({ error: 'Error analizando JavaScript: ' + error.message });
        }
      });
    });
    
    request.on('error', (error) => {
      console.log(`   ❌ Error descargando JS: ${error.message}`);
      reject(error);
    });
    
    request.setTimeout(15000, () => {
      console.log(`   ⏰ Timeout descargando JavaScript`);
      request.destroy();
      reject(new Error('Timeout obteniendo JavaScript'));
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
      if (config.detalles) {
        console.log(`   📝 Detalles: ${config.detalles}`);
        console.log(`   🔧 SOLUCIÓN: Verificar variables de entorno en GitHub Actions`);
        console.log(`      - El sitio contiene código de ambos entornos`);
        console.log(`      - Revisar que las variables VITE_* estén correctas`);
        console.log(`      - Hacer un nuevo deploy después de corregir`);
      }
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