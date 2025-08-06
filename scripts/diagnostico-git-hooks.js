#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}: ${filePath}`, 'green');
    return true;
  } else {
    log(`❌ ${description}: ${filePath} (NO ENCONTRADO)`, 'red');
    return false;
  }
}

function checkFileExecutable(filePath, description) {
  try {
    const stats = fs.statSync(filePath);
    const isExecutable = !!(stats.mode & parseInt('111', 8));
    if (isExecutable) {
      log(`✅ ${description}: Ejecutable`, 'green');
      return true;
    } else {
      log(`❌ ${description}: NO ejecutable`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${description}: Error al verificar permisos - ${error.message}`, 'red');
    return false;
  }
}

function runCommand(command, description) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description}: OK`, 'green');
    return { success: true, output: output.trim() };
  } catch (error) {
    log(`❌ ${description}: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

function main() {
  log('🔍 DIAGNÓSTICO DE GIT HOOKS Y DEPLOYMENT', 'cyan');
  log('=' .repeat(50), 'cyan');
  log('');

  const rootDir = process.cwd();
  const gitDir = path.join(rootDir, '.git');
  const hooksDir = path.join(gitDir, 'hooks');
  const preHookPath = path.join(hooksDir, 'pre-push');
  
  // 1. Verificar estructura de directorios
  log('📁 VERIFICANDO ESTRUCTURA DE DIRECTORIOS:', 'blue');
  checkFileExists(gitDir, 'Directorio .git');
  checkFileExists(hooksDir, 'Directorio hooks');
  checkFileExists(path.join(rootDir, 'scripts', 'git-hooks'), 'Directorio scripts/git-hooks');
  log('');

  // 2. Verificar hooks instalados
  log('🔧 VERIFICANDO HOOKS INSTALADOS:', 'blue');
  const hookExists = checkFileExists(preHookPath, 'Hook pre-push');
  if (hookExists) {
    checkFileExecutable(preHookPath, 'Permisos del hook pre-push');
    
    // Mostrar contenido del hook
    try {
      const hookContent = fs.readFileSync(preHookPath, 'utf8');
      const lines = hookContent.split('\n');
      log(`📄 Primeras líneas del hook:`, 'yellow');
      lines.slice(0, 5).forEach((line, index) => {
        log(`   ${index + 1}: ${line}`, 'yellow');
      });
    } catch (error) {
      log(`❌ Error al leer el hook: ${error.message}`, 'red');
    }
  }
  log('');

  // 3. Verificar archivos de configuración
  log('⚙️ VERIFICANDO ARCHIVOS DE CONFIGURACIÓN:', 'blue');
  checkFileExists(path.join(rootDir, 'firebase.json'), 'firebase.json');
  checkFileExists(path.join(rootDir, '.firebaserc'), '.firebaserc');
  checkFileExists(path.join(rootDir, 'deploy-check.js'), 'deploy-check.js');
  checkFileExists(path.join(rootDir, 'package.json'), 'package.json');
  log('');

  // 4. Verificar variables de entorno
  log('🌍 VERIFICANDO VARIABLES DE ENTORNO:', 'blue');
  const envVars = [
    'VITE_API_KEY',
    'VITE_AUTH_DOMAIN', 
    'VITE_PROJECT_ID',
    'VITE_STORAGE_BUCKET',
    'VITE_MESSAGING_SENDER_ID',
    'VITE_APP_ID',
    'VITE_DATABASE_URL'
  ];
  
  require('dotenv').config();
  envVars.forEach(varName => {
    if (process.env[varName]) {
      log(`✅ ${varName}: Configurada`, 'green');
    } else {
      log(`❌ ${varName}: NO configurada`, 'red');
    }
  });
  log('');

  // 5. Verificar comandos necesarios
  log('🛠️ VERIFICANDO COMANDOS DISPONIBLES:', 'blue');
  runCommand('node --version', 'Node.js');
  runCommand('npm --version', 'npm');
  runCommand('firebase --version', 'Firebase CLI');
  runCommand('git --version', 'Git');
  log('');

  // 6. Verificar configuración de Firebase
  log('🔥 VERIFICANDO CONFIGURACIÓN DE FIREBASE:', 'blue');
  const firebaseList = runCommand('firebase projects:list', 'Lista de proyectos Firebase');
  if (firebaseList.success) {
    log(`📋 Proyectos disponibles:`, 'yellow');
    log(firebaseList.output, 'yellow');
  }
  
  const firebaseUse = runCommand('firebase use', 'Proyecto actual');
  if (firebaseUse.success) {
    log(`🎯 Proyecto activo: ${firebaseUse.output}`, 'yellow');
  }
  log('');

  // 7. Verificar estado de Git
  log('📝 VERIFICANDO ESTADO DE GIT:', 'blue');
  runCommand('git status --porcelain', 'Cambios pendientes');
  runCommand('git branch --show-current', 'Rama actual');
  log('');

  // 8. Recomendaciones
  log('💡 RECOMENDACIONES:', 'magenta');
  log('1. Si el hook no está instalado, ejecuta: npm run install-git-hooks', 'yellow');
  log('2. Si hay problemas con variables de entorno, verifica el archivo .env', 'yellow');
  log('3. Si Firebase CLI no está instalado: npm install -g firebase-tools', 'yellow');
  log('4. Para usar el hook mejorado: node scripts/install-git-hooks-mejorado.js', 'yellow');
  log('5. Para hacer deploy manual: firebase use <proyecto> && firebase deploy', 'yellow');
  log('');
  
  log('🏁 DIAGNÓSTICO COMPLETADO', 'cyan');
}

main();