#!/usr/bin/env node

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

// Función para ejecutar comandos
function runCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`);
    const output = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    console.log(`✅ ${description} completado.`);
    return true;
  } catch (error) {
    console.error(`❌ Error en ${description}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 DEPLOY MANUAL - EVIDENTA BISERICII');
  console.log('=' .repeat(40));
  console.log('');

  // Mostrar opciones de entorno
  console.log('🌍 Selecciona el entorno de deployment:');
  console.log('1) Development (evidenta-bisericii)');
  console.log('2) Production (secretariat-ebenezer)');
  console.log('3) Cancelar');
  console.log('');

  const choice = await askQuestion('Ingresa tu opción (1-3): ');

  let environment, projectId, url;

  switch (choice.trim()) {
    case '1':
      environment = 'development';
      projectId = 'evidenta-bisericii';
      url = 'https://evidenta-bisericii.web.app';
      break;
    case '2':
      environment = 'production';
      projectId = 'secretariat-ebenezer';
      url = 'https://secretariat-ebenezer.web.app';
      break;
    case '3':
      console.log('🚫 Deploy cancelado.');
      rl.close();
      return;
    default:
      console.error('❌ Opción inválida.');
      rl.close();
      process.exit(1);
  }

  console.log(`🎯 Entorno seleccionado: ${environment}`);
  console.log(`📦 Proyecto: ${projectId}`);
  console.log('');

  // Confirmar antes de proceder
  const confirm = await askQuestion(`¿Confirmas el deploy en ${environment}? (s/n): `);
  
  if (confirm.toLowerCase() !== 's' && confirm.toLowerCase() !== 'si' && confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
    console.log('🚫 Deploy cancelado por el usuario.');
    rl.close();
    return;
  }

  console.log('');
  console.log('🚀 Iniciando proceso de deploy...');
  console.log('');

  // Paso 1: Configurar proyecto Firebase
  if (!runCommand(`firebase use ${environment}`, `Configurando proyecto ${environment}`)) {
    rl.close();
    process.exit(1);
  }

  // Paso 2: Verificar variables de entorno
  if (!runCommand('node deploy-check.js', 'Verificando variables de entorno')) {
    rl.close();
    process.exit(1);
  }

  // Paso 3: Ejecutar build
  if (!runCommand('npm run build', 'Ejecutando build')) {
    rl.close();
    process.exit(1);
  }

  // Paso 4: Deploy
  if (!runCommand('firebase deploy', `Desplegando en ${environment}`)) {
    rl.close();
    process.exit(1);
  }

  console.log('');
  console.log('🎉 ¡DEPLOY COMPLETADO CON ÉXITO!');
  console.log(`🌐 URL: ${url}`);
  console.log('');
  console.log('📋 Resumen:');
  console.log(`   • Entorno: ${environment}`);
  console.log(`   • Proyecto: ${projectId}`);
  console.log(`   • URL: ${url}`);
  console.log('');

  rl.close();
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  rl.close();
  process.exit(1);
});