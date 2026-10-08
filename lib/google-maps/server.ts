import "server-only";

// Clave de Maps JavaScript API. Vive en el servidor y se entrega al navegador
// desde el layout (app/layout.tsx) en vez de una variable de entorno. La clave
// está restringida por referente a https://suncarsrl.com en Google Cloud, así
// que no sirve fuera de ese sitio aunque se vea en el HTML.
export const GOOGLE_MAPS_API_KEY = "AIzaSyCss3aiJF6G0uSKqq4el_6A7OQiNDMPgWs";
