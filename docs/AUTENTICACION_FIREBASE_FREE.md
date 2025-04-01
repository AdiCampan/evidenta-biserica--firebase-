# Configuración de Autenticación con Firebase (Plan Gratuito)

## Resumen

Este documento explica cómo está configurada la autenticación en la aplicación utilizando Firebase Authentication y Firestore con el plan gratuito de Firebase. La implementación actual ya utiliza tokens JWT para proteger las solicitudes API y reglas de seguridad en Firestore para proteger los datos.

## Componentes de la Autenticación

### 1. Firebase Authentication

La aplicación utiliza Firebase Authentication para gestionar usuarios y sesiones:

- **Registro y login**: Implementados en los componentes `SignUp.jsx` y `Login.jsx`
- **Contexto de autenticación**: Implementado en `Context.jsx` para compartir el estado de autenticación en toda la aplicación
- **Rutas protegidas**: Implementadas con `ProtectedRoute.jsx` para restringir el acceso a usuarios no autenticados

### 2. Tokens JWT para Solicitudes API

Las solicitudes a la API ya están configuradas para incluir tokens JWT:

```javascript
// Función para obtener el token actual (implementada en los servicios API)
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return user.getIdToken();
  }
  return null;
};

// Configuración de las solicitudes API con el token
baseQuery: fetchBaseQuery({ 
  baseUrl: SERVER_URL,
  prepareHeaders: async (headers) => {
    const token = await getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
}),
```

### 3. Reglas de Seguridad en Firestore

Las reglas de seguridad en Firestore están configuradas para validar la autenticación y los permisos:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Función para verificar si el usuario está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Función para verificar si el usuario es propietario del documento
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Función para verificar si el usuario tiene rol de administrador
    function isAdmin() {
      return request.auth.token.admin == true;
    }
    
    // Reglas para la colección de personas
    match /persoane/{document=**} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated() && 
        (isAdmin() || request.resource.data.createdBy == request.auth.uid);
      allow delete: if isAuthenticated() && isAdmin();
    }
    
    // Reglas para la colección de iglesias
    match /churches/{document=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isAdmin();
    }
    
    // Reglas para otras colecciones
    match /{document=**} {
      allow read, write: if isAuthenticated() && isAdmin();
    }
  }
}
```

## Ventajas del Plan Gratuito de Firebase

1. **Firebase Authentication**: Completamente gratuito para métodos de autenticación básicos (email/password, Google, Facebook, etc.)
2. **Firestore**: El plan gratuito incluye:
   - 1GB de almacenamiento
   - 50,000 lecturas diarias
   - 20,000 escrituras diarias
   - 20,000 eliminaciones diarias
3. **Firebase Hosting**: Incluye:
   - 10GB de almacenamiento
   - 360MB de transferencia diaria
   - Dominio personalizado gratuito (*.web.app o *.firebaseapp.com)

## Cómo Funciona la Autenticación

1. **Registro/Login**: El usuario se registra o inicia sesión a través de Firebase Authentication
2. **Token JWT**: Firebase genera automáticamente un token JWT para el usuario autenticado
3. **Solicitudes API**: Cada solicitud a la API incluye el token JWT en el encabezado de autorización
4. **Validación**: Las reglas de seguridad de Firestore validan el token y los permisos del usuario

## Configuración del Entorno

La aplicación utiliza variables de entorno para la configuración de Firebase:

```
# Firebase Configuration
VITE_API_KEY=your-api-key
VITE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_PROJECT_ID=your-project-id
VITE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_APP_ID=your-app-id
VITE_DATABASE_URL=https://your-project-id.firebaseio.com
```

## Conclusión

La aplicación ya está configurada correctamente para utilizar autenticación con tokens JWT en Firebase utilizando el plan gratuito. No es necesario implementar Cloud Functions o servicios adicionales para la autenticación básica, ya que Firebase Authentication y las reglas de seguridad de Firestore proporcionan toda la funcionalidad necesaria.