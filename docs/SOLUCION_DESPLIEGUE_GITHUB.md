# Solución a Problemas de Despliegue con GitHub Actions

## Problema Identificado

Se ha detectado que cuando se realiza un despliegue mediante commit y push a GitHub (usando GitHub Actions), la aplicación falla con el siguiente error:

```
[2025-05-02T09:17:55.578Z] @firebase/database: FIREBASE FATAL ERROR: Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com
Uncaught Error: FIREBASE FATAL ERROR: Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com
```

Este error ocurre porque la variable de entorno `VITE_DATABASE_URL` no tiene el formato correcto o no está siendo correctamente incluida durante el proceso de despliegue automático.

## Solución Implementada

Se han realizado las siguientes mejoras para solucionar este problema:

### 1. Verificación Mejorada de Variables de Entorno

Se ha actualizado el script `deploy-check.js` para verificar no solo la presencia de las variables de entorno requeridas, sino también el formato correcto de `VITE_DATABASE_URL`, que debe seguir el patrón `https://<nombre-proyecto>.firebaseio.com`.

### 2. Script de Verificación para GitHub Actions

Se ha creado un nuevo script `scripts/verify-env-before-build.js` específicamente para ser ejecutado en el flujo de trabajo de GitHub Actions antes del proceso de build, asegurando que todas las variables de entorno estén presentes y tengan el formato correcto.

### 3. Actualización del Flujo de Trabajo de GitHub Actions

Se ha modificado el archivo `.github/workflows/firebase-hosting-merge.yml` para incluir un paso de verificación de variables de entorno antes del build, utilizando el script mencionado anteriormente.

## Cómo Verificar la Configuración

### Variables de Entorno en GitHub

1. Ve a la configuración de tu repositorio en GitHub (Settings)
2. Navega a Secrets and variables > Actions
3. Verifica que todas las variables requeridas estén configuradas correctamente:
   - `VITE_API_KEY`
   - `VITE_AUTH_DOMAIN`
   - `VITE_PROJECT_ID`
   - `VITE_STORAGE_BUCKET`
   - `VITE_MESSAGING_SENDER_ID`
   - `VITE_APP_ID`
   - `VITE_DATABASE_URL` (debe ser exactamente `https://evidenta-bisericii.firebaseio.com`)
   - `VITE_ENCRYPTION_KEY`

### Formato Correcto de VITE_DATABASE_URL

Asegúrate de que `VITE_DATABASE_URL` tenga exactamente este formato:

```
https://evidenta-bisericii.firebaseio.com
```

No debe contener comillas adicionales, espacios, o cualquier otro carácter que pueda afectar su interpretación.

## Proceso de Despliegue Recomendado

1. **Desarrollo Local**:
   - Utiliza `npm run build` y `npm run deploy` para pruebas locales
   - Esto ejecutará automáticamente `deploy-check.js` antes del despliegue

2. **Despliegue Automático con GitHub**:
   - Simplemente realiza commit y push a la rama principal
   - El flujo de trabajo de GitHub Actions se encargará de verificar las variables, construir y desplegar automáticamente

## Solución de Problemas

Si sigues experimentando problemas con el despliegue automático:

1. Revisa los logs de GitHub Actions para identificar errores específicos
2. Verifica que todas las variables de entorno en GitHub Secrets tengan exactamente el mismo formato que en tu archivo `.env` local
3. Asegúrate de que no haya caracteres invisibles o espacios adicionales en los valores de las variables

Recuerda que el despliegue manual con `npm run build` y `npm run deploy` funciona correctamente porque utiliza las variables de entorno de tu archivo `.env` local, mientras que el despliegue automático con GitHub Actions utiliza las variables configuradas en GitHub Secrets.