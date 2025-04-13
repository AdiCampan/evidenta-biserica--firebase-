# Recomendaciones de Seguridad para Firebase

Este documento proporciona recomendaciones específicas para mejorar la seguridad en la implementación de Firebase en la aplicación Evidenta Biserica.

## Problemas Identificados

1. **Configuración Insegura de Firebase** ✅
   - ~~No se encontraron reglas de seguridad para Firestore~~ → Implementado en `firestore.rules`
   - ~~Las claves de API se gestionan a través de variables de entorno, pero no hay un archivo `.env` en el repositorio~~ → Creado archivo `.env.example`
   - ~~No hay validación para asegurar que las variables de entorno estén configuradas correctamente~~ → Implementada validación

2. **Autenticación Básica**
   - La aplicación utiliza autenticación por correo/contraseña, pero no implementa características de seguridad adicionales
   - No hay verificación de correo electrónico obligatoria
   - No hay límites de intentos de inicio de sesión

3. **Acceso No Controlado a Datos**
   - No hay reglas de seguridad para limitar el acceso a datos en Firestore
   - No hay implementación de control de acceso basado en roles (RBAC)

## Implementación Recomendada

### 1. Reglas de Seguridad para Firestore

Crear un archivo `firestore.rules` en la raíz del proyecto:

```rules
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

### 2. Reglas de Seguridad para Storage

Crear un archivo `storage.rules` en la raíz del proyecto:

```rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Función para verificar si el usuario está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Función para verificar si el usuario es administrador
    function isAdmin() {
      return request.auth.token.admin == true;
    }
    
    // Reglas para imágenes de perfil
    match /profileImages/{userId}/{fileName} {
      // Solo permitir subir imágenes
      function isImage() {
        return request.resource.contentType.matches('image/.*');
      }
      
      // Limitar el tamaño de archivo a 5MB
      function isValidSize() {
        return request.resource.size <= 5 * 1024 * 1024;
      }
      
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated() && 
        (request.auth.uid == userId || isAdmin()) && 
        isImage() && 
        isValidSize();
      allow delete: if isAuthenticated() && 
        (request.auth.uid == userId || isAdmin());
    }
    
    // Reglas para otros archivos
    match /{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isAdmin();
    }
  }
}
```

### 3. Mejorar la Autenticación

Modificar el archivo `src/pages/Login/SignUp.jsx` para implementar verificación de correo electrónico:

```javascript
const onSubmit = async (data) => {
  setLoading(true);
  setSignUpError("");

  try {
    const { email, password } = data;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Enviar correo de verificación
    await sendEmailVerification(userCredential.user);
    
    setSignUpSuccess("Cuenta creada correctamente. Por favor, verifica tu correo electrónico antes de iniciar sesión.");
    setTimeout(() => {
      navigate("/login");
    }, 3000);
  } catch (error) {
    setLoading(false);
    setSignUpError("A apărut o eroare: " + error.message);
    setError("email", { type: "manual", message: error.message });
  } finally {
    setLoading(false);
  }
};
```

Modificar el archivo `src/pages/Login/Login.jsx` para verificar que el correo esté verificado:

```javascript
const onLogin = ({ email, password }) => {
  setLoading(true);
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      
      // Verificar si el correo está verificado
      if (!user.emailVerified) {
        setLoginError("Por favor, verifica tu correo electrónico antes de iniciar sesión.");
        signOut(auth); // Cerrar sesión si el correo no está verificado
        return;
      }
      
      setLoginError("");
      navigate("/persoane");
    })
    .catch((error) => {
      setLoginError("Utilizator sau parola incorecta");
      console.log(error.code, error.message);
    })
    .finally(() => setLoading(false));
};
```

### 4. Implementar Roles de Usuario

Crear una función para asignar roles de usuario después del registro:

```javascript
// En un nuevo archivo src/services/roles.js
import { firestore } from '../firebase-config';
import { doc, setDoc } from 'firebase/firestore';
import { httpsCallable, getFunctions } from 'firebase/functions';

// Función para asignar rol de usuario normal
export const assignUserRole = async (userId) => {
  try {
    await setDoc(doc(firestore, 'userRoles', userId), {
      role: 'user',
      createdAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error al asignar rol:', error);
    return false;
  }
};

// Esta función requiere configurar Firebase Cloud Functions
export const assignAdminRole = async (email) => {
  try {
    const functions = getFunctions();
    const addAdminRole = httpsCallable(functions, 'addAdminRole');
    const result = await addAdminRole({ email });
    return result.data;
  } catch (error) {
    console.error('Error al asignar rol de administrador:', error);
    throw error;
  }
};
```

### 5. Actualizar firebase.json

Modificar el archivo `firebase.json` para incluir las reglas de seguridad:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://firebasestorage.googleapis.com; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

## Consideraciones Adicionales

1. **Implementar Autenticación de Dos Factores**
   - Considerar la implementación de 2FA para cuentas de administrador
   - Firebase Authentication soporta múltiples proveedores de autenticación

2. **Monitoreo y Alertas**
   - Configurar Firebase Security Rules Playground para probar reglas
   - Implementar Firebase Alerts para actividades sospechosas

3. **Backups Regulares**
   - Configurar exportaciones programadas de Firestore
   - Almacenar backups en ubicaciones seguras

4. **Auditoría de Acceso**
   - Implementar logging de acciones críticas
   - Registrar intentos de acceso fallidos

Estas recomendaciones ayudarán a mejorar significativamente la seguridad de Firebase en la aplicación Evidenta Biserica.