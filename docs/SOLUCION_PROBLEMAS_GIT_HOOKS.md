# Solución a Problemas con Git Hooks y Deployment

## 📋 Resumen del Problema

Adi está experimentando problemas con los git hooks donde:
- Solo se despliega en el entorno de **development** 
- No puede seleccionar el entorno de **production**
- Recibe errores de Node.js al hacer commit y push desde VS Code

## 🔍 Análisis del Problema

### Problema Principal
El hook actual (`scripts/git-hooks/pre-push`) está configurado para hacer deploy automático pero **no permite seleccionar el entorno**. Siempre usa el proyecto configurado como "default" en `.firebaserc`, que actualmente es `secretariat-ebenezer` (production), pero algo en la configuración local está causando que se despliegue en development.

### Posibles Causas
1. **Configuración de Firebase CLI**: El comando `firebase use` puede estar configurado localmente para development
2. **Variables de entorno**: Pueden estar configuradas para development
3. **Permisos del hook**: El archivo pre-push puede no tener permisos de ejecución
4. **Versión de Node.js**: Incompatibilidad con la versión de Node.js instalada

## 🛠️ Soluciones Implementadas

### 1. Script de Diagnóstico
**Archivo**: `scripts/diagnostico-git-hooks.js`

```bash
# Ejecutar diagnóstico completo
node scripts/diagnostico-git-hooks.js
```

Este script verifica:
- ✅ Estructura de directorios
- ✅ Hooks instalados y permisos
- ✅ Variables de entorno
- ✅ Comandos disponibles (Node, npm, Firebase CLI)
- ✅ Configuración de Firebase
- ✅ Estado de Git

### 2. Hook Mejorado con Selección de Entorno
**Archivo**: `scripts/git-hooks/pre-push-mejorado`

Características:
- 🎯 **Selección interactiva** de entorno (development/production)
- 🔧 **Configuración automática** del proyecto Firebase
- ✅ **Verificación completa** antes del deploy
- 🌐 **URLs de resultado** después del deploy

### 3. Instalador Mejorado de Hooks
**Archivo**: `scripts/install-git-hooks-mejorado.js`

Opciones disponibles:
1. **Hook original**: Deploy automático sin selección
2. **Hook mejorado**: Con selección de entorno
3. **Sin hook**: Desinstalar hooks existentes

## 🚀 Pasos para Resolver el Problema

### Paso 1: Diagnóstico
```bash
# Ejecutar desde la raíz del proyecto
node scripts/diagnostico-git-hooks.js
```

### Paso 2: Instalar Hook Mejorado
```bash
# Ejecutar instalador mejorado
node scripts/install-git-hooks-mejorado.js

# Seleccionar opción 2 (Hook mejorado)
```

### Paso 3: Verificar Configuración de Firebase
```bash
# Ver proyectos disponibles
firebase projects:list

# Ver proyecto actual
firebase use

# Cambiar a development si es necesario
firebase use development

# Cambiar a production si es necesario
firebase use production
```

### Paso 4: Verificar Variables de Entorno
```bash
# Verificar variables
node scripts/verificar-entorno-firebase.js

# O usar el script de verificación del deploy
node deploy-check.js
```

### Paso 5: Probar el Nuevo Hook
```bash
# Hacer un cambio pequeño y commit
git add .
git commit -m "Test: probando hook mejorado"

# Al hacer push, aparecerá el menú de selección
git push
```

## 🔧 Comandos de Emergencia

### Deploy Manual (sin hooks)
```bash
# Para development
firebase use development
npm run build
firebase deploy

# Para production
firebase use production
npm run build
firebase deploy
```

### Reinstalar Firebase CLI
```bash
# Desinstalar
npm uninstall -g firebase-tools

# Reinstalar
npm install -g firebase-tools

# Login nuevamente
firebase login
```

### Reparar Permisos de Hooks
```bash
# Dar permisos de ejecución
chmod +x .git/hooks/pre-push

# Verificar permisos
ls -la .git/hooks/pre-push
```

## 📱 Uso del Hook Mejorado

Cuando hagas `git push`, verás este menú:

```
🌍 Selecciona el entorno de deployment:
1) Development (evidenta-bisericii)
2) Production (secretariat-ebenezer)
3) Cancelar deployment

Ingresa tu opción (1-3):
```

### Opciones:
- **Opción 1**: Despliega en https://evidenta-bisericii.web.app
- **Opción 2**: Despliega en https://secretariat-ebenezer.web.app
- **Opción 3**: Cancela el deployment y continúa con el push

## 🐛 Solución a Errores Comunes

### Error: "firebase: command not found"
```bash
npm install -g firebase-tools
firebase login
```

### Error: "Permission denied"
```bash
chmod +x .git/hooks/pre-push
```

### Error: Variables de entorno faltantes
1. Verificar archivo `.env` en la raíz del proyecto
2. Copiar desde `.env.example` si es necesario
3. Configurar las variables correctas para cada entorno

### Error: "Project not found"
```bash
firebase projects:list
firebase use <nombre-del-proyecto>
```

## 📞 Contacto y Soporte

Si sigues teniendo problemas:
1. Ejecuta el diagnóstico y envía los resultados
2. Podemos hacer una sesión remota para revisar la configuración
3. Considera usar el deploy manual mientras solucionamos el hook

## 🔄 Volver al Hook Original

Si prefieres el comportamiento anterior:
```bash
node scripts/install-git-hooks-mejorado.js
# Seleccionar opción 1 (Hook original)
```

---

**Nota**: Todos estos scripts están diseñados para ser seguros y no afectar el código existente. Solo modifican la configuración de deployment y git hooks.