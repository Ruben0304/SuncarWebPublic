"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useGoogleMaps } from "./GoogleMapsProvider";

interface Props {
  /**
   * Opciones iniciales, aplicadas al crear el mapa. Como función se evalúa
   * entonces, cuando `google.maps` ya existe (para enums como ControlPosition).
   */
  options: google.maps.MapOptions | (() => google.maps.MapOptions);
  /** Se llama con el mapa ya creado, y con null al desmontarse. */
  onMap: (map: google.maps.Map | null) => void;
  /** Librerías extra que el mapa necesita antes de usarse (p. ej. "marker"). */
  librerias?: string[];
  className?: string;
  style?: CSSProperties;
}

/** El contenedor del mapa. El resto de capas las agrega cada componente. */
export default function GoogleMapView({
  options,
  onMap,
  librerias = [],
  className,
  style,
}: Props) {
  const { estado, fallaClave } = useGoogleMaps();
  const contenedor = useRef<HTMLDivElement>(null);
  const opcionesIniciales = useRef(options);
  const alMapa = useRef(onMap);
  alMapa.current = onMap;

  useEffect(() => {
    if (estado !== "listo" || !contenedor.current) return;
    let cancelado = false;
    let mapa: google.maps.Map | null = null;

    (async () => {
      const { Map } = (await google.maps.importLibrary(
        "maps",
      )) as google.maps.MapsLibrary;
      await Promise.all(librerias.map((l) => google.maps.importLibrary(l)));
      if (cancelado || !contenedor.current) return;
      const opciones = opcionesIniciales.current;
      mapa = new Map(
        contenedor.current,
        typeof opciones === "function" ? opciones() : opciones,
      );
      alMapa.current(mapa);
    })().catch((error) => console.error("[GoogleMapView]", error));

    return () => {
      cancelado = true;
      if (mapa) google.maps.event.clearInstanceListeners(mapa);
      alMapa.current(null);
    };
    // las librerías son fijas por componente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  return (
    <div className="relative">
      <div ref={contenedor} className={className} style={style} />
      {(estado === "error" || fallaClave) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 px-4 text-center text-sm text-white">
          No pudimos cargar el mapa. Intenta recargar la página.
        </div>
      )}
    </div>
  );
}
