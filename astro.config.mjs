// @ts-check
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";

// Migración incremental desde Next.js (ver migracion-astro). Mientras convive
// con `app/`, Astro solo sirve lo que ya se portó a `src/pages`.
export default defineConfig({
  site: "https://suncarsrl.com",
  // "astro-src" y no "src": Next.js trata cualquier src/pages como su propio
  // Pages Router y se niega a arrancar si también existe app/.
  srcDir: "./astro-src",
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [
    react(),
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
      "process.env.NEXT_PUBLIC_BACKEND_URL": JSON.stringify(
        process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.suncarsrl.com",
      ),
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL(".", import.meta.url)),
      },
    },
  },
});
