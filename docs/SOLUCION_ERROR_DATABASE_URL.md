# Solución al Error de URL de Firebase Database

## Error Identificado

Se ha detectado el siguiente error en la aplicación:

```
[2025-05-02T09:00:26.954Z] @firebase/database: FIREBASE FATAL ERROR: Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com
Uncaught Error: FIREBASE FATAL ERROR: Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com
```

## Causa del Problema

El error indica que hay un problema con el formato de la URL de la base de datos de Firebase (`VITE_DATABASE_URL`) en el archivo de configuración. Firebase espera que esta URL tenga un formato específico: `https://<NOMBRE-PROYECTO>.firebaseio.com`.

Posibles causas:

1. La variable `VITE_DATABASE_URL` en el archivo `.env` tiene un formato incorrecto
2. La variable `VITE_DATABASE_URL` está vacía o no está definida
3. Se está utilizando un valor incorrecto o incompleto

## Solución

### 1. Verificar y Corregir el Archivo .env

Asegúrate de que tu archivo `.env` en la raíz del proyecto contiene la variable `VITE_DATABASE_URL` con el formato correcto:

```
VITE_DATABASE_URL=https://evidenta-bisericii.firebaseio.com
```

> **IMPORTANTE**: Reemplaza `evidenta-bisericii` con el ID real de tu proyecto si es diferente.

### 2. Verificar el Formato

La URL de la base de datos de Firebase **DEBE** seguir este formato exacto:
- Debe comenzar con `https://`
- Debe incluir el nombre del proyecto seguido de `.firebaseio.com`
- No debe contener placeholders como `<YOUR FIREBASE>` o texto similar

### 3. Reiniciar la Aplicación

Después de corregir el archivo `.env`, reinicia completamente la aplicación:

```bash
npm run build
npm run deploy
```

### 4. Verificar en la Consola de Firebase

Si no estás seguro del valor correcto para `VITE_DATABASE_URL`:

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a "Realtime Database" en el menú lateral
4. La URL que aparece en la parte superior es la que debes usar

## Prevención de Futuros Errores

1. **Validación de formato**: Considera agregar una validación adicional en `deploy-check.js` que verifique no solo la presencia de `VITE_DATABASE_URL` sino también su formato correcto.

2. **Documentación clara**: Asegúrate de que todos los miembros del equipo conozcan el formato correcto para esta variable.

3. **Plantilla estandarizada**: Proporciona una plantilla `.env` con valores de ejemplo correctos para todos los desarrolladores.

## Contacto

Si después de seguir estos pasos el problema persiste, contacta al administrador del proyecto con la siguiente información:

- Captura de pantalla completa del error
- Valor actual de tu variable `VITE_DATABASE_URL` (sin incluir información sensible)
- Pasos que has seguido para intentar resolver el problema