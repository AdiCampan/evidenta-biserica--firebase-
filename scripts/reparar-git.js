#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description, ignoreError = false) {
  try {
    log(`🔄 ${description}...`, 'blue');
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description} - OK`, 'green');
    return { success: true, output: output.trim() };
  } catch (error) {
    if (ignoreError) {
      log(`⚠️ ${description} - ${error.message}`, 'yellow');
      return { success: false, error: error.message, ignored: true };
    } else {
      log(`❌ ${description} - ${error.message}`, 'red');
      return { success: false, error: error.message };
    }
  }
}

function main() {
  log('🔧 REPARADOR DE PROBLEMAS DE GIT', 'cyan');
  log('=' .repeat(40), 'cyan');
  log('');

  const rootDir = process.cwd();
  const gitDir = path.join(rootDir, '.git');

  // 1. Verificar que estamos en un repositorio Git
  if (!fs.existsSync(gitDir)) {
    log('❌ Error: No se encontró el directorio .git', 'red');
    log('Este script debe ejecutarse desde la raíz de un repositorio Git.', 'yellow');
    process.exit(1);
  }

  log('📁 Repositorio Git detectado', 'green');
  log('');

  // 2. Verificar estado del repositorio
  log('🔍 VERIFICANDO ESTADO DEL REPOSITORIO:', 'blue');
  runCommand('git status --porcelain', 'Verificando cambios pendientes');
  runCommand('git branch --show-current', 'Verificando rama actual');
  log('');

  // 3. Reparar referencias de Git
  log('🔧 REPARANDO REFERENCIAS DE GIT:', 'blue');
  runCommand('git gc --prune=now', 'Limpieza de objetos no utilizados', true);
  runCommand('git fsck --full', 'Verificación de integridad del repositorio', true);
  runCommand('git reflog expire --expire=now --all', 'Limpieza de reflog', true);
  log('');

  // 4. Verificar conectividad con el remoto
  log('🌐 VERIFICANDO CONECTIVIDAD CON REMOTO:', 'blue');
  runCommand('git remote -v', 'Verificando remotos configurados');
  runCommand('git ls-remote origin', 'Verificando conectividad con origin', true);
  log('');

  // 5. Reparar índice de Git
  log('📋 REPARANDO ÍNDICE DE GIT:', 'blue');
  runCommand('git reset --mixed HEAD', 'Reparando índice', true);
  runCommand('git add -A', 'Reindexando archivos', true);
  log('');

  // 6. Verificar hooks de Git
  log('🪝 VERIFICANDO HOOKS DE GIT:', 'blue');
  const hooksDir = path.join(gitDir, 'hooks');
  if (fs.existsSync(hooksDir)) {
    const hooks = fs.readdirSync(hooksDir);
    hooks.forEach(hook => {
      const hookPath = path.join(hooksDir, hook);
      if (!hook.endsWith('.sample')) {
        try {
          const stats = fs.statSync(hookPath);
          const isExecutable = !!(stats.mode & parseInt('111', 8));
          if (isExecutable) {
            log(`✅ Hook ${hook}: Ejecutable`, 'green');
          } else {
            log(`⚠️ Hook ${hook}: No ejecutable`, 'yellow');
            // Intentar reparar permisos
            try {
              execSync(`chmod +x "${hookPath}"`);
              log(`🔧 Permisos reparados para ${hook}`, 'green');
            } catch (error) {
              log(`❌ No se pudieron reparar permisos para ${hook}`, 'red');
            }
          }
        } catch (error) {
          log(`❌ Error al verificar hook ${hook}: ${error.message}`, 'red');
        }
      }
    });
  } else {
    log('⚠️ Directorio de hooks no encontrado', 'yellow');
  }
  log('');

  // 7. Soluciones específicas para errores comunes
  log('🩹 APLICANDO SOLUCIONES ESPECÍFICAS:', 'blue');
  
  // Reparar problema de "No such file or directory" en git for-each-ref
  runCommand('git update-ref -d refs/remotes/origin/HEAD', 'Reparando referencia HEAD remota', true);
  runCommand('git remote set-head origin -a', 'Configurando HEAD remota', true);
  
  // Limpiar archivos temporales de Git
  const gitTempFiles = [
    path.join(gitDir, 'index.lock'),
    path.join(gitDir, 'HEAD.lock'),
    path.join(gitDir, 'config.lock')
  ];
  
  gitTempFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
        log(`🗑️ Archivo temporal eliminado: ${path.basename(file)}`, 'green');
      } catch (error) {
        log(`❌ No se pudo eliminar: ${path.basename(file)}`, 'red');
      }
    }
  });
  log('');

  // 8. Verificación final
  log('✅ VERIFICACIÓN FINAL:', 'blue');
  const finalCheck = runCommand('git status', 'Estado final del repositorio');
  if (finalCheck.success) {
    log('🎉 Reparación completada exitosamente', 'green');
  } else {
    log('⚠️ Algunos problemas persisten', 'yellow');
  }
  log('');

  // 9. Recomendaciones
  log('💡 RECOMENDACIONES:', 'cyan');
  log('1. Si VS Code sigue mostrando errores, reinicia el editor', 'yellow');
  log('2. Si persisten problemas, ejecuta: git clone <url> en un directorio nuevo', 'yellow');
  log('3. Para problemas de hooks: npm run install-hooks-mejorado', 'yellow');
  log('4. Para diagnóstico completo: npm run diagnostico', 'yellow');
  log('');
  
  log('🏁 REPARACIÓN COMPLETADA', 'cyan');
}

main();