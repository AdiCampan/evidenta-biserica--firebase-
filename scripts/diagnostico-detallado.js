#!/usr/bin/env node

/**
 * Script de Diagnóstico Detallado
 * Proporciona información de depuración completa para problemas de configuración
 */

const https = require('https');
const { URL } = require('url');

// URLs a verificar
const URLS = {
  desarrollo: 'https://evidenta-bisericii.web.app',
  produccion: 'https://secretariat-ebenezer.web.app'
};

console.log('🔍 DIAGNÓSTICO DETALLADO DE ENTORNOS');
console.log('=' .repeat(60));
console.log('');

// Función para hacer una petición HTTP con información detallada
function peticionDetallada(url, descripcion) {
  return new Promise((resolve, reject) => {
    console.log(`\n📍 ${descripcion}: ${url}`);
    console.log('─'.repeat(50));
    
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'identity',
        'Connection': 'close'
      },
      timeout: 20000
    };
    
    console.log(`🔗 Conectando a: ${urlObj.hostname}:${urlObj.port || 443}`);
    console.log(`📄 Ruta: ${urlObj.pathname}`);
    
    const startTime = Date.now();
    
    const request = https.request(options, (response) => {
      const endTime = Date.now();
      console.log(`⏱️  Tiempo de respuesta: ${endTime - startTime}ms`);
      console.log(`📡 Código de estado: ${response.statusCode}`);
      console.log(`📋 Headers de respuesta:`);
      
      Object.entries(response.headers).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      
      let data = '';
      let dataSize = 0;
      
      response.on('data', (chunk) => {
        data += chunk;
        dataSize += chunk.length;
      });
      
      response.on('end', () => {
        console.log(`📊 Datos recibidos: ${dataSize} bytes`);
        console.log(`📝 Tipo de contenido: ${response.headers['content-type'] || 'No especificado'}`);
        
        if (response.statusCode !== 200) {
          console.log(`❌ Error HTTP: ${response.statusCode}`);
          console.log(`📄 Contenido de error:`);
          console.log(data.substring(0, 1000));
          resolve({ error: `HTTP ${response.statusCode}`, data: data.substring(0, 1000) });
          return;
        }
        
        // Analizar el HTML
        console.log(`\n🔍 ANÁLISIS DEL HTML:`);
        console.log(`📏 Longitud total: ${data.length} caracteres`);
        
        // Buscar elementos importantes
        const titleMatch = data.match(/<title[^>]*>([^<]*)<\/title>/i);
        if (titleMatch) {
          console.log(`📑 Título: ${titleMatch[1]}`);
        }
        
        // Buscar archivos JavaScript
        const jsMatches = data.match(/src="[^"]*\.js[^"]*"/g) || [];
        console.log(`📦 Archivos JavaScript encontrados: ${jsMatches.length}`);
        jsMatches.forEach((match, index) => {
          console.log(`   ${index + 1}. ${match}`);
        });
        
        // Buscar específicamente el archivo index
        const indexJsMatch = data.match(/src="(\/assets\/index-[^"]+\.js)"/i);
        if (indexJsMatch) {
          console.log(`✅ Archivo principal encontrado: ${indexJsMatch[1]}`);
          const jsUrl = `${url}${indexJsMatch[1]}`;
          analizarJavaScript(jsUrl).then(resolve).catch(reject);
        } else {
          console.log(`❌ No se encontró archivo JavaScript principal`);
          console.log(`📝 Primeros 1000 caracteres del HTML:`);
          console.log('─'.repeat(30));
          console.log(data.substring(0, 1000));
          console.log('─'.repeat(30));
          resolve({ error: 'No se encontró archivo JavaScript principal', html: data.substring(0, 1000) });
        }
      });
    });
    
    request.on('error', (error) => {
      console.log(`❌ Error de conexión: ${error.message}`);
      console.log(`🔧 Código de error: ${error.code}`);
      if (error.syscall) {
        console.log(`🔧 Syscall: ${error.syscall}`);
      }
      reject(error);
    });
    
    request.on('timeout', () => {
      console.log(`⏰ Timeout después de 20 segundos`);
      request.destroy();
      reject(new Error('Timeout de conexión'));
    });
    
    request.end();
  });
}

// Función para analizar el archivo JavaScript
function analizarJavaScript(jsUrl) {
  return new Promise((resolve, reject) => {
    console.log(`\n📥 ANALIZANDO JAVASCRIPT: ${jsUrl}`);
    console.log('─'.repeat(50));
    
    const startTime = Date.now();
    
    const request = https.get(jsUrl, (response) => {
      const endTime = Date.now();
      console.log(`⏱️  Tiempo de descarga: ${endTime - startTime}ms`);
      console.log(`📡 Código de estado: ${response.statusCode}`);
      
      if (response.statusCode !== 200) {
        console.log(`❌ Error descargando JavaScript: ${response.statusCode}`);
        resolve({ error: `Error HTTP ${response.statusCode} descargando JS` });
        return;
      }
      
      let data = '';
      let dataSize = 0;
      
      response.on('data', (chunk) => {
        data += chunk;
        dataSize += chunk.length;
      });
      
      response.on('end', () => {
        console.log(`📊 JavaScript descargado: ${dataSize} bytes`);
        
        // Buscar configuraciones de Firebase
        console.log(`\n🔍 BÚSQUEDA DE CONFIGURACIÓN FIREBASE:`);
        
        const evidenta = data.includes('evidenta-bisericii');
        const secretariat = data.includes('secretariat-ebenezer');
        
        console.log(`🔍 Contiene 'evidenta-bisericii': ${evidenta}`);
        console.log(`🔍 Contiene 'secretariat-ebenezer': ${secretariat}`);
        
        // Buscar patrones específicos de configuración
        const firebaseConfigPattern = /firebase[Cc]onfig|projectId|authDomain|databaseURL/g;
        const configMatches = data.match(firebaseConfigPattern) || [];
        console.log(`🔧 Patrones de configuración encontrados: ${configMatches.length}`);
        if (configMatches.length > 0) {
          console.log(`   Patrones: ${[...new Set(configMatches)].join(', ')}`);
        }
        
        // Buscar URLs de Firebase
        const firebaseUrls = data.match(/https:\/\/[^"'\s]*firebase[^"'\s]*/g) || [];
        console.log(`🌐 URLs de Firebase encontradas: ${firebaseUrls.length}`);
        firebaseUrls.forEach((url, index) => {
          console.log(`   ${index + 1}. ${url}`);
        });
        
        // Determinar configuración
        let config = {};
        if (evidenta && !secretariat) {
          config = {
            projectId: 'evidenta-bisericii',
            authDomain: 'evidenta-bisericii.firebaseapp.com',
            databaseURL: 'https://evidenta-bisericii-default-rtdb.europe-west1.firebasedatabase.app',
            entorno: 'desarrollo'
          };
          console.log(`✅ CONFIGURACIÓN: Desarrollo`);
        } else if (secretariat && !evidenta) {
          config = {
            projectId: 'secretariat-ebenezer',
            authDomain: 'secretariat-ebenezer.firebaseapp.com',
            databaseURL: 'https://secretariat-ebenezer-default-rtdb.europe-west1.firebasedatabase.app',
            entorno: 'produccion'
          };
          console.log(`✅ CONFIGURACIÓN: Producción`);
        } else if (evidenta && secretariat) {
          config = {
            error: 'Configuración mixta detectada',
            detalles: 'El código contiene referencias a ambos entornos'
          };
          console.log(`⚠️  CONFIGURACIÓN: Mixta (problema)`);
        } else {
          config = {
            error: 'No se encontró configuración de Firebase',
            detalles: 'No se encontraron project IDs de Firebase en el código'
          };
          console.log(`❌ CONFIGURACIÓN: No encontrada`);
          
          // Mostrar muestra del código para depuración
          console.log(`\n📝 MUESTRA DEL CÓDIGO (primeros 2000 caracteres):`);
          console.log('─'.repeat(50));
          console.log(data.substring(0, 2000));
          console.log('─'.repeat(50));
        }
        
        resolve(config);
      });
    });
    
    request.on('error', (error) => {
      console.log(`❌ Error descargando JavaScript: ${error.message}`);
      reject(error);
    });
    
    request.setTimeout(20000, () => {
      console.log(`⏰ Timeout descargando JavaScript`);
      request.destroy();
      reject(new Error('Timeout descargando JavaScript'));
    });
  });
}

// Función principal
async function diagnosticoDetallado() {
  console.log(`🕐 Iniciando diagnóstico detallado: ${new Date().toISOString()}`);
  console.log(`🌐 Node.js versión: ${process.version}`);
  console.log(`💻 Plataforma: ${process.platform}`);
  
  for (const [nombre, url] of Object.entries(URLS)) {
    try {
      console.log(`\n\n🎯 VERIFICANDO ${nombre.toUpperCase()}`);
      console.log('='.repeat(60));
      
      const resultado = await peticionDetallada(url, `Sitio de ${nombre}`);
      
      console.log(`\n📊 RESULTADO FINAL PARA ${nombre.toUpperCase()}:`);
      console.log('─'.repeat(40));
      
      if (resultado.error) {
        console.log(`❌ Error: ${resultado.error}`);
        if (resultado.detalles) {
          console.log(`📝 Detalles: ${resultado.detalles}`);
        }
      } else {
        console.log(`✅ Configuración encontrada:`);
        console.log(`   Project ID: ${resultado.projectId}`);
        console.log(`   Auth Domain: ${resultado.authDomain}`);
        console.log(`   Database URL: ${resultado.databaseURL}`);
        console.log(`   Entorno: ${resultado.entorno}`);
      }
      
    } catch (error) {
      console.log(`\n❌ ERROR CRÍTICO para ${nombre}:`);
      console.log(`   Mensaje: ${error.message}`);
      console.log(`   Código: ${error.code || 'N/A'}`);
      console.log(`   Stack: ${error.stack}`);
    }
  }
  
  console.log(`\n\n🏁 DIAGNÓSTICO COMPLETADO`);
  console.log('='.repeat(60));
  console.log(`🕐 Finalizado: ${new Date().toISOString()}`);
}

// Ejecutar diagnóstico
diagnosticoDetallado().catch(error => {
  console.error('❌ Error fatal en el diagnóstico:', error);
  process.exit(1);
});