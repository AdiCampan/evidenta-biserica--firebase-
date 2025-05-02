#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Obtener la ruta del directorio raíz del proyecto
const rootDir = process.cwd();

// Rutas de origen y destino
const sourceHooksDir = path.join(rootDir, 'scripts', 'git-hooks');
const gitDir = path.join(rootDir, '.git');
const destHooksDir = path.join(gitDir, 'hooks');

console.log('📦 Instalando hooks de Git...');

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

// Copiar cada hook y hacerlo ejecutable
const hooks = fs.readdirSync(sourceHooksDir);

if (hooks.length === 0) {
  console.error('❌ Error: No se encontraron hooks en el directorio de origen.');
  process.exit(1);
}

hooks.forEach(hook => {
  const sourcePath = path.join(sourceHooksDir, hook);
  const destPath = path.join(destHooksDir, hook);
  
  // Copiar el archivo
  fs.copyFileSync(sourcePath, destPath);
  
  // Hacer el archivo ejecutable (chmod +x)
  try {
    execSync(`chmod +x "${destPath}"`);
    console.log(`✅ Hook ${hook} instalado correctamente.`);
  } catch (error) {
    console.error(`❌ Error al hacer ejecutable el hook ${hook}: ${error.message}`);
    process.exit(1);
  }
});

console.log('✅ Todos los hooks de Git han sido instalados correctamente.');
console.log('🔔 Ahora el build y deploy se ejecutarán automáticamente al hacer push.');