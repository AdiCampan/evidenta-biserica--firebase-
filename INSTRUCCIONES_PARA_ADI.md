# 🚀 Instrucciones Rápidas para Adi

## 🆘 Solución Inmediata

### Si VS Code muestra error "No such file or directory":
```bash
npm run reparar-git
```

### Si tienes problemas con los git hooks y necesitas hacer deploy **AHORA**:

```bash
# Opción 1: Deploy manual con selección de entorno
npm run deploy-manual

# Opción 2: Deploy directo (sin hooks)
firebase use development  # o production
npm run build
firebase deploy
```

## 🔍 Diagnóstico del Problema

Para ver qué está fallando:

```bash
npm run diagnostico
```

Este comando te mostrará:
- ✅ Qué está bien configurado
- ❌ Qué está fallando
- 💡 Recomendaciones específicas

## 🛠️ Solución Definitiva

### Paso 1: Instalar el hook mejorado
```bash
npm run install-hooks-mejorado
```

**Selecciona la opción 2** (Hook mejorado con selección de entorno)

### Paso 2: Probar el nuevo hook
```bash
# Hacer un cambio pequeño
git add .
git commit -m "Test: probando hook mejorado"
git push
```

Ahora verás un menú para elegir:
- 1) Development
- 2) Production  
- 3) Cancelar

## 🎯 Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm run reparar-git` | **Reparar errores de Git en VS Code** |
| `npm run diagnostico` | Revisar qué está fallando |
| `npm run deploy-manual` | Deploy con selección de entorno |
| `npm run install-hooks-mejorado` | Instalar hook mejorado |
| `firebase use development` | Cambiar a desarrollo |
| `firebase use production` | Cambiar a producción |
| `firebase projects:list` | Ver proyectos disponibles |

## 🚨 Si Nada Funciona

### Reinstalar Firebase CLI
```bash
npm uninstall -g firebase-tools
npm install -g firebase-tools
firebase login
```

### Reparar permisos
```bash
chmod +x .git/hooks/pre-push
```

### Deploy de emergencia
```bash
# Para development
firebase use development && npm run build && firebase deploy

# Para production
firebase use production && npm run build && firebase deploy
```

## 📱 URLs de los Proyectos

- **Development**: https://evidenta-bisericii.web.app
- **Production**: https://secretariat-ebenezer.web.app

## 📞 Contacto

Si sigues teniendo problemas:
1. Ejecuta `npm run diagnostico` y envíame la salida
2. Podemos hacer una sesión remota
3. Mientras tanto, usa `npm run deploy-manual`

---

**💡 Tip**: El hook mejorado te permitirá elegir el entorno cada vez que hagas push, resolviendo el problema de que solo se despliegue en development.