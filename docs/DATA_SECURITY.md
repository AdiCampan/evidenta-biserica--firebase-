# Recomendaciones de Seguridad para el Manejo de Datos

Este documento proporciona recomendaciones específicas para mejorar la seguridad en el manejo de datos y formularios en la aplicación Evidenta Biserica.

## Problemas Identificados

1. **Validación Insuficiente de Entradas** ✅
   - ✅ Los formularios tienen validación básica del lado del cliente, pero no hay validación exhaustiva
   - ✅ No se sanitizan adecuadamente las entradas de usuario
   - ✅ Posible vulnerabilidad a ataques de inyección y XSS

2. **Manejo Inseguro de Datos Sensibles** ✅
   - ✅ La aplicación maneja datos de iglesias y personas que podrían contener información sensible
   - ✅ No hay medidas para proteger estos datos en tránsito o en reposo
   - ✅ No hay políticas de acceso basadas en roles para restringir el acceso a datos sensibles

3. **Falta de Protección contra Ataques Comunes** ✅
   - ✅ No hay protección contra ataques CSRF
   - ✅ No hay protección contra ataques de fuerza bruta
   - ✅ No hay límites en las solicitudes a la API

## Implementación Recomendada

### 1. Mejorar la Validación de Entradas

Implementar una función de validación y sanitización reutilizable:

```javascript
// src/utils/validation.js
import validator from 'validator';

// Función para sanitizar texto general
export const sanitizeText = (text) => {
  if (!text) return '';
  // Eliminar caracteres peligrosos y espacios extra
  return validator.trim(validator.escape(text));
};

// Función para validar email
export const validateEmail = (email) => {
  if (!email) return false;
  return validator.isEmail(email);
};

// Función para validar nombres
export const validateName = (name) => {
  if (!name) return false;
  const sanitized = sanitizeText(name);
  // Verificar longitud y caracteres permitidos
  return sanitized.length > 0 && 
         sanitized.length <= 100 && 
         /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,'-]+$/.test(sanitized);
};

// Función para validar direcciones
export const validateAddress = (address) => {
  if (!address) return false;
  const sanitized = sanitizeText(address);
  // Verificar longitud y caracteres permitidos para direcciones
  return sanitized.length > 0 && 
         sanitized.length <= 200 && 
         /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#\-']+$/.test(sanitized);
};

// Función para validar números de teléfono
export const validatePhone = (phone) => {
  if (!phone) return false;
  return validator.isMobilePhone(phone);
};

// Función para validar fechas
export const validateDate = (date) => {
  if (!date) return false;
  return validator.isDate(date);
};
```

### 2. Implementar Protección contra CSRF

Agregar un token CSRF a los formularios:

```javascript
// src/utils/csrf.js
import { v4 as uuidv4 } from 'uuid';

// Generar token CSRF
export const generateCSRFToken = () => {
  const token = uuidv4();
  sessionStorage.setItem('csrf_token', token);
  return token;
};

// Verificar token CSRF
export const verifyCSRFToken = (token) => {
  const storedToken = sessionStorage.getItem('csrf_token');
  if (!storedToken || token !== storedToken) {
    return false;
  }
  // Regenerar token después de verificación
  sessionStorage.removeItem('csrf_token');
  return true;
};
```

Modificar los formularios para incluir el token CSRF:

```jsx
// En componentes de formulario
import { generateCSRFToken, verifyCSRFToken } from '../utils/csrf';
import { useState, useEffect } from 'react';

function MyForm() {
  const [csrfToken, setCsrfToken] = useState('');
  
  useEffect(() => {
    setCsrfToken(generateCSRFToken());
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Verificar token CSRF
    if (!verifyCSRFToken(csrfToken)) {
      setError('Error de seguridad. Por favor, recarga la página.');
      return;
    }
    
    // Continuar con el envío del formulario
    // ...
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="csrf_token" value={csrfToken} />
      {/* Resto del formulario */}
    </form>
  );
}
```

### 3. Cifrado de Datos Sensibles

Implementar cifrado para datos sensibles antes de almacenarlos:

```javascript
// src/utils/encryption.js
import CryptoJS from 'crypto-js';

// Clave de cifrado (debería estar en variables de entorno)
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

// Cifrar datos
export const encryptData = (data) => {
  if (!data) return null;
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

// Descifrar datos
export const decryptData = (encryptedData) => {
  if (!encryptedData) return null;
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
```

Agregar la clave de cifrado al archivo `.env.example`:

```
# Clave para cifrado de datos sensibles (generar una clave segura)
VITE_ENCRYPTION_KEY=your-secure-encryption-key
```

### 4. Implementar Control de Acceso Basado en Roles (RBAC)

Crear un sistema de roles para controlar el acceso a datos sensibles:

```javascript
// src/utils/rbac.js

// Definir roles y permisos
const roles = {
  admin: ['read:all', 'write:all', 'delete:all'],
  editor: ['read:all', 'write:own', 'delete:own'],
  viewer: ['read:public', 'read:own'],
};

// Verificar si un usuario tiene un permiso específico
export const hasPermission = (userRole, permission) => {
  if (!userRole || !roles[userRole]) return false;
  return roles[userRole].includes(permission);
};

// Verificar si un usuario puede acceder a un recurso
export const canAccess = (userRole, resource, action) => {
  // Ejemplo: canAccess('editor', 'member', 'edit')
  const permission = `${action}:${resource}`;
  return hasPermission(userRole, permission) || hasPermission(userRole, `${action}:all`);
};

// Componente HOC para proteger rutas basadas en roles
export const withRoleAccess = (Component, requiredRole) => {
  return (props) => {
    const { currentUser } = useAuth();
    const userRole = currentUser?.role || 'viewer';
    
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    
    if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
      return <Navigate to="/unauthorized" />;
    }
    
    return <Component {...props} />;
  };
};
```

### 5. Protección contra Ataques de Fuerza Bruta

Implementar un sistema de bloqueo temporal después de múltiples intentos fallidos:

```javascript
// src/utils/bruteForceProtection.js

// Almacenar intentos fallidos
const failedAttempts = {};

// Verificar si una dirección IP está bloqueada
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

// Registrar intento fallido
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

// Reiniciar contador después de inicio de sesión exitoso
export const resetFailedAttempts = (identifier) => {
  delete failedAttempts[identifier];
};
```

Modificar el componente de inicio de sesión para usar esta protección:

```javascript
// En Login.jsx
import { isBlocked, recordFailedAttempt, resetFailedAttempts } from '../utils/bruteForceProtection';

const onLogin = ({ email, password }) => {
  // Usar email como identificador
  if (isBlocked(email)) {
    setLoginError('Demasiados intentos fallidos. Por favor, inténtalo de nuevo más tarde.');
    return;
  }
  
  setLoading(true);
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      resetFailedAttempts(email);
      // Resto del código de inicio de sesión exitoso
    })
    .catch((error) => {
      recordFailedAttempt(email);
      setLoginError('Utilizator sau parola incorecta');
    })
    .finally(() => setLoading(false));
};
```

## Consideraciones Adicionales

1. **Implementar Logging de Seguridad**
   - Registrar intentos de acceso fallidos
   - Registrar acciones críticas como eliminación de datos
   - Implementar alertas para actividades sospechosas

2. **Protección de Datos en Tránsito**
   - Asegurar que todas las comunicaciones sean a través de HTTPS
   - Implementar certificados SSL válidos

3. **Política de Contraseñas Seguras**
   - Requerir contraseñas fuertes (longitud mínima, caracteres especiales, etc.)
   - Implementar cambio periódico de contraseñas para cuentas críticas

4. **Auditoría Regular**
   - Realizar auditorías de seguridad periódicas
   - Revisar y actualizar las políticas de seguridad

Estas recomendaciones ayudarán a mejorar significativamente la seguridad en el manejo de datos en la aplicación Evidenta Biserica.