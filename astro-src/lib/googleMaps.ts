import { GOOGLE_MAPS_API_KEY } from "~/server/google-maps-key";

// Mismo cargador que components/maps/GoogleMapsProvider.tsx, sin React:
// el script de Google Maps se baja una sola vez y solo cuando un mapa lo pide.
let promesaScript: Promise<void> | null = null;
export let fallaAutenticacion = false;

export function cargarGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return new Promise(() => {});
  if (typeof window.google?.maps?.importLibrary === "function") return Promise.resolve();
  if (promesaScript) return promesaScript;

  (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => {
    fallaAutenticacion = true;
  };

  promesaScript = new Promise<void>((resolve, reject) => {
    const nombre = "__suncarGoogleMapsListo";
    (window as unknown as Record<string, () => void>)[nombre] = () => resolve();
    const script = document.createElement("script");
    script.src =
      "https://maps.googleapis.com/maps/api/js" +
      `?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&v=weekly&loading=async&language=es&region=CU&callback=${nombre}`;
    script.async = true;
    script.onerror = () => {
      promesaScript = null;
      reject(new Error("No se pudo cargar Google Maps"));
    };
    document.head.appendChild(script);
  });
  return promesaScript;
}
