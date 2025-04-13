import validator from 'validator';

/**
 * Funciones de validación y sanitización para entradas de usuario
 * Estas funciones ayudan a prevenir ataques de inyección y aseguran
 * que los datos enviados al servidor sean seguros
 */

/**
 * Sanitiza texto general eliminando caracteres peligrosos y espacios extra
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
export const sanitizeText = (text) => {
  if (!text) return '';
  // Eliminar caracteres peligrosos, espacios extra y prevenir XSS
  return validator.trim(validator.escape(validator.stripLow(text)));
};

/**
 * Sanitiza HTML para prevenir ataques XSS
 * @param {string} html - HTML a sanitizar
 * @returns {string} - HTML sanitizado
 */
export const sanitizeHtml = (html) => {
  if (!html) return '';
  // Eliminar todos los tags HTML y caracteres peligrosos
  return validator.stripLow(validator.escape(html));
};

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} - True si el email es válido
 */
export const validateEmail = (email) => {
  if (!email) return false;
  // Sanitizar antes de validar
  const sanitized = validator.normalizeEmail(email);
  return validator.isEmail(sanitized);
};

/**
 * Valida un nombre (persona, iglesia, etc)
 * @param {string} name - Nombre a validar
 * @returns {boolean} - True si el nombre es válido
 */
export const validateName = (name) => {
  if (!name) return false;
  
  const sanitized = sanitizeText(name);
  
  // Verificar longitud y caracteres permitidos con una expresión regular más estricta
  return sanitized.length > 0 &&
    sanitized.length <= 100 &&
    /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑăâîșțĂÂÎȘȚèëïüÈËÏÜçÇ\s.,'-]+$/.test(sanitized) &&
    !/<[^>]*>/.test(name); // Verificar que no contenga tags HTML
};

/**
 * Valida una dirección
 * @param {string} address - Dirección a validar
 * @returns {boolean} - True si la dirección es válida
 */
export const validateAddress = (address) => {
  if (!address) return false;
  
  const sanitized = sanitizeText(address);
  
  // Verificar longitud y caracteres permitidos para direcciones con validación más estricta
  return sanitized.length > 0 &&
    sanitized.length <= 200 &&
    /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑăâîșțĂÂÎȘȚèëïüÈËÏÜçÇ\s.,#\-']+$/.test(sanitized) &&
    !/<[^>]*>/.test(address); // Verificar que no contenga tags HTML
};

/**
 * Valida un número de teléfono
 * @param {string} phone - Número de teléfono a validar
 * @returns {boolean} - True si el número es válido
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  // Sanitizar antes de validar
  const sanitized = phone.replace(/[^0-9+\-\s()]/g, '');
  return validator.isMobilePhone(sanitized);
};

/**
 * Valida una fecha
 * @param {string|Date} date - Fecha a validar
 * @returns {boolean} - True si la fecha es válida
 */
export const validateDate = (date) => {
  if (!date) return false;
  if (date instanceof Date) return !isNaN(date);
  
  // Sanitizar antes de validar si es string
  if (typeof date === 'string') {
    const sanitized = sanitizeText(date);
    return validator.isDate(sanitized);
  }
  
  return false;
};

/**
 * Valida un objeto de iglesia
 * @param {Object} church - Objeto iglesia a validar
 * @returns {Object} - Objeto con resultado de validación y errores
 */
export const validateChurch = (church) => {
  const errors = {};
  let isValid = true;
  
  // Verificar que church sea un objeto válido
  if (!church || typeof church !== 'object') {
    return { isValid: false, errors: { general: 'Datos de iglesia inválidos' } };
  }
  
  if (!validateName(church.name)) {
    errors.name = 'El nombre de la iglesia no es válido';
    isValid = false;
  }
  
  if (!validateAddress(church.address)) {
    errors.address = 'La dirección no es válida';
    isValid = false;
  }
  
  // Validar teléfono si existe
  if (church.phone && !validatePhone(church.phone)) {
    errors.phone = 'El número de teléfono no es válido';
    isValid = false;
  }
  
  // Validar email si existe
  if (church.email && !validateEmail(church.email)) {
    errors.email = 'El email no es válido';
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
  
  // Verificar que member sea un objeto válido
  if (!member || typeof member !== 'object') {
    return { isValid: false, errors: { general: 'Datos de miembro inválidos' } };
  }
  
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
  
  // Validar fechas si existen
  if (member.birthDate && !validateDate(member.birthDate)) {
    errors.birthDate = 'La fecha de nacimiento no es válida';
    isValid = false;
  }
  
  if (member.baptiseDate && !validateDate(member.baptiseDate)) {
    errors.baptiseDate = 'La fecha de bautismo no es válida';
    isValid = false;
  }
  
  if (member.blessingDate && !validateDate(member.blessingDate)) {
    errors.blessingDate = 'La fecha de bendición no es válida';
    isValid = false;
  }
  
  // Validar observaciones/detalles si existen
  if (member.details && typeof member.details === 'string') {
    // Sanitizar el texto de observaciones
    member.details = sanitizeHtml(member.details);
  }
  
  return { isValid, errors };
};

/**
 * Valida una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {Object} - Objeto con resultado de validación y mensaje
 */
export const validatePassword = (password) => {
  if (!password) return { isValid: false, message: 'La contraseña es requerida' };
  
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  
  let message = '';
  if (!isValid) {
    message = 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales';
  }
  
  return { isValid, message };
};

/**
 * Valida un token CSRF
 * @param {string} token - Token CSRF a validar
 * @param {string} storedToken - Token almacenado para comparar
 * @returns {boolean} - True si el token es válido
 */
export const validateCSRFToken = (token, storedToken) => {
  if (!token || !storedToken) return false;
  return token === storedToken;
};