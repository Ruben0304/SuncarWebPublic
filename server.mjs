// Servidor de producción (reemplaza a `next start`). Astro en modo
// "middleware" + Express, porque el servidor "standalone" de Astro no
// comprime respuestas ni los archivos estáticos (JS/CSS/HTML): en Cuba, el
// brotli/gzip es de lo que más pesa en los KB que baja cada visita.
//
// Uso:  npm run build:astro && npm run start:astro
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import compression from "compression";
import { handler as ssrHandler } from "./dist/server/entry.mjs";

const app = express();
app.disable("x-powered-by");
// Detrás del proxy de Railway/Cloudflare: así req.protocol/ip reflejan al visitante.
app.set("trust proxy", true);

// Para el health check de Railway: no toca el backend ni renderiza nada.
app.get("/healthz", (_req, res) => res.type("text/plain").set("Cache-Control", "no-store").send("ok"));

// Mismas cabeceras de seguridad que next.config.mjs ponía en todas las rutas.
// Van aquí y no en el middleware de Astro porque las páginas prerenderizadas y
// los estáticos los sirve Express, y no pasan por ese middleware.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://*.googleapis.com https://*.gstatic.com https://*.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https: http:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' blob: https://*.suncarsrl.com https://*.supabase.co https://www.google-analytics.com https://cdn.jsdelivr.net https://unpkg.com https://www.gstatic.com https://lottie.host https://*.googleapis.com https://*.google.com https://*.gstatic.com wss:",
  "worker-src 'self' blob:",
  "media-src 'self' blob: https://*.suncarsrl.com https://*.supabase.co",
  "frame-src 'self' https://www.google.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const SEGURIDAD = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  "X-DNS-Prefetch-Control": "on",
  "Content-Security-Policy": CSP,
};
app.use((_req, res, next) => {
  for (const [nombre, valor] of Object.entries(SEGURIDAD)) res.setHeader(nombre, valor);
  next();
});

// brotli si el navegador lo acepta, gzip si no; lo ya comprimido (webp, woff2,
// glb…) lo deja pasar solo, por su content-type.
app.use(compression({ threshold: 1024, brotli: { enabled: true, zlib: {} } }));

const cliente = fileURLToPath(new URL("./dist/client/", import.meta.url));
app.use(
  express.static(cliente, {
    index: false,
    redirect: false,
    setHeaders(res, ruta) {
      // /_astro/* lleva el hash en el nombre: nunca cambia.
      if (ruta.includes("/_astro/")) res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      else res.setHeader("Cache-Control", "public, max-age=86400");
    },
  }),
);

// En modo "middleware" el adaptador no sirve las páginas prerenderizadas
// (/, /servicios, /contacto…): están en dist/client/<ruta>/index.html.
const prerenderizadas = new Map();
(function buscar(dir, ruta) {
  for (const nombre of readdirSync(dir)) {
    const completa = join(dir, nombre);
    if (statSync(completa).isDirectory()) buscar(completa, `${ruta}/${nombre}`);
    else if (nombre === "index.html") prerenderizadas.set(ruta || "/", completa);
  }
})(cliente, "");

app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  const ruta = req.path.length > 1 ? req.path.replace(/\/+$/, "") : "/";
  const archivo = prerenderizadas.get(ruta);
  if (!archivo) return next();
  res.set("Cache-Control", "public, max-age=300");
  res.sendFile(archivo);
});

app.use(ssrHandler);

const puerto = Number(process.env.PORT || 4321);
const host = process.env.HOST || "0.0.0.0";
const servidor = app.listen(puerto, host, () => console.log(`SunCar web (Astro) en http://${host}:${puerto}`));

// Los proxies de Railway/Cloudflare cierran conexiones ociosas a los ~60 s: el
// servidor debe aguantar más que ellos o se ven 502 intermitentes.
servidor.keepAliveTimeout = 65_000;
servidor.headersTimeout = 66_000;

// Un deploy nuevo manda SIGTERM: se deja de aceptar visitas, se terminan las
// que están en curso y se sale (con tope, para no quedar colgado).
for (const senal of ["SIGTERM", "SIGINT"]) {
  process.on(senal, () => {
    console.log(`${senal} recibido, cerrando…`);
    servidor.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  });
}
process.on("unhandledRejection", (motivo) => console.error("unhandledRejection:", motivo));
