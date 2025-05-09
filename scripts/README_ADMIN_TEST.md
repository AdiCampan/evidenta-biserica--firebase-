# Añadir Administradores para el Entorno de Prueba

Este documento explica cómo añadir los correos electrónicos especificados como administradores autorizados en el entorno de prueba (test) de la aplicación Firebase.

## Correos Electrónicos Configurados

El script está configurado para añadir los siguientes correos electrónicos como administradores autorizados:

- victor.calatayud.espinosa@gmail.com
- secretariatebenezercastellon@gmail.com
- adicampan1974@gmail.com

## Cómo Ejecutar el Script

Para añadir estos correos como administradores autorizados, sigue estos pasos:

1. Asegúrate de estar en el directorio raíz del proyecto
2. Ejecuta el siguiente comando:

```bash
npm run add-test-admins
```

## Qué Hace el Script

El script realiza las siguientes acciones:

1. Carga la configuración de Firebase del entorno de prueba (archivo `.env.development`)
2. Se conecta a la base de datos Firestore del proyecto de prueba
3. Para cada correo electrónico en la lista:
   - Verifica si ya existe en la colección `authorizedAdmins`
   - Si no existe, lo añade con la marca `isTestAdmin: true`
   - Si ya existe, muestra un mensaje informativo

## Verificación

Una vez ejecutado el script, puedes verificar que los correos han sido añadidos correctamente:

1. Inicia sesión en la consola de Firebase del proyecto de prueba
2. Ve a Firestore Database
3. Busca la colección `authorizedAdmins`
4. Verifica que los tres correos electrónicos aparecen en la colección

## Solución de Problemas

Si encuentras algún error al ejecutar el script:

1. Verifica que el archivo `.env.development` existe y contiene las credenciales correctas de Firebase
2. Asegúrate de tener permisos de escritura en la base de datos Firestore
3. Verifica la conexión a internet

Si el problema persiste, revisa los mensajes de error en la consola para obtener más información.