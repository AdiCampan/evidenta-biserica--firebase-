# Automatización de Build y Deploy con Hooks de Git

## Introducción

Este documento explica cómo se ha implementado un sistema de automatización para el proceso de build y deploy utilizando hooks de Git. Esta solución permite que todos los miembros del equipo tengan el mismo flujo de trabajo automatizado sin necesidad de modificar manualmente la carpeta `.git/hooks` de cada repositorio local.

## Problema Resuelto

Anteriormente, no era posible compartir hooks de Git a través del control de versiones, ya que la carpeta `.git` no se incluye en el repositorio. Esto significaba que cada desarrollador tenía que configurar manualmente sus hooks, lo que podía llevar a inconsistencias en el proceso de despliegue.

## Solución Implementada

Hemos creado un sistema que:

1. Almacena los hooks de Git en la carpeta `scripts/git-hooks/` que sí se incluye en el repositorio.
2. Proporciona un script de instalación que copia estos hooks a la carpeta `.git/hooks/` local de cada desarrollador.
3. Configura el `package.json` para ejecutar automáticamente este script de instalación cuando se ejecuta `npm install`.

## Componentes de la Solución

### 1. Hook Pre-Push

El hook `pre-push` se ejecuta automáticamente antes de que Git complete un push al repositorio remoto. Nuestro hook realiza las siguientes acciones:

- Verifica que no haya cambios sin commit.
- Ejecuta la verificación de variables de entorno mediante `deploy-check.js`.
- Realiza el build del proyecto (`npm run build`).
- Despliega la aplicación a Firebase (`firebase deploy`).

Si cualquiera de estos pasos falla, el push se cancela, evitando que se envíen cambios problemáticos al repositorio remoto.

### 2. Script de Instalación de Hooks

El script `scripts/install-git-hooks.js` se encarga de:

- Copiar todos los hooks desde `scripts/git-hooks/` a la carpeta `.git/hooks/` local.
- Hacer los hooks ejecutables con `chmod +x`.
- Proporcionar retroalimentación sobre el proceso de instalación.

### 3. Integración con NPM

Se han añadido dos scripts en `package.json`:

- `postinstall`: Ejecuta automáticamente el script de instalación de hooks después de `npm install`.
- `install-git-hooks`: Permite ejecutar manualmente la instalación de hooks con `npm run install-git-hooks`.

## Cómo Funciona para los Desarrolladores

### Nuevos Desarrolladores

Cuando un nuevo desarrollador clona el repositorio y ejecuta `npm install`, los hooks se instalan automáticamente sin necesidad de pasos adicionales.

### Desarrolladores Existentes

Los desarrolladores que ya tienen el repositorio clonado pueden actualizar sus hooks ejecutando:

```bash
npm run install-git-hooks
```

### Proceso de Despliegue

Con esta solución, el proceso de despliegue se simplifica a:

1. Realizar cambios en el código.
2. Hacer commit de los cambios: `git add . && git commit -m "mensaje"`.
3. Hacer push al repositorio: `git push`.

El hook `pre-push` se encargará automáticamente de verificar, construir y desplegar la aplicación.

## Ventajas de Esta Solución

- **Consistencia**: Todos los desarrolladores utilizan exactamente el mismo proceso de despliegue.
- **Prevención de Errores**: Se verifican las variables de entorno y el build antes de completar el push.
- **Automatización**: Reduce los pasos manuales necesarios para el despliegue.
- **Compartible**: Los hooks se incluyen en el repositorio y se instalan automáticamente.

## Solución de Problemas

Si experimentas problemas con los hooks de Git:

1. Verifica que los scripts sean ejecutables: `chmod +x scripts/git-hooks/*`
2. Reinstala los hooks manualmente: `npm run install-git-hooks`
3. Verifica que la carpeta `.git/hooks/` contenga el hook `pre-push` y que sea ejecutable.

## Notas Importantes

- Este sistema no interfiere con GitHub Actions, que sigue funcionando normalmente para CI/CD.
- Los hooks solo se ejecutan en operaciones locales de Git, no en el servidor de GitHub.
- Si necesitas hacer un push sin ejecutar el hook (en caso de emergencia), puedes usar: `git push --no-verify`.