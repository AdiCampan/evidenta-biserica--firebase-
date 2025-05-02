# Guía de Despliegue para Evidenta Biserica Firebase

## Problema Identificado

Se han detectado los siguientes problemas durante el despliegue de la aplicación:

1. **Cambio de claves API de Firebase**: Cuando se realiza un despliegue, las claves API de Firebase pueden cambiar, lo que impide que la página desplegada funcione correctamente.
2. **Errores de Content-Security-Policy**: Se observan fallos relacionados con la política de seguridad de contenido que impiden modificar y guardar cambios.
3. **Inconsistencia en el proceso de despliegue**: Diferentes miembros del equipo pueden estar usando diferentes claves API o procesos de despliegue.

## Causas Probables

1. **Variables de entorno inconsistentes**: Cada desarrollador puede estar usando diferentes valores en su archivo `.env` local.
2. **Proceso de CI/CD incompleto**: El flujo de trabajo de GitHub Actions no está configurado correctamente para manejar las variables de entorno durante el despliegue.
3. **Falta de sincronización en el proceso de despliegue**: No todos los miembros del equipo siguen el mismo proceso (build + deploy).

## Solución Propuesta

### 1. Estandarizar el Archivo .env

Asegúrate de que todos los miembros del equipo tengan el mismo archivo `.env` con las claves API correctas:

```
VITE_API_KEY=valor-correcto
VITE_AUTH_DOMAIN=valor-correcto
VITE_PROJECT_ID=evidenta-bisericii
VITE_STORAGE_BUCKET=valor-correcto
VITE_MESSAGING_SENDER_ID=valor-correcto
VITE_APP_ID=valor-correcto
VITE_DATABASE_URL=valor-correcto

# Configuración de seguridad
VITE_ENCRYPTION_KEY=valor-correcto
```

### 2. Configurar Variables de Entorno en GitHub Actions

Para asegurar que los despliegues automáticos usen las claves correctas, configura las variables de entorno en GitHub Actions:

1. Ve a la configuración del repositorio en GitHub
2. Navega a "Settings" > "Secrets and variables" > "Actions"
3. Añade cada variable de entorno como un secreto:
   - `VITE_API_KEY`
   - `VITE_AUTH_DOMAIN`
   - `VITE_PROJECT_ID`
   - `VITE_STORAGE_BUCKET`
   - `VITE_MESSAGING_SENDER_ID`
   - `VITE_APP_ID`
   - `VITE_DATABASE_URL`
   - `VITE_ENCRYPTION_KEY`

### 3. Actualizar el Flujo de Trabajo de GitHub Actions

Modifica el archivo `.github/workflows/firebase-hosting-merge.yml` para incluir las variables de entorno:

```yaml
name: Deploy to Firebase Hosting on merge
on:
  push:
    branches:
      - main
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Create .env file
        run: |
          echo "VITE_API_KEY=${{ secrets.VITE_API_KEY }}" >> .env
          echo "VITE_AUTH_DOMAIN=${{ secrets.VITE_AUTH_DOMAIN }}" >> .env
          echo "VITE_PROJECT_ID=${{ secrets.VITE_PROJECT_ID }}" >> .env
          echo "VITE_STORAGE_BUCKET=${{ secrets.VITE_STORAGE_BUCKET }}" >> .env
          echo "VITE_MESSAGING_SENDER_ID=${{ secrets.VITE_MESSAGING_SENDER_ID }}" >> .env
          echo "VITE_APP_ID=${{ secrets.VITE_APP_ID }}" >> .env
          echo "VITE_DATABASE_URL=${{ secrets.VITE_DATABASE_URL }}" >> .env
          echo "VITE_ENCRYPTION_KEY=${{ secrets.VITE_ENCRYPTION_KEY }}" >> .env
      - run: npm ci && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_EVIDENTA_BISERICII }}
          channelId: live
          projectId: evidenta-bisericii
```

### 4. Actualizar la Política de Seguridad de Contenido

Modifica el archivo `firebase.json` para asegurar que la política de seguridad de contenido permita todas las conexiones necesarias:

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
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://firebasestorage.googleapis.com; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com"
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
  }
}
```

### 5. Establecer un Proceso de Despliegue Estándar

Todos los miembros del equipo deben seguir el mismo proceso de despliegue:

1. **Despliegue Local**:
   ```bash
   # Asegúrate de tener el archivo .env correcto
   npm run build
   npm run deploy
   ```

2. **Despliegue Automático**:
   - Simplemente haz push a la rama `main` y deja que GitHub Actions se encargue del despliegue.

### 6. Verificación de Variables de Entorno

Añade un script de verificación que se ejecute antes del despliegue para asegurar que todas las variables de entorno necesarias estén presentes:

```javascript
// deploy-check.js
const requiredEnvVars = [
  'VITE_API_KEY',
  'VITE_AUTH_DOMAIN',
  'VITE_PROJECT_ID',
  'VITE_STORAGE_BUCKET',
  'VITE_MESSAGING_SENDER_ID',
  'VITE_APP_ID',
  'VITE_DATABASE_URL'
];

let missingVars = [];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
}

if (missingVars.length > 0) {
  console.error('Error: Faltan variables de entorno requeridas:', missingVars.join(', '));
  process.exit(1);
} else {
  console.log('✅ Todas las variables de entorno requeridas están presentes');
}
```

Luego actualiza el `package.json` para incluir este script:

```json
"scripts": {
  "start": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "predeploy": "node deploy-check.js",
  "deploy": "firebase deploy"
}
```

## Conclusión

Siguiendo estos pasos, deberías poder solucionar los problemas de despliegue relacionados con las claves API de Firebase y los errores de Content-Security-Policy. La clave está en asegurar que todos los miembros del equipo usen las mismas claves API y sigan el mismo proceso de despliegue.