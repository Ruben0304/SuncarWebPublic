import { defineMiddleware } from "astro:middleware";

// Cachés en memoria del servidor de producción (en dev no se usa: estorbaría).
//
// 1) HTML: sustituye al `revalidate` de Next. Las páginas con datos del
//    backend (kits, precios, contacto) se renderizan como máximo una vez por
//    minuto por URL; el resto de las visitas reciben el HTML ya hecho.
// 2) /_image: Astro recodifica con sharp en cada petición (no guarda en
//    disco); sin esto, cada visita a la home repite el trabajo para cada
//    foto. Se guarda hasta un tope de memoria.

const TTL_HTML_MS = 60_000;
const MAX_HTML = 200;
const MAX_IMG_BYTES = 96 * 1024 * 1024;

interface Entrada {
  cuerpo: ArrayBuffer | string;
  status: number;
  headers: [string, string][];
  vence: number;
  bytes: number;
}

const htmlCache = new Map<string, Entrada>();
const imgCache = new Map<string, Entrada>();
let imgBytes = 0;

const respuesta = (e: Entrada, extra?: Record<string, string>) =>
  new Response(e.cuerpo, { status: e.status, headers: { ...Object.fromEntries(e.headers), ...extra } });

export const onRequest = defineMiddleware(async (ctx, next) => {
  if (import.meta.env.DEV || ctx.request.method !== "GET") return next();

  const url = new URL(ctx.request.url);
  const clave = url.pathname + url.search;

  if (url.pathname === "/_image") {
    const hit = imgCache.get(clave);
    if (hit) return respuesta(hit, { "X-Cache": "HIT" });
    const res = await next();
    if (res.status !== 200 || !(res.headers.get("content-type") ?? "").startsWith("image/")) return res;
    const cuerpo = await res.arrayBuffer();
    const entrada: Entrada = {
      cuerpo,
      status: 200,
      headers: [...res.headers.entries()],
      vence: Infinity,
      bytes: cuerpo.byteLength,
    };
    imgCache.set(clave, entrada);
    imgBytes += entrada.bytes;
    for (const [k, v] of imgCache) {
      if (imgBytes <= MAX_IMG_BYTES) break;
      imgBytes -= v.bytes;
      imgCache.delete(k);
    }
    return respuesta(entrada, { "X-Cache": "MISS" });
  }

  if (url.pathname.startsWith("/api/")) return next();

  const hit = htmlCache.get(clave);
  if (hit && hit.vence > Date.now()) {
    return respuesta(hit, { "X-Cache": "HIT" });
  }

  const res = await next();
  if (res.status !== 200 || !(res.headers.get("content-type") ?? "").includes("text/html")) return res;

  const cuerpo = await res.text();
  const headers = [...res.headers.entries()].filter(([k]) => k.toLowerCase() !== "content-length");
  headers.push(["Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300"]);
  const entrada: Entrada = { cuerpo, status: 200, headers, vence: Date.now() + TTL_HTML_MS, bytes: cuerpo.length };
  htmlCache.delete(clave);
  htmlCache.set(clave, entrada);
  if (htmlCache.size > MAX_HTML) htmlCache.delete(htmlCache.keys().next().value as string);
  return respuesta(entrada, { "X-Cache": "MISS" });
});
