# 🚂 Guía de Deploy en Railway - Modo Standalone

## ❓ ¿Railway reconoce automáticamente el modo standalone?

**Respuesta: NO** ❌

Railway por defecto ejecuta `npm start` (que usa `next start` normal). Con `output: 'standalone'`, necesitas configuración adicional.

---

## 🎯 Tienes 2 Opciones

### **Opción 1: Usar Standalone (Máximo ahorro de RAM - Recomendado)**

✅ **Ventajas:**
- Bundle de solo **44 MB** (vs ~800 MB)
- RAM: **400-600 MB** (vs 1-2 GB)
- Cold start más rápido

⚠️ **Requiere:**
- Configurar Start Command en Railway
- Copiar archivos estáticos

---

### **Opción 2: Modo Normal (Más Simple)**

✅ **Ventajas:**
- Funciona sin configuración adicional
- Railway lo reconoce automáticamente

❌ **Desventajas:**
- Bundle más grande (~800 MB)
- RAM: **800 MB - 1 GB** (mejor que antes, pero no óptimo)

---

## 📋 Instrucciones para Opción 1 (Standalone)

### **Paso 1: Configurar Railway**

Ve a tu proyecto en Railway → **Settings** → **Deploy**

Configura:

```bash
# Build Command
npm install && npm run build

# Start Command (⚠️ IMPORTANTE - cambia esto)
npm run start:standalone
```

**¿Por qué?**
- El script `start:standalone` copia automáticamente los archivos estáticos necesarios

### **Paso 2: Configurar Variables de Entorno**

En Railway → **Variables**:

```bash
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=512
NEXT_TELEMETRY_DISABLED=1
```

### **Paso 3: Deploy**

```bash
git add .
git commit -m "feat: configure standalone mode for Railway"
git push origin main
```

### **Paso 4: Verificar**

Después del deploy:
1. Ve a **Metrics** en Railway
2. Verifica que **Memory Usage** esté entre 400-600 MB
3. Si está más alto, revisa que el Start Command sea correcto

---

## 📋 Instrucciones para Opción 2 (Modo Normal)

Si prefieres mantener la simplicidad y no usar standalone:

### **Paso 1: Desactivar Standalone**

Edita `next.config.mjs`:

```javascript
const nextConfig = {
  // output: 'standalone',  // ← Comenta o elimina esta línea
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // ... resto igual
};
```

### **Paso 2: Railway lo Reconoce Automáticamente**

Railway ejecutará `npm start` por defecto. No necesitas cambiar nada.

### **Paso 3: Variables de Entorno**

En Railway → **Variables**:

```bash
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=1024
NEXT_TELEMETRY_DISABLED=1
```

Nota: Aumentamos `max-old-space-size` a 1024 MB porque el bundle es más grande.

### **Paso 4: Deploy**

```bash
git add .
git commit -m "feat: configure normal mode for Railway"
git push origin main
```

---

## 🆚 Comparación

| Aspecto | Standalone (Opción 1) | Normal (Opción 2) |
|---------|----------------------|-------------------|
| **Bundle size** | 44 MB | ~800 MB |
| **RAM en Railway** | 400-600 MB | 800 MB - 1 GB |
| **Configuración** | Requiere setup | Automático |
| **Start Command** | `npm run start:standalone` | `npm start` (default) |
| **Complejidad** | Media | Baja |
| **Performance** | Óptimo | Bueno |
| **Costo Railway** | Menor plan | Plan medio |

---

## 🤔 ¿Cuál Elegir?

### Elige **Opción 1 (Standalone)** si:
- ✅ Quieres máximo ahorro de RAM y costos
- ✅ Estás cómodo configurando Railway
- ✅ Tienes plan gratuito o básico de Railway

### Elige **Opción 2 (Normal)** si:
- ✅ Prefieres simplicidad sobre optimización
- ✅ Railway tiene suficiente RAM disponible
- ✅ No quieres configurar scripts adicionales

---

## 🐛 Troubleshooting

### Problema: "Cannot find module 'server.js'"

**Solución:** Verifica que el Start Command sea:
```bash
npm run start:standalone
```

NO uses:
```bash
node .next/standalone/server.js  # ❌ Falta copiar archivos
```

### Problema: "Imágenes o CSS no cargan"

**Causa:** Los archivos estáticos no se copiaron.

**Solución:**
1. Verifica que `start-standalone.sh` se ejecute correctamente
2. En los logs de Railway, busca:
   ```
   📁 Copiando .next/static...
   📁 Copiando public...
   ```

### Problema: RAM sigue alta (>800 MB)

**Causa:** Railway está usando `npm start` en vez de standalone.

**Solución:**
1. Ve a Railway Settings → Deploy
2. Cambia Start Command a: `npm run start:standalone`
3. Redeploy

---

## 📊 Monitoreo Post-Deploy

### Métricas Esperadas (Standalone)

```
Memory Usage:
├─ Inicio: 150-250 MB
├─ Con 10 usuarios: 300-400 MB
├─ Con 50 usuarios: 450-550 MB
└─ Máximo: 600 MB
```

### Comandos de Verificación

```bash
# Ver logs en vivo
railway logs

# Ver uso de memoria
railway status

# Conectar por SSH (si disponible)
railway shell
```

---

## ✅ Checklist Final

Antes de hacer deploy, verifica:

- [ ] `next.config.mjs` tiene `output: 'standalone'` (si usas Opción 1)
- [ ] `package.json` tiene script `start:standalone`
- [ ] Archivo `start-standalone.sh` existe y es ejecutable
- [ ] Variables de entorno configuradas en Railway
- [ ] Start Command configurado correctamente
- [ ] Build local funciona: `npm run build`

---

## 📞 Necesitas Ayuda?

Si tienes problemas:

1. **Revisa logs de Railway**: `railway logs`
2. **Verifica Start Command**: Settings → Deploy
3. **Prueba local**: `npm run build && npm run start:standalone`

---

**Recomendación Final:** Usa **Opción 1 (Standalone)** para máximo ahorro de RAM. La configuración es simple y los beneficios valen la pena.

---

**Fecha**: 2025-10-20
**Next.js**: 15.2.4
**Deploy Target**: Railway
