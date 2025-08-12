# 🚨 PROBLEMA CONFIRMADO: Variables de Entorno Faltantes

## ❌ Estado Actual

**DIAGNÓSTICO COMPLETADO**: El problema está confirmado. `https://evidenta-bisericii.web.app` sigue apuntando a la base de datos de producción porque **faltan las variables de entorno en GitHub Secrets**.

### Lo que tienes configurado ✅
- ✅ `FIREBASE_SERVICE_ACCOUNT_EVIDENTA_BISERICII`
- ✅ `FIREBASE_SERVICE_ACCOUNT_SECRETARIAT_EBENEZER`

### Lo que FALTA configurar ❌
**TODAS** las variables con prefijos `DEV_` y `PROD_`:

#### Variables de DESARROLLO (DEV_)
```
DEV_VITE_API_KEY
DEV_VITE_AUTH_DOMAIN
DEV_VITE_PROJECT_ID
DEV_VITE_STORAGE_BUCKET
DEV_VITE_MESSAGING_SENDER_ID
DEV_VITE_APP_ID
DEV_VITE_DATABASE_URL
DEV_VITE_ENCRYPTION_KEY
DEV_SERVER_URL
```

#### Variables de PRODUCCIÓN (PROD_)
```
PROD_VITE_API_KEY
PROD_VITE_AUTH_DOMAIN
PROD_VITE_PROJECT_ID
PROD_VITE_STORAGE_BUCKET
PROD_VITE_MESSAGING_SENDER_ID
PROD_VITE_APP_ID
PROD_VITE_DATABASE_URL
PROD_VITE_ENCRYPTION_KEY
PROD_SERVER_URL
```

## 🛠️ SOLUCIÓN PASO A PASO

### Paso 1: Obtener Valores de Firebase Console

#### Para DESARROLLO (evidenta-bisericii)
1. Ir a: https://console.firebase.google.com/project/evidenta-bisericii
2. Ir a: **Project Settings** → **General** → **Your apps**
3. Seleccionar tu app web
4. Copiar la configuración que se ve así:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "evidenta-bisericii.firebaseapp.com",
  projectId: "evidenta-bisericii",
  storageBucket: "evidenta-bisericii.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  databaseURL: "https://evidenta-bisericii-default-rtdb.europe-west1.firebasedatabase.app"
};
```

#### Para PRODUCCIÓN (secretariat-ebenezer)
1. Ir a: https://console.firebase.google.com/project/secretariat-ebenezer
2. Repetir el mismo proceso

### Paso 2: Configurar en GitHub Secrets

1. Ir a: **GitHub** → **Settings** → **Secrets and variables** → **Actions**
2. Hacer clic en **"New repository secret"**
3. Agregar CADA variable con su valor correspondiente:

#### Ejemplo para DESARROLLO:
- **Name**: `DEV_VITE_API_KEY`
- **Secret**: `AIza...` (el valor de apiKey de evidenta-bisericii)

- **Name**: `DEV_VITE_AUTH_DOMAIN`
- **Secret**: `evidenta-bisericii.firebaseapp.com`

- **Name**: `DEV_VITE_PROJECT_ID`
- **Secret**: `evidenta-bisericii`

- **Name**: `DEV_VITE_DATABASE_URL`
- **Secret**: `https://evidenta-bisericii-default-rtdb.europe-west1.firebasedatabase.app`

#### Ejemplo para PRODUCCIÓN:
- **Name**: `PROD_VITE_API_KEY`
- **Secret**: `AIza...` (el valor de apiKey de secretariat-ebenezer)

- **Name**: `PROD_VITE_AUTH_DOMAIN`
- **Secret**: `secretariat-ebenezer.firebaseapp.com`

- **Name**: `PROD_VITE_PROJECT_ID`
- **Secret**: `secretariat-ebenezer`

- **Name**: `PROD_VITE_DATABASE_URL`
- **Secret**: `https://secretariat-ebenezer-default-rtdb.europe-west1.firebasedatabase.app`

### Paso 3: Variables Especiales

Para las variables de encriptación y servidor:
- `DEV_VITE_ENCRYPTION_KEY`: Usar la misma clave que tienes actualmente
- `DEV_SERVER_URL`: `https://evidenta-bisericii.web.app`
- `PROD_VITE_ENCRYPTION_KEY`: Usar la misma clave que tienes actualmente
- `PROD_SERVER_URL`: `https://secretariat-ebenezer.web.app`

## 🎯 RESULTADO ESPERADO

Una vez configuradas TODAS las variables:

1. **GitHub Actions funcionará correctamente** ✅
2. **`https://evidenta-bisericii.web.app` apuntará a la base de datos de desarrollo** ✅
3. **`https://secretariat-ebenezer.web.app` apuntará a la base de datos de producción** ✅
4. **Cada push desplegará automáticamente a ambos entornos con sus configuraciones correctas** ✅

## 🔍 VERIFICACIÓN

Después de configurar las variables, ejecutar:
```bash
npm run verificar-secrets
npm run diagnostico-entornos
```

## ⚠️ IMPORTANTE

**SIN estas variables configuradas, el sistema NO PUEDE funcionar correctamente**. GitHub Actions seguirá fallando y ambos sitios seguirán usando la configuración anterior.

**DEBES configurar TODAS las variables listadas arriba para que funcione.**