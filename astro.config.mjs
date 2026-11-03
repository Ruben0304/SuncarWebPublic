// @ts-check
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";

// Se inlinea en el bundle del navegador al compilar. Si falta en el entorno de
// build (p. ej. un servicio nuevo en Railway sin variables), no se rompe: usa
// el backend de producción, pero lo avisa para que no pase desapercibido.
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.suncarsrl.com";
if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
  console.warn(`[astro.config] NEXT_PUBLIC_BACKEND_URL no está definida: se usa ${BACKEND_URL}`);
}

// El sitio corre en Astro + Svelte (astro-src). `app/` y el React de la raíz son
// el sitio anterior en Next, que sigue compilando con `npm run build:next`.
export default defineConfig({
  site: "https://suncarsrl.com",
  // "astro-src" y no "src": Next.js trata cualquier src/pages como su propio
  // Pages Router y se niega a arrancar si también existe app/.
  srcDir: "./astro-src",
  output: "server",
  adapter: node({ mode: "middleware" }),
  integrations: [
    svelte(),
    sitemap({
      // Las zonas de /tienda se navegan por hash (#inversor, #bateria...),
      // no son URLs propias: no deben entrar como páginas sueltas al sitemap.
      filter: (page) => !page.includes("#"),
    }),
  ],
  image: {
    // Mismo límite que next.config.mjs: nadie en Cuba necesita más de 1920px.
    domains: ["s3.suncarsrl.com"],
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
  vite: {
    // Varios hooks de cliente (useCatalogoWeb, etc.) leen
    // process.env.NEXT_PUBLIC_BACKEND_URL directamente: en Next eso se
    // inlinea en el bundle del navegador en build; Vite no define `process`
    // en el navegador, así que sin esto sería un ReferenceError ahí.
    define: {
      "process.env.NEXT_PUBLIC_BACKEND_URL": JSON.stringify(BACKEND_URL),
      "process.env.NEXT_PUBLIC_FIXER_API_KEY": JSON.stringify(process.env.NEXT_PUBLIC_FIXER_API_KEY || ""),
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL(".", import.meta.url)),
        // Raíz del código de Astro (astro-src): evita ../../../ en los imports.
        "~": fileURLToPath(new URL("./astro-src", import.meta.url)),
      },
    },
  },
});
