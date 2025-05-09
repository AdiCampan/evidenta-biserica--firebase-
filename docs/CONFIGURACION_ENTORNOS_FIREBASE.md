# Configuración de Entornos Firebase

## Descripción

Este proyecto está configurado para trabajar con dos bases de datos Firebase diferentes:

1. **Entorno de Producción**: Base de datos principal para la versión en producción
2. **Entorno de Desarrollo/Test**: Base de datos secundaria para pruebas y desarrollo local

## Configuración Implementada

Se han creado archivos de configuración separados para cada entorno:

- `.env.production`: Contiene las credenciales para el entorno de producción (evidenta-bisericii)
- `.env.development`: Contiene las credenciales para el entorno de desarrollo (helpsecretariat-ebenezer)

## Cómo Usar los Diferentes Entornos

Se han agregado scripts en el `package.json` para facilitar el cambio entre entornos:

### Para desarrollo local con la base de datos de TEST

```bash
npm run dev
```

Este comando ejecutará la aplicación en modo desarrollo, utilizando las credenciales de Firebase del proyecto `helpsecretariat-ebenezer`.

### Para desarrollo local con la base de datos de PRODUCCIÓN

```bash
npm run prod
```

Este comando ejecutará la aplicación en modo producción, utilizando las credenciales de Firebase del proyecto `evidenta-bisericii`.

### Para construir la aplicación para producción

```bash
npm run build:prod
```

Este comando construirá la aplicación utilizando las credenciales de producción, listo para ser desplegado.

## Verificación del Entorno Activo

Para verificar qué entorno está activo, puedes revisar la consola del navegador. La aplicación mostrará mensajes como:

```
Entorno actual: PRODUCCIÓN
Conectando a Firebase: evidenta-bisericii
```

o

```
Entorno actual: DESARROLLO
Conectando a Firebase: helpsecretariat-ebenezer
```

## Notas Importantes

1. **Seguridad**: Nunca compartas las credenciales de Firebase en repositorios públicos.
2. **Despliegue**: Al desplegar la aplicación, asegúrate de usar el comando `npm run build:prod` para utilizar las credenciales de producción.
3. **Variables de Entorno**: Si necesitas agregar nuevas variables de entorno, asegúrate de añadirlas a ambos archivos (`.env.development` y `.env.production`).

## Solución de Problemas

Si encuentras problemas con la conexión a Firebase, verifica:

1. Que estás utilizando el comando correcto para el entorno deseado
2. Que las credenciales en los archivos `.env.development` y `.env.production` son correctas
3. Que el formato de las URLs de la base de datos es correcto (sin espacios o comillas adicionales)