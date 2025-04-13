/**
 * Utilidades para protección contra ataques de fuerza bruta
 * Estas funciones ayudan a prevenir intentos repetidos de acceso no autorizado
 */

// Almacenar intentos fallidos
const failedAttempts = {};

/**
 * Verifica si un identificador (email, IP) está bloqueado por demasiados intentos fallidos
 * @param {string} identifier - Identificador a verificar (email, IP)
 * @returns {boolean} - True si el identificador está bloqueado
 */
export const isBlocked = (identifier) => {
  if (!failedAttempts[identifier]) return false;
  
  const { count, timestamp } = failedAttempts[identifier];
  const now = Date.now();
  
  // Si han pasado más de 15 minutos, reiniciar contador
  if (now - timestamp > 15 * 60 * 1000) {
    failedAttempts[identifier] = { count: 0, timestamp: now };
    return false;
  }
  
  // Bloquear después de 5 intentos fallidos
  return count >= 5;
};

/**
 * Registra un intento fallido para un identificador
 * @param {string} identifier - Identificador (email, IP)
 */
export const recordFailedAttempt = (identifier) => {
  const now = Date.now();
  
  if (!failedAttempts[identifier]) {
    failedAttempts[identifier] = { count: 1, timestamp: now };
    return;
  }
  
  // Si han pasado más de 15 minutos, reiniciar contador
  if (now - failedAttempts[identifier].timestamp > 15 * 60 * 1000) {
    failedAttempts[identifier] = { count: 1, timestamp: now };
    return;
  }
  
  // Incrementar contador
  failedAttempts[identifier].count += 1;
  failedAttempts[identifier].timestamp = now;
};

/**
 * Reinicia el contador de intentos fallidos después de un inicio de sesión exitoso
 * @param {string} identifier - Identificador (email, IP)
 */
export const resetFailedAttempts = (identifier) => {
  delete failedAttempts[identifier];
};

/**
 * Obtiene el número de intentos fallidos para un identificador
 * @param {string} identifier - Identificador (email, IP)
 * @returns {number} - Número de intentos fallidos
 */
export const getFailedAttempts = (identifier) => {
  if (!failedAttempts[identifier]) return 0;
  
  const { count, timestamp } = failedAttempts[identifier];
  const now = Date.now();
  
  // Si han pasado más de 15 minutos, reiniciar contador
  if (now - timestamp > 15 * 60 * 1000) {
    failedAttempts[identifier] = { count: 0, timestamp: now };
    return 0;
  }
  
  return count;
};

/**
 * Obtiene el tiempo restante de bloqueo en segundos
 * @param {string} identifier - Identificador (email, IP)
 * @returns {number} - Tiempo restante en segundos, 0 si no está bloqueado
 */
export const getRemainingBlockTime = (identifier) => {
  if (!failedAttempts[identifier]) return 0;
  
  const { timestamp } = failedAttempts[identifier];
  const now = Date.now();
  const elapsedMs = now - timestamp;
  const blockTimeMs = 15 * 60 * 1000; // 15 minutos
  
  if (elapsedMs >= blockTimeMs) return 0;
  
  return Math.ceil((blockTimeMs - elapsedMs) / 1000); // Convertir a segundos
};