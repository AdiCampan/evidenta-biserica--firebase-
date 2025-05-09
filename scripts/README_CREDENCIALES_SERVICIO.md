# Configuración de Credenciales de Servicio para Firebase Admin SDK

Este documento explica cómo generar y configurar el archivo de credenciales de servicio necesario para ejecutar el script `add-test-admins-admin-sdk.js` que utiliza Firebase Admin SDK.

## Generación del Archivo de Credenciales de Servicio

Para generar el archivo de credenciales de servicio, sigue estos pasos:

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto (`helpsecretariat-ebenezer`)
3. Ve a **Configuración del proyecto** (icono de engranaje) > **Cuentas de servicio**
4. En la pestaña **Firebase Admin SDK**, haz clic en **Generar nueva clave privada**
5. Guarda el archivo JSON descargado como `serviceAccountKey.json` en la raíz del proyecto

## Ubicación del Archivo

El archivo `serviceAccountKey.json` debe colocarse en la raíz del proyecto:

```
evidenta-biserica-firebase/
├── serviceAccountKey.json  <-- Aquí
├── package.json
├── scripts/
│   ├── add-test-admins-admin-sdk.js
│   └── ...
└── ...
```

## Consideraciones de Seguridad

⚠️ **IMPORTANTE**: El archivo `serviceAccountKey.json` contiene credenciales sensibles que otorgan acceso administrativo a tu proyecto de Firebase.

- **NO** incluyas este archivo en el control de versiones (Git)
- **NO** compartas este archivo con personas no autorizadas
- **NO** lo expongas en entornos públicos

Para asegurar que el archivo no se incluya accidentalmente en el repositorio, asegúrate de que esté listado en el archivo `.gitignore`:

```
# Firebase
serviceAccountKey.json
```

## Ejecución del Script

Una vez que hayas configurado correctamente el archivo de credenciales, puedes ejecutar el script con:

```bash
npm run add-test-admins-admin
```

## Solución de Problemas

Si encuentras errores al ejecutar el script:

1. **Error de archivo no encontrado**: Verifica que el archivo `serviceAccountKey.json` esté en la ubicación correcta (raíz del proyecto)
2. **Error de permisos**: Asegúrate de que la cuenta de servicio tenga los permisos necesarios en Firebase
3. **Error de formato**: Verifica que el archivo JSON descargado no haya sido modificado

## Alternativas

Si prefieres no guardar el archivo de credenciales en el sistema de archivos, puedes configurar las credenciales como variables de entorno. Para ello, modifica el script `add-test-admins-admin-sdk.js` para utilizar variables de entorno en lugar del archivo JSON.