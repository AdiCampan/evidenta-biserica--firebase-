# Configuración de GitHub Secrets para Separación de Entornos

## ❌ Problema Resuelto

El problema era que ambas URLs (desarrollo y producción) estaban desplegadas con la misma configuración porque GitHub Actions usaba las mismas variables de entorno para ambos proyectos.

## ✅ Solución Implementada

Se han modificado los workflows de GitHub Actions para:
1. **Desplegar a AMBOS entornos** en cada push a main
2. **Usar variables de entorno específicas** para cada entorno
3. **Separar completamente** las configuraciones

## 🔧 Variables de Entorno Requeridas en GitHub Secrets

Debes configurar estas variables en GitHub → Settings → Secrets and variables → Actions:

### Para PRODUCCIÓN (secretariat-ebenezer)
```
PROD_VITE_API_KEY=AIzaSyBqJ8X9X9X9X9X9X9X9X9X9X9X9X9X9X9X
PROD_VITE_AUTH_DOMAIN=secretariat-ebenezer.firebaseapp.com
PROD_VITE_PROJECT_ID=secretariat-ebenezer
PROD_VITE_STORAGE_BUCKET=secretariat-ebenezer.appspot.com
PROD_VITE_MESSAGING_SENDER_ID=123456789012
PROD_VITE_APP_ID=1:123456789012:web:abcdef123456789012345
PROD_VITE_DATABASE_URL=https://secretariat-ebenezer-default-rtdb.firebaseio.com
PROD_VITE_ENCRYPTION_KEY=tu_clave_de_cifrado_produccion_32_caracteres
PROD_SERVER_URL=https://evidenta-biserica-api.vercel.app
```

### Para DESARROLLO (evidenta-bisericii)
```
DEV_VITE_API_KEY=AIzaSyBqJ8Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y
DEV_VITE_AUTH_DOMAIN=evidenta-bisericii.firebaseapp.com
DEV_VITE_PROJECT_ID=evidenta-bisericii
DEV_VITE_STORAGE_BUCKET=evidenta-bisericii.appspot.com
DEV_VITE_MESSAGING_SENDER_ID=123456789013
DEV_VITE_APP_ID=1:123456789013:web:abcdef123456789012346
DEV_VITE_DATABASE_URL=https://evidenta-bisericii-default-rtdb.firebaseio.com
DEV_VITE_ENCRYPTION_KEY=tu_clave_de_cifrado_desarrollo_32_caracteres
DEV_SERVER_URL=http://localhost:3000
```

### Service Accounts Requeridos
```
FIREBASE_SERVICE_ACCOUNT_SECRETARIAT_EBENEZER=<JSON del service account de producción>
FIREBASE_SERVICE_ACCOUNT_EVIDENTA_BISERICII=<JSON del service account de desarrollo>
```

## 📋 Pasos para Configurar

1. **Ve a tu repositorio en GitHub**
2. **Settings → Secrets and variables → Actions**
3. **Agrega cada variable** con el botón "New repository secret"
4. **Copia exactamente** los nombres de las variables (con prefijos PROD_ y DEV_)
5. **Obtén los valores reales** desde:
   - Firebase Console → Project Settings → General
   - Firebase Console → Project Settings → Service Accounts

## 🚀 Resultado Esperado

Después de configurar las variables:

- **https://secretariat-ebenezer.web.app** → Base de datos de PRODUCCIÓN
- **https://evidenta-bisericii.web.app** → Base de datos de DESARROLLO

Cada push a `main` desplegará automáticamente a AMBOS entornos con sus configuraciones correctas.

## 🔍 Verificación

Para verificar que funciona:
1. Haz un pequeño cambio y push a main
2. Ve a GitHub Actions y verifica que ambos jobs se ejecuten
3. Verifica que cada URL apunte a su base de datos correcta

## ⚠️ Importante

- **NO elimines** las variables antiguas hasta confirmar que todo funciona
- **Guarda una copia** de todas las variables antes de hacer cambios
- **Prueba primero** con un cambio pequeño