# 🚀 Instrucciones Rápidas para Adi

## 🚨 PROBLEMA URGENTE: Separación de Entornos en GitHub Actions

**ESTADO**: ⚠️ REQUIERE ACCIÓN - Variables de entorno no configuradas

### El Problema Reportado
- `https://evidenta-bisericii.web.app` sigue apuntando a la base de datos de PRODUCCIÓN
- Los cambios se reflejan en evidenta-bisericii pero no en secretariat-ebenezer
- GitHub Actions está fallando por falta de variables de entorno

### Diagnóstico Rápido
```bash
# Verificar qué configuración usa cada sitio
npm run diagnostico-entornos

# Verificar variables en GitHub Secrets
npm run verificar-secrets
```

### ⚠️ ACCIÓN REQUERIDA PARA ADI
**DEBES configurar las nuevas variables de entorno en GitHub Secrets AHORA**

📖 **Sigue la guía**: `docs/CONFIGURACION_GITHUB_SECRETS.md`
📖 **Diagnóstico completo**: `docs/DIAGNOSTICO_GITHUB_ACTIONS.md`

---

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

## 🎯 Resultado Esperado (Después de Configurar GitHub Secrets)

Una vez configuradas las variables de entorno en GitHub:

✅ **https://secretariat-ebenezer.web.app** → Base de datos de PRODUCCIÓN  
✅ **https://evidenta-bisericii.web.app** → Base de datos de DESARROLLO  
✅ **Cada push a main** → Despliega automáticamente a AMBOS entornos  
✅ **Separación completa** → Cada entorno usa su propia configuración  

## 📞 Contacto

Si sigues teniendo problemas:
1. **PRIMERO**: Configura las variables en GitHub Secrets (ver `docs/CONFIGURACION_GITHUB_SECRETS.md`)
2. Ejecuta `npm run diagnostico` y envíame la salida
3. Podemos hacer una sesión remota
4. Mientras tanto, usa `npm run deploy-manual`

---

**💡 Tip**: El hook mejorado te permitirá elegir el entorno cada vez que hagas push, resolviendo el problema de que solo se despliegue en development.