// Pruebas de humo del sitio ya desplegado (o corriendo en local).
//
//   node scripts/smoke.mjs                      # http://localhost:4321
//   node scripts/smoke.mjs https://mi-app.up.railway.app
//
// Comprueba lo que, si falla, rompe el sitio sin que nadie lo note: rutas,
// títulos/SEO, cabeceras de seguridad, compresión, caché de estáticos,
// optimizador de imágenes y las rutas /api. Sale con código 1 si algo falla.

const base = (process.argv[2] || process.env.BASE_URL || "http://localhost:4321").replace(/\/+$/, "");
let ok = 0;
const fallos = [];

function prueba(nombre, condicion, detalle = "") {
  if (condicion) {
    ok++;
    console.log(`  ✓ ${nombre}`);
  } else {
    fallos.push(`${nombre}${detalle ? ` — ${detalle}` : ""}`);
    console.log(`  ✗ ${nombre}${detalle ? ` — ${detalle}` : ""}`);
  }
}

const pedir = (ruta, init = {}) => fetch(base + ruta, { redirect: "manual", ...init });

console.log(`\nProbando ${base}\n`);

console.log("Páginas");
const paginas = [
  "/", "/ofertas", "/productos", "/servicios", "/sobre-nosotros", "/testimonios", "/galeria",
  "/contacto", "/cotizacion", "/calculadora", "/blog", "/solar-survivor", "/webinfo",
  "/terminos-condiciones", "/privacidad", "/privacidad/suncar-hogar", "/privacidad/solar-survivor", "/tienda",
];
for (const ruta of paginas) {
  const r = await pedir(ruta);
  const html = r.status === 200 ? await r.text() : "";
  prueba(`${ruta} responde 200 con <title>`, r.status === 200 && /<title>[^<]+<\/title>/.test(html), `HTTP ${r.status}`);
  if (ruta !== "/webinfo") prueba(`${ruta} tiene canonical`, /<link rel="canonical"/.test(html));
  // Los hijos que un .astro le pasa a una isla de React llegan como HTML
  // estático (<astro-slot>) y NUNCA se hidratan: menús, formularios y botones
  // quedan muertos. Si aparece uno, la página se ve bien pero no funciona.
  prueba(`${ruta} sin hijos estáticos en islas (<astro-slot>)`, !html.includes("<astro-slot"));
  // El renderer de Svelte se llama client.svelte.*.js; cualquier otro "client.*.js"
  // es el de React: ninguna página debe bajarlo.
  prueba(`${ruta} sin React (todas las islas son Svelte)`, !/renderer-url="[^"]*\/client\.(?!svelte)/.test(html));
}

console.log("\nSEO de la home");
{
  const html = await (await pedir("/")).text();
  prueba("JSON-LD Organization", html.includes('"@type":"Organization"'));
  prueba("meta description", /<meta name="description" content="[^"]{40,}/.test(html));
  prueba("sin runtime de React en la home", !/astro-island[^>]*component-url="[^"]*(react|ClientWrapper|AppShell)/i.test(html));
}

console.log("\nPáginas dinámicas (kits y productos)");
{
  const lista = await (await pedir("/sitemap-ofertas.xml")).text();
  const kit = lista.match(/\/ofertas\/([A-Za-z0-9-]+)</)?.[1];
  prueba("sitemap-ofertas.xml lista kits", Boolean(kit));
  if (kit) {
    const r = await pedir(`/ofertas/${kit}`);
    const html = await r.text();
    prueba(`/ofertas/${kit} 200 con JSON-LD Product`, r.status === 200 && html.includes('"@type":"Product"'));
    prueba(`/ofertas/${kit} sin React`, !/renderer-url="[^"]*\/client\.(?!svelte)/.test(html));
  }
  const prods = await (await pedir("/sitemap-productos.xml")).text();
  const prod = prods.match(/\/productos\/([^<\s]+)</)?.[1];
  prueba("sitemap-productos.xml lista productos", Boolean(prod));
  if (prod) {
    const r = await pedir(`/productos/${prod}`);
    prueba(`/productos/${decodeURIComponent(prod)} responde 200`, r.status === 200, `HTTP ${r.status}`);
  }
  prueba("ruta inexistente da 404", (await pedir("/ofertas/OF-00000000-000")).status === 404);
  prueba("/robots.txt", (await pedir("/robots.txt")).status === 200);
}

console.log("\nSeguridad y rendimiento");
{
  const r = await pedir("/", { headers: { "Accept-Encoding": "br" } });
  const h = (n) => r.headers.get(n) ?? "";
  prueba("Content-Security-Policy", h("content-security-policy").includes("default-src 'self'"));
  prueba("Strict-Transport-Security", h("strict-transport-security").includes("max-age="));
  prueba("X-Frame-Options", h("x-frame-options") === "SAMEORIGIN");
  prueba("X-Content-Type-Options", h("x-content-type-options") === "nosniff");
  prueba("no revela X-Powered-By", !h("x-powered-by"));
  prueba("HTML comprimido con brotli", h("content-encoding") === "br", h("content-encoding") || "sin compresión");

  const html = await (await pedir("/")).text();
  const js = html.match(/\/_astro\/[^"']+\.js/)?.[0];
  prueba("la home referencia JS de /_astro", Boolean(js));
  if (js) {
    const rj = await pedir(js, { headers: { "Accept-Encoding": "br" } });
    prueba("JS en brotli", rj.headers.get("content-encoding") === "br");
    prueba("JS con caché inmutable", (rj.headers.get("cache-control") ?? "").includes("immutable"));
  }
  const img = await pedir("/_image?href=%2Fimages%2Flogo-icon.webp&w=64&f=webp&q=75");
  prueba("/_image optimiza (image/webp)", img.status === 200 && (img.headers.get("content-type") ?? "").startsWith("image/"));
  prueba("/_image rechaza hosts no autorizados", (await pedir("/_image?href=https%3A%2F%2Fexample.com%2Fa.png&w=64&f=webp")).status >= 400);
  prueba("/_image rechaza rutas fuera de public", (await pedir("/_image?href=%2F..%2F..%2Fetc%2Fpasswd&w=64&f=webp")).status >= 400);
}

console.log("\nAPI");
{
  const r = await pedir("/healthz");
  prueba("/healthz", r.status === 200 && (await r.text()) === "ok");
  const c = await pedir("/api/contactos");
  const datos = c.status === 200 ? await c.json() : null;
  prueba("/api/contactos devuelve success", datos?.success === true, `HTTP ${c.status}`);
  prueba("/api/contactos no se cachea", (c.headers.get("cache-control") ?? "").includes("no-store"));
  prueba("detalle-publico rechaza ids raros (400)", (await pedir("/api/ofertas/detalle-publico/a%20b%3Bc")).status === 400);
  prueba("detalle-publico de oferta inexistente (404)", (await pedir("/api/ofertas/detalle-publico/OF-00000000-000")).status === 404);
  prueba("contactos/provincia rechaza código raro (400)", (await pedir("/api/contactos/provincia/%24%24")).status === 400);
  const m = await pedir("/api/clientes/estadisticas/kw-equipos-por-municipio-publico");
  prueba("estadísticas del mapa responde", m.status === 200, `HTTP ${m.status}`);
}

console.log(`\n${ok} pruebas bien, ${fallos.length} con fallos`);
if (fallos.length) {
  console.log("\nFallos:\n" + fallos.map((f) => ` - ${f}`).join("\n"));
  process.exit(1);
}
