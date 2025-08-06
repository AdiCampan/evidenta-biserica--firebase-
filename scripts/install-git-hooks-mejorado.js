#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Crear interfaz para input del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para hacer preguntas al usuario
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Obtener la ruta del directorio raíz del proyecto
const rootDir = process.cwd();

// Rutas de origen y destino
const sourceHooksDir = path.join(rootDir, 'scripts', 'git-hooks');
const gitDir = path.join(rootDir, '.git');
const destHooksDir = path.join(gitDir, 'hooks');

async function main() {
  console.log('📦 Instalador de hooks de Git mejorado...');
  console.log('');

  // Verificar si el directorio .git existe
  if (!fs.existsSync(gitDir)) {
    console.error('❌ Error: No se encontró el directorio .git. Asegúrate de ejecutar este script desde la raíz del repositorio.');
    process.exit(1);
  }

  // Verificar si el directorio de hooks de origen existe
  if (!fs.existsSync(sourceHooksDir)) {
    console.error(`❌ Error: No se encontró el directorio de hooks de origen en ${sourceHooksDir}`);
    process.exit(1);
  }

  // Crear el directorio de hooks de destino si no existe
  if (!fs.existsSync(destHooksDir)) {
    fs.mkdirSync(destHooksDir, { recursive: true });
  }

  // Mostrar opciones disponibles
  console.log('🔧 Opciones de hooks disponibles:');
  console.log('1) Hook original (deploy automático sin selección de entorno)');
  console.log('2) Hook mejorado (permite seleccionar entorno: development/production)');
  console.log('3) Sin hook (desinstalar hooks existentes)');
  console.log('');

  const choice = await askQuestion('Selecciona una opción (1-3): ');

  let hookToInstall = null;
  let hookName = 'pre-push';

  switch (choice.trim()) {
    case '1':
      hookToInstall = path.join(sourceHooksDir, 'pre-push');
      console.log('✅ Seleccionado: Hook original');
      break;
    case '2':
      hookToInstall = path.join(sourceHooksDir, 'pre-push-mejorado');
      console.log('✅ Seleccionado: Hook mejorado con selección de entorno');
      break;
    case '3':
      console.log('🗑️ Desinstalando hooks existentes...');
      const existingHook = path.join(destHooksDir, hookName);
      if (fs.existsSync(existingHook)) {
        fs.unlinkSync(existingHook);
        console.log('✅ Hook pre-push eliminado.');
      } else {
        console.log('ℹ️ No hay hooks instalados.');
      }
      rl.close();
      return;
    default:
      console.error('❌ Opción inválida.');
      rl.close();
      process.exit(1);
  }

  // Verificar si el hook seleccionado existe
  if (!fs.existsSync(hookToInstall)) {
    console.error(`❌ Error: No se encontró el hook seleccionado en ${hookToInstall}`);
    rl.close();
    process.exit(1);
  }

  // Instalar el hook seleccionado
  const destPath = path.join(destHooksDir, hookName);
  
  try {
    // Copiar el archivo
    fs.copyFileSync(hookToInstall, destPath);
    
    // Hacer el archivo ejecutable (chmod +x)
    execSync(`chmod +x "${destPath}"`);
    
    console.log(`✅ Hook ${hookName} instalado correctamente.`);
    console.log('');
    
    if (choice.trim() === '1') {
      console.log('🔔 El hook original ejecutará deploy automáticamente al hacer push.');
      console.log('⚠️ Nota: Solo desplegará en el entorno configurado por defecto.');
    } else if (choice.trim() === '2') {
      console.log('🔔 El hook mejorado te permitirá seleccionar el entorno al hacer push.');
      console.log('🌍 Podrás elegir entre development y production.');
    }
    
  } catch (error) {
    console.error(`❌ Error al instalar el hook: ${error.message}`);
    rl.close();
    process.exit(1);
  }

  rl.close();
  console.log('✅ Instalación completada.');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  rl.close();
  process.exit(1);
});