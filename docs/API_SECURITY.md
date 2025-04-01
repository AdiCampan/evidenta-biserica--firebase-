# Recomendaciones de Seguridad para la API

Este documento proporciona recomendaciones específicas para mejorar la seguridad en las comunicaciones con la API en la aplicación Evidenta Biserica.

## Problemas Identificados

1. **Falta de Autenticación en Solicitudes API**
   - Las solicitudes a la API no incluyen tokens de autenticación
   - No hay validación de sesión en las solicitudes a endpoints protegidos
   - La URL del servidor está hardcodeada como `localhost` en el archivo `constants.js`

2. **Manejo Inseguro de Credenciales**
   - Las credenciales de Firebase se gestionan a través de variables de entorno, pero no hay un archivo `.env` en el repositorio
   - No hay validación para asegurar que las variables de entorno estén configuradas correctamente

3. **Validación Insuficiente de Datos**
   - No hay validación del lado del servidor para las entradas de usuario
   - Posible vulnerabilidad a ataques de inyección

## Implementación Recomendada

### 1. Autenticación con JWT en Solicitudes API

Modificar el archivo `src/services/churches.js` y otros servicios similares para incluir tokens JWT en las solicitudes:

```javascript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { auth } from '../firebase-config';

// Función para obtener el token actual
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return user.getIdToken();
  }
  return null;
};

export const churchesApi = createApi({
  reducerPath: 'churchesApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_SERVER_URL || 'https://evidenta-biserica-api.vercel.app',
    prepareHeaders: async (headers) => {
      const token = await getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['churches'],
  endpoints: (builder) => ({
    // ... endpoints existentes
  }),
});
```

### 2. Validación de Entradas en el Cliente

Mejorar la validación en componentes como `src/pages/Biserici.jsx`:

```javascript
function addData() {
  // Validar y sanitizar entradas
  const sanitizedChurch = church.trim();
  const sanitizedPlace = place.trim();
  
  if (sanitizedChurch && sanitizedPlace) {
    // Validar longitud y caracteres permitidos
    if (sanitizedChurch.length > 100 || sanitizedPlace.length > 100) {
      setError('Los campos no pueden exceder 100 caracteres');
      return;
    }
    
    // Validar que no contengan caracteres especiales peligrosos
    const safePattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,'-]+$/;
    if (!safePattern.test(sanitizedChurch) || !safePattern.test(sanitizedPlace)) {
      setError('Los campos contienen caracteres no permitidos');
      return;
    }
    
    addChurch({
      name: sanitizedChurch,
      address: sanitizedPlace,
    });
    
    setChurch('');
    setPlace('');
    setError('');
  } else {
    setError('Todos los campos son obligatorios');
  }
}
```

### 3. Configuración Segura de Variables de Entorno

Crear un archivo `.env` basado en el `.env.example` proporcionado y asegurarse de que esté incluido en `.gitignore`.

Agregar validación de variables de entorno en `main.jsx`:

```javascript
// Validar variables de entorno críticas al inicio
const requiredEnvVars = [
  'VITE_API_KEY',
  'VITE_AUTH_DOMAIN',
  'VITE_PROJECT_ID',
  'VITE_STORAGE_BUCKET',
  'VITE_MESSAGING_SENDER_ID',
  'VITE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Error: Faltan variables de entorno requeridas:', missingEnvVars.join(', '));
  // En producción, podrías mostrar un mensaje de error amigable en lugar de la aplicación
}
```

### 4. Actualizar el Archivo constants.js

Modificar `src/constants.js` para usar variables de entorno:

```javascript
// Usar variable de entorno con fallback a la URL de producción
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || "https://evidenta-biserica-api.vercel.app";
```

### 5. Implementar Manejo de Errores Mejorado

Agregar manejo de errores más robusto en los servicios API:

```javascript
// En los servicios API
export const churchesApi = createApi({
  // ... configuración existente
  endpoints: (builder) => ({
    getChurches: builder.query({
      query: () => `churches/`,
      providesTags: ['churches'],
      // Manejo de errores mejorado
      transformErrorResponse: (response, meta, arg) => {
        console.error('Error en la solicitud API:', response);
        // Devolver un mensaje de error amigable
        return {
          status: response.status,
          message: 'Error al obtener datos. Por favor, inténtelo de nuevo más tarde.'
        };
      },
    }),
    // ... otros endpoints
  }),
});
```

## Consideraciones Adicionales

1. **Implementar Rate Limiting en el Cliente**
   - Limitar la frecuencia de solicitudes a la API para prevenir abusos

2. **Validación en el Servidor**
   - Asegurar que el backend valide todas las entradas, independientemente de la validación del cliente

3. **Monitoreo y Logging**
   - Implementar logging de errores de API para detectar posibles ataques o problemas

4. **Pruebas de Seguridad**
   - Realizar pruebas de penetración específicas para la API
   - Probar escenarios de manipulación de solicitudes

Estas recomendaciones ayudarán a mejorar significativamente la seguridad de las comunicaciones con la API en la aplicación Evidenta Biserica.