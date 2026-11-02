// Copia de lib/google-maps/server.ts para el lado Astro: ese archivo usa
// `import "server-only"`, un alias virtual que solo entiende el bundler de
// Next (no existe como paquete real en node_modules) y que rompe bajo Vite.
// Mismo valor, sin esa dependencia.
export const GOOGLE_MAPS_API_KEY = "AIzaSyCss3aiJF6G0uSKqq4el_6A7OQiNDMPgWs";
