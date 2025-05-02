# Proceso de Despliegue Estandarizado

## Problema Identificado

Se han detectado los siguientes problemas durante el despliegue de la aplicación:

- Las claves API de Firebase cambian durante el despliegue
- Errores de Content-Security-Policy
- Inconsistencia en el proceso de despliegue entre miembros del equipo

## Solución Implementada

Hemos implementado las siguientes mejoras para solucionar estos problemas:

1. **Verificación de variables de entorno**: Scripts que verifican que todas las variables necesarias estén presentes antes del despliegue.
2. **Proceso de despliegue estandarizado**: Instrucciones claras sobre cómo realizar el despliegue correctamente.
3. **Configuración de CI/CD mejorada**: El flujo de trabajo de GitHub Actions ahora incluye las variables de entorno necesarias.
4. **Política de seguridad actualizada**: Se ha actualizado la política de seguridad de contenido para permitir todas las conexiones necesarias.

## Instrucciones para el Equipo

### Configuración Local

1. **Archivo .env**: Asegúrate de tener un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
VITE_API_KEY=valor-correcto
VITE_AUTH_DOMAIN=valor-correcto
VITE_PROJECT_ID=evidenta-bisericii
VITE_STORAGE_BUCKET=valor-correcto
VITE_MESSAGING_SENDER_ID=valor-correcto
VITE_APP_ID=valor-correcto
VITE_DATABASE_URL=valor-correcto
VITE_ENCRYPTION_KEY=valor-correcto
```

> **IMPORTANTE**: Contacta al administrador del proyecto para obtener los valores correctos. No compartas estos valores en repositorios públicos o chats no seguros.

2. **Instalación de dependencias**: Asegúrate de tener todas las dependencias instaladas:

```bash
npm ci
```

### Proceso de Despliegue Local

Siempre sigue estos pasos en orden:

1. **Construir la aplicación**:

```bash
npm run build
```

2. **Desplegar a Firebase**:

```bash
npm run deploy
```

> **NOTA**: El script `predeploy` verificará automáticamente que todas las variables de entorno necesarias estén presentes antes de realizar el despliegue.

### Solución de Problemas

Si encuentras problemas durante el despliegue:

1. **Error de variables de entorno faltantes**:
   - Verifica que tu archivo `.env` contiene todas las variables requeridas
   - Asegúrate de que los valores son correctos (contacta al administrador si es necesario)

2. **Error de Content-Security-Policy**:
   - Verifica que estás usando la versión más reciente del archivo `firebase.json`
   - Si el problema persiste, puede ser necesario actualizar la política para incluir nuevos dominios

3. **La aplicación no funciona después del despliegue**:
   - Verifica la consola del navegador para identificar errores específicos
   - Asegúrate de haber seguido el proceso completo (build + deploy)
   - Verifica que las claves API en tu `.env` coinciden con las del proyecto Firebase

## Despliegue Automático

Cuando se hace push a la rama `main`, GitHub Actions realizará automáticamente el proceso de build y deploy. Para que esto funcione correctamente:

1. Asegúrate de que todos los secretos necesarios estén configurados en la configuración del repositorio en GitHub:
   - `VITE_API_KEY`
   - `VITE_AUTH_DOMAIN`
   - `VITE_PROJECT_ID`
   - `VITE_STORAGE_BUCKET`
   - `VITE_MESSAGING_SENDER_ID`
   - `VITE_APP_ID`
   - `VITE_DATABASE_URL`
   - `VITE_ENCRYPTION_KEY`

2. Verifica el estado del despliegue en la pestaña "Actions" del repositorio en GitHub.

## Contacto

Si tienes problemas con el despliegue que no puedes resolver siguiendo estas instrucciones, contacta al administrador del proyecto.