// Script para verificar y corregir el formato de VITE_DATABASE_URL
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Función para verificar el formato de la URL de Firebase
function verificarFormatoURL(url) {
  if (!url) {
    return {
      valido: false,
      mensaje: 'La variable VITE_DATABASE_URL no está definida'
    };
  }

  // Verificar que la URL tenga el formato correcto
  const regex = /^https:\/\/[\w-]+\.firebaseio\.com$/;
  if (!regex.test(url)) {
    return {
      valido: false,
      mensaje: `El formato de la URL es incorrecto: ${url}\nDebe tener el formato: https://<nombre-proyecto>.firebaseio.com`
    };
  }

  return {
    valido: true,
    mensaje: 'El formato de la URL es correcto'
  };
}

// Verificar la URL actual
const databaseURL = process.env.VITE_DATABASE_URL;
const resultado = verificarFormatoURL(databaseURL);

console.log('=== Verificación de VITE_DATABASE_URL ===');
console.log(resultado.mensaje);

if (!resultado.valido) {
  console.log('\n¿Deseas corregir automáticamente el archivo .env? (s/n)');
  // En un script real, aquí se añadiría código para leer la entrada del usuario
  // y modificar el archivo .env si es necesario
  
  console.log('\nPara corregir manualmente, edita tu archivo .env y asegúrate de que VITE_DATABASE_URL tenga este formato:');
  console.log('VITE_DATABASE_URL=https://evidenta-bisericii.firebaseio.com');
  
  console.log('\nRecuerda reemplazar "evidenta-bisericii" con el ID real de tu proyecto si es diferente.');
  process.exit(1);
} else {
  console.log('\n✅ La configuración de la base de datos es correcta');
}