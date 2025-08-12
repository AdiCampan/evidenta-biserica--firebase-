# 🔍 Diagnóstico del Problema de GitHub Actions

## ❌ Problema Reportado por Adi

**Síntoma**: `https://evidenta-bisericii.web.app` sigue apuntando a la base de datos de PRODUCCIÓN en lugar de DESARROLLO.

**Evidencia**: 
- Los cambios se reflejan en evidenta-bisericii.web.app pero no en secretariat-ebenezer.web.app
- En Inspeccionar → Network → Payload se ve que usa la configuración de producción

## 🔍 Posibles Causas

### 1. Variables de Entorno No Configuradas en GitHub Secrets

Las variables con prefijo `DEV_` y `PROD_` no están configuradas en GitHub Secrets.

**Verificar en**: GitHub → Settings → Secrets and variables → Actions

**Variables requeridas**:
```
# Para DESARROLLO (evidenta-bisericii)
DEV_VITE_API_KEY
DEV_VITE_AUTH_DOMAIN
DEV_VITE_PROJECT_ID
DEV_VITE_DATABASE_URL
DEV_VITE_ENCRYPTION_KEY
DEV_SERVER_URL

# Para PRODUCCIÓN (secretariat-ebenezer)
PROD_VITE_API_KEY
PROD_VITE_AUTH_DOMAIN
PROD_VITE_PROJECT_ID
PROD_VITE_DATABASE_URL
PROD_VITE_ENCRYPTION_KEY
PROD_SERVER_URL

# Service Accounts
FIREBASE_SERVICE_ACCOUNT_EVIDENTA_BISERICII
FIREBASE_SERVICE_ACCOUNT_SECRETARIAT_EBENEZER
```

### 2. GitHub Actions Falló Silenciosamente

El workflow puede haber fallado pero el sitio sigue funcionando con la configuración anterior.

**Verificar en**: GitHub → Actions → Ver logs del último workflow

### 3. Cache del Navegador

El navegador puede estar cacheando la versión anterior.

**Solución**: Ctrl+F5 o abrir en ventana incógnita

### 4. Variables Antiguas Aún Activas

Las variables sin prefijo (`VITE_API_KEY`, etc.) pueden estar interfiriendo.

## 🛠️ Pasos para Diagnosticar

### Paso 1: Verificar Variables en GitHub
1. Ir a GitHub → Settings → Secrets and variables → Actions
2. Verificar que existen TODAS las variables con prefijos `DEV_` y `PROD_`
3. Verificar que los service accounts están configurados

### Paso 2: Verificar Logs de GitHub Actions
1. Ir a GitHub → Actions
2. Ver el último workflow ejecutado
3. Revisar si hay errores en los jobs `deploy_development` y `deploy_production`

### Paso 3: Verificar Configuración de Firebase
1. Verificar que `.firebaserc` tiene los proyectos correctos:
   ```json
   {
     "projects": {
       "default": "secretariat-ebenezer",
       "production": "secretariat-ebenezer",
       "development": "evidenta-bisericii"
     }
   }
   ```

### Paso 4: Forzar Nuevo Deploy
1. Hacer un cambio pequeño (agregar un comentario)
2. Commit y push
3. Verificar que ambos jobs se ejecuten en GitHub Actions

## 🚨 Solución Inmediata

Si el problema persiste, usar deploy manual:

```bash
# Para desarrollo
firebase use development
npm run build
firebase deploy

# Para producción
firebase use production
npm run build
firebase deploy
```

## 📋 Checklist para Adi

- [ ] ✅ Variables `DEV_*` configuradas en GitHub Secrets
- [ ] ✅ Variables `PROD_*` configuradas en GitHub Secrets
- [ ] ✅ Service accounts configurados
- [ ] ✅ GitHub Actions ejecutándose sin errores
- [ ] ✅ Ambos sitios apuntan a sus bases de datos correctas
- [ ] ✅ Cache del navegador limpiado

## 🔗 Enlaces Útiles

- [Configuración GitHub Secrets](./CONFIGURACION_GITHUB_SECRETS.md)
- [Instrucciones para Adi](../INSTRUCCIONES_PARA_ADI.md)
- GitHub Actions: `https://github.com/TU_USUARIO/TU_REPO/actions`
- Firebase Console: `https://console.firebase.google.com`