# 🔧 Fix Error 502 Bad Gateway en Railway

## 🚨 Problema

```
Bad Gateway - Error 502
El servidor se inicia: ✓ Ready in 143ms
Pero Railway no puede conectarse
```

## 🎯 Causa

Next.js standalone estaba escuchando en `localhost` en lugar de `0.0.0.0`, o en un puerto incorrecto.

Railway necesita:
- **Hostname**: `0.0.0.0` (para aceptar conexiones externas)
- **Puerto**: Variable `$PORT` que Railway asigna dinámicamente

## ✅ Solución Aplicada

### 1. Script Actualizado

El `start-standalone.sh` ahora configura:

```bash
export HOSTNAME="0.0.0.0"    # Escucha en todas las interfaces
export PORT="${PORT:-3000}"  # Usa el puerto de Railway
```

### 2. Variables de Entorno en Railway

**IMPORTANTE**: Ve a tu proyecto en Railway → **Variables** y verifica/agrega:

```bash
# Variables requeridas
HOSTNAME=0.0.0.0
PORT=3000

# Variables de optimización (ya deberías tenerlas)
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=512
NEXT_TELEMETRY_DISABLED=1

# Tu backend URL
NEXT_PUBLIC_BACKEND_URL=https://api.suncarsrl.com
NEXT_PUBLIC_GAME_URL=https://game.suncarsrl.com
NEXT_PUBLIC_GAME_APK_URL=https://suncarsrl.com/downloads/solar-survivor.apk
NEXT_PUBLIC_FIXER_API_KEY=b9e585298529a40d621c7070d8b56d31
NEXT_PUBLIC_BASE_S3_URL=https://s3.suncarsrl.com/
```

### 3. Verificar Configuración de Railway

**Settings → Networking**:
- ✅ Public Networking: **Enabled**
- ✅ Port: Debería detectar automáticamente (o configurar 3000)

**Settings → Deploy**:
- ✅ Start Command: `npm run start:standalone`

## 🧪 Cómo Verificar que Está Funcionando

Después de hacer el deploy, en los logs deberías ver:

```bash
✅ Archivos copiados
🌐 Iniciando servidor standalone...
🔧 Configuración:
   - Hostname: 0.0.0.0      ← ⭐ IMPORTANTE
   - Port: 3000              ← ⭐ O el que Railway asigne

 ▲ Next.js 15.2.4
   - Local:        http://0.0.0.0:3000    ← Nota el 0.0.0.0
   - Network:      http://0.0.0.0:3000
 ✓ Ready in 143ms
```

Si ves `localhost` en lugar de `0.0.0.0`, el problema persiste.

## 🐛 Troubleshooting Adicional

### Problema: Sigue saliendo 502

**Solución 1**: Verifica que la variable PORT no esté hardcodeada

En Railway → Variables, asegúrate de que:
- ❌ NO tengas `PORT=8080` fijo
- ✅ Railway asigna PORT automáticamente

**Solución 2**: Prueba sin standalone (temporal)

1. Comenta `output: 'standalone'` en `next.config.mjs`
2. Cambia Start Command a: `npm start`
3. Redeploy

Si funciona así, el problema es la configuración standalone.

### Problema: "Cannot find module"

**Solución**: Asegúrate de que el build se completó correctamente

```bash
# En Railway logs, busca:
✓ Generating static pages
✓ Finalizing page optimization
```

### Problema: 502 solo en algunas rutas

**Causa**: Archivos estáticos no se copiaron correctamente

**Solución**: Verifica en logs que veas:
```bash
📁 Copiando .next/static...
📁 Copiando public...
```

## 🔄 Deploy con la Solución

```bash
# 1. Commit los cambios
git add start-standalone.sh
git commit -m "fix: configure hostname and port for Railway standalone mode"
git push origin main

# 2. Railway detectará el push y hará redeploy automáticamente

# 3. Monitorea los logs:
railway logs --follow
```

## 📊 Después del Deploy

Deberías ver:

1. **Logs limpios** sin errores de conexión
2. **Respuesta 200** al visitar suncarsrl.com
3. **RAM estable** entre 400-600 MB
4. **Cold start** de 2-3 segundos

## ⚡ Alternativa Rápida (Si sigue fallando)

Si el standalone sigue dando problemas, puedes usar el modo normal temporalmente:

### En `next.config.mjs`:
```javascript
// output: 'standalone',  // ← Comenta esta línea
```

### En Railway → Start Command:
```bash
npm start
```

Esto funcionará inmediatamente, pero usará más RAM (~800 MB en vez de 400-600 MB).

---

**Resumen**: El error 502 se debe a que Next.js necesita escuchar en `0.0.0.0` (no `localhost`) para que Railway pueda conectarse. El script ya está actualizado para hacer esto automáticamente.
