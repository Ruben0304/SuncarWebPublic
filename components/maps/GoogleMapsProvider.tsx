"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Carga el script de Google Maps una sola vez y solo cuando un mapa lo pide:
// las páginas sin mapa no descargan nada.

export type EstadoGoogleMaps = "inactivo" | "cargando" | "listo" | "error";

interface Contexto {
  apiKey: string;
}

const GoogleMapsContext = createContext<Contexto | null>(null);

let promesaScript: Promise<void> | null = null;
let fallaAutenticacion = false;

function cargarScript(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return new Promise(() => {});
  if (typeof window.google?.maps?.importLibrary === "function") return Promise.resolve();
  if (promesaScript) return promesaScript;

  // Google llama a esta función global si la clave se rechaza (restricción de
  // referente, API no habilitada, facturación…).
  (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => {
    fallaAutenticacion = true;
  };

  promesaScript = new Promise<void>((resolve, reject) => {
    // `callback` avisa cuando la API está lista (importLibrary ya existe);
    // el onload del script llega un poco antes.
    const nombre = "__suncarGoogleMapsListo";
    (window as unknown as Record<string, () => void>)[nombre] = () => resolve();
    const script = document.createElement("script");
    script.src =
      "https://maps.googleapis.com/maps/api/js" +
      `?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async&language=es&region=CU&callback=${nombre}`;
    script.async = true;
    script.onerror = () => {
      promesaScript = null;
      reject(new Error("No se pudo cargar Google Maps"));
    };
    document.head.appendChild(script);
  });
  return promesaScript;
}

export function GoogleMapsProvider({
  apiKey,
  children,
}: {
  apiKey: string;
  children: ReactNode;
}) {
  return (
    <GoogleMapsContext.Provider value={{ apiKey }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

/** Pide Google Maps y dice cuándo se puede usar `google.maps`. */
export function useGoogleMaps(): {
  estado: EstadoGoogleMaps;
  fallaClave: boolean;
} {
  const contexto = useContext(GoogleMapsContext);
  const [estado, setEstado] = useState<EstadoGoogleMaps>("inactivo");
  const [fallaClave, setFallaClave] = useState(false);

  useEffect(() => {
    if (!contexto) {
      setEstado("error");
      return;
    }
    let cancelado = false;
    setEstado("cargando");
    cargarScript(contexto.apiKey)
      .then(() => {
        if (cancelado) return;
        setEstado("listo");
        // gm_authFailure llega poco después de cargar el script.
        window.setTimeout(() => {
          if (!cancelado && fallaAutenticacion) setFallaClave(true);
        }, 1500);
      })
      .catch(() => {
        if (!cancelado) setEstado("error");
      });
    return () => {
      cancelado = true;
    };
  }, [contexto]);

  return { estado, fallaClave };
}
