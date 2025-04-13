import CryptoJS from 'crypto-js';

/**
 * Utilidades para cifrado y descifrado de datos sensibles
 * Estas funciones ayudan a proteger información confidencial antes de almacenarla
 */

// Clave de cifrado (debería estar en variables de entorno)
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key-for-development-only';

/**
 * Cifra datos sensibles
 * @param {any} data - Datos a cifrar
 * @returns {string|null} - Datos cifrados como string o null si no hay datos
 */
export const encryptData = (data) => {
  if (!data) return null;
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

/**
 * Descifra datos cifrados
 * @param {string} encryptedData - Datos cifrados
 * @returns {any|null} - Datos descifrados o null si no hay datos
 */
export const decryptData = (encryptedData) => {
  if (!encryptedData) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Error al descifrar datos:', error);
    return null;
  }
};

/**
 * Cifra un campo específico de un objeto
 * @param {Object} obj - Objeto que contiene el campo a cifrar
 * @param {string} field - Nombre del campo a cifrar
 * @returns {Object} - Objeto con el campo cifrado
 */
export const encryptField = (obj, field) => {
  if (!obj || !field || !obj[field]) return obj;
  
  return {
    ...obj,
    [field]: encryptData(obj[field])
  };
};

/**
 * Descifra un campo específico de un objeto
 * @param {Object} obj - Objeto que contiene el campo cifrado
 * @param {string} field - Nombre del campo a descifrar
 * @returns {Object} - Objeto con el campo descifrado
 */
export const decryptField = (obj, field) => {
  if (!obj || !field || !obj[field]) return obj;
  
  return {
    ...obj,
    [field]: decryptData(obj[field])
  };
};