import validator from 'validator';

/**
 * Funciones de validación y sanitización para entradas de usuario
 * Estas funciones ayudan a prevenir ataques de inyección y aseguran
 * que los datos enviados al servidor sean seguros
 */

/**
 * Sanitiza texto general eliminando caracteres peligrosos
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
export const sanitizeText = (text) => {
  if (!text) return '';
  return validator.trim(validator.escape(text));
};

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} - True si el email es válido
 */
export const validateEmail = (email) => {
  if (!email) return false;
  return validator.isEmail(email);
};

/**
 * Valida un nombre (persona, iglesia, etc)
 * @param {string} name - Nombre a validar
 * @returns {boolean} - True si el nombre es válido
 */
export const validateName = (name) => {
  if (!name) return false;
  
  const sanitized = sanitizeText(name);
  
  return sanitized.length > 0 &&
    sanitized.length <= 100 &&
    /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑăâîșțĂÂÎȘȚèëïüÈËÏÜçÇ\s.,'-]+$/.test(sanitized);
};

/**
 * Valida una dirección
 * @param {string} address - Dirección a validar
 * @returns {boolean} - True si la dirección es válida
 */
export const validateAddress = (address) => {
  if (!address) return false;
  
  const sanitized = sanitizeText(address);
  
  return sanitized.length > 0 &&
    sanitized.length <= 200 &&
    /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑăâîșțĂÂÎȘȚèëïüÈËÏÜçÇ\s.,#\-']+$/.test(sanitized);
};

/**
 * Valida un número de teléfono
 * @param {string} phone - Número de teléfono a validar
 * @returns {boolean} - True si el número es válido
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  return validator.isMobilePhone(phone);
};

/**
 * Valida una fecha
 * @param {string|Date} date - Fecha a validar
 * @returns {boolean} - True si la fecha es válida
 */
export const validateDate = (date) => {
  if (!date) return false;
  if (date instanceof Date) return !isNaN(date);
  return validator.isDate(date);
};

/**
 * Valida un objeto de iglesia
 * @param {Object} church - Objeto iglesia a validar
 * @returns {Object} - Objeto con resultado de validación y errores
 */
export const validateChurch = (church) => {
  const errors = {};
  let isValid = true;
  
  if (!validateName(church.name)) {
    errors.name = 'El nombre de la iglesia no es válido';
    isValid = false;
  }
  
  if (!validateAddress(church.address)) {
    errors.address = 'La dirección no es válida';
    isValid = false;
  }
  
  return { isValid, errors };
};

/**
 * Valida un objeto de persona/miembro
 * @param {Object} member - Objeto miembro a validar
 * @returns {Object} - Objeto con resultado de validación y errores
 */
export const validateMember = (member) => {
  const errors = {};
  let isValid = true;
  
  if (!validateName(member.firstName)) {
    errors.firstName = 'El nombre no es válido';
    isValid = false;
  }
  
  if (!validateName(member.lastName)) {
    errors.lastName = 'El apellido no es válido';
    isValid = false;
  }
  
  if (member.email && !validateEmail(member.email)) {
    errors.email = 'El email no es válido';
    isValid = false;
  }
  
  if (member.phone && !validatePhone(member.phone)) {
    errors.phone = 'El número de teléfono no es válido';
    isValid = false;
  }
  
  if (member.address && !validateAddress(member.address)) {
    errors.address = 'La dirección no es válida';
    isValid = false;
  }
  
  return { isValid, errors };
};