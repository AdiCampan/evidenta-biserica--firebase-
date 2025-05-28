# Solución al Problema de Permisos en Firebase

## Problema Identificado

Al ejecutar el script `add-test-admins.js`, se está produciendo el siguiente error:

```
PERMISSION_DENIED: Permission denied on resource project secretariat-ebenezer
```

Este error indica que las credenciales utilizadas no tienen permisos suficientes para escribir en la colección `authorizedAdmins` de Firestore.

## Causa del Problema

El script actual está utilizando la SDK de Firebase para cliente web (`firebase/app` y `firebase/firestore`), que tiene las siguientes limitaciones:

1. **Autenticación limitada**: La SDK para cliente web está diseñada para ejecutarse en navegadores y está sujeta a las reglas de seguridad de Firestore.
2. **Reglas de seguridad**: Según las reglas en `firestore.rules`, solo los usuarios autenticados con rol de administrador pueden escribir en colecciones como `authorizedAdmins`.
3. **Falta de autenticación**: El script se ejecuta sin autenticación de usuario o con credenciales insuficientes.

## Solución Propuesta

Para resolver este problema, necesitamos utilizar Firebase Admin SDK, que proporciona acceso privilegiado a los recursos de Firebase, omitiendo las reglas de seguridad de Firestore.

### Pasos para Implementar la Solución

1. **Instalar Firebase Admin SDK**:

   ```bash
   npm install firebase-admin
   ```

2. **Generar una Cuenta de Servicio**:

   - Ve a la [Consola de Firebase](https://console.firebase.google.com/)
   - Selecciona tu proyecto (`secretariat-ebenezer`)
   - Ve a Configuración del proyecto > Cuentas de servicio
   - Haz clic en "Generar nueva clave privada"
   - Guarda el archivo JSON generado en una ubicación segura (por ejemplo, `serviceAccountKey.json`)
   - **IMPORTANTE**: No subas este archivo a repositorios públicos

3. **Modificar el Script**:

   Crea una versión actualizada del script que utilice Firebase Admin SDK:

   ```javascript
   // scripts/add-test-admins-admin-sdk.js
   const admin = require('firebase-admin');
   const path = require('path');
   const { config } = require('dotenv');
   const { expand } = require('dotenv-expand');

   // Cargar variables de entorno
   const myEnv = config({ path: path.resolve(process.cwd(), '.env.development') });
   expand(myEnv);

   // Ruta al archivo de credenciales de servicio (ajusta según sea necesario)
   const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');

   // Inicializar Firebase Admin con credenciales de servicio
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccountPath),
     databaseURL: process.env.VITE_DATABASE_URL
   });

   const firestore = admin.firestore();

   /**
    * Esta función añade correos electrónicos específicos como administradores autorizados
    * para el entorno de prueba (test)
    */
   async function addTestAdmins() {
     try {
       console.log('Añadiendo administradores autorizados para el entorno de prueba...');
       console.log(`Proyecto Firebase: ${process.env.VITE_PROJECT_ID}`);
       
       // Lista de correos a añadir como administradores
       const adminEmails = [
         'victor.calatayud.espinosa@gmail.com',
         'secretariatebenezercastellon@gmail.com',
         'adicampan1974@gmail.com'
       ];
       
       const authorizedCollection = firestore.collection('authorizedAdmins');
       
       // Procesar cada correo
       for (const email of adminEmails) {
         // Verificar si el correo ya existe
         const snapshot = await authorizedCollection.where('email', '==', email).get();
         
         if (snapshot.empty) {
           // Si no existe, añadirlo
           await authorizedCollection.add({
             email: email,
             createdAt: admin.firestore.FieldValue.serverTimestamp(),
             isTestAdmin: true // Marcar como administrador de prueba
           });
           console.log(`✅ Administrador autorizado añadido: ${email}`);
         } else {
           console.log(`ℹ️ El administrador ${email} ya está autorizado`);
         }
       }
       
       console.log('✅ Proceso de añadir administradores de prueba completado');
       return true;
     } catch (error) {
       console.error('❌ Error al añadir administradores de prueba:', error);
       return false;
     }
   }

   // Ejecutar la función
   addTestAdmins()
     .then(() => {
       console.log('Proceso finalizado.');
       process.exit(0);
     })
     .catch(error => {
       console.error('Error inesperado:', error);
       process.exit(1);
     });
   ```

4. **Actualizar package.json**:

   Añade un nuevo script en `package.json`:

   ```json
   "add-test-admins-admin": "node scripts/add-test-admins-admin-sdk.js"
   ```

5. **Ejecutar el Nuevo Script**:

   ```bash
   npm run add-test-admins-admin
   ```

## Consideraciones de Seguridad

- **Protege las credenciales**: No incluyas el archivo `serviceAccountKey.json` en el control de versiones.
- **Acceso limitado**: Limita el acceso a este script solo a administradores del sistema.
- **Entorno controlado**: Ejecuta este script solo en entornos controlados y seguros.

## Alternativa: Autenticación de Usuario

Si prefieres no utilizar Firebase Admin SDK, otra opción es modificar el script para que primero autentique a un usuario administrador y luego realice las operaciones:

```javascript
// Importar módulos necesarios para autenticación
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Autenticar como administrador antes de realizar operaciones
async function authenticateAdmin() {
  const auth = getAuth(app);
  try {
    // Reemplaza con credenciales de un administrador
    await signInWithEmailAndPassword(auth, 'admin@example.com', 'password');
    console.log('✅ Autenticado como administrador');
    return true;
  } catch (error) {
    console.error('❌ Error de autenticación:', error);
    return false;
  }
}

// Llamar a authenticateAdmin() antes de addTestAdmins()
```

Sin embargo, esta opción es menos segura y no recomendada para scripts automatizados.

## Conclusión

El uso de Firebase Admin SDK es la solución recomendada para scripts que necesitan acceso privilegiado a recursos de Firebase, especialmente cuando se ejecutan fuera del contexto de un navegador web y sin interacción del usuario.