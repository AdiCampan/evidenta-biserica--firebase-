import { v4 as uuidv4 } from 'uuid';

/**
 * Utilidades para protección contra ataques CSRF (Cross-Site Request Forgery)
 * Estas funciones ayudan a prevenir ataques CSRF generando y verificando tokens
 */

/**
 * Genera un token CSRF y lo almacena en sessionStorage
 * @returns {string} - Token CSRF generado
 */
export const generateCSRFToken = () => {
  const token = uuidv4();
  sessionStorage.setItem('csrf_token', token);
  return token;
};

/**
 * Verifica si un token CSRF es válido comparándolo con el almacenado
 * @param {string} token - Token CSRF a verificar
 * @returns {boolean} - True si el token es válido
 */
export const verifyCSRFToken = (token) => {
  const storedToken = sessionStorage.getItem('csrf_token');
  if (!storedToken || token !== storedToken) {
    return false;
  }
  // Regenerar token después de verificación para prevenir reutilización
  sessionStorage.removeItem('csrf_token');
  return true;
};

/**
 * Obtiene el token CSRF actual sin regenerarlo
 * @returns {string|null} - Token CSRF actual o null si no existe
 */
export const getCurrentCSRFToken = () => {
  return sessionStorage.getItem('csrf_token');
};

/**
 * Agrega un token CSRF a un objeto de datos
 * @param {Object} data - Objeto de datos al que agregar el token
 * @returns {Object} - Objeto con el token CSRF agregado
 */
export const addCSRFToken = (data = {}) => {
  const token = generateCSRFToken();
  return {
    ...data,
    csrf_token: token
  };
};