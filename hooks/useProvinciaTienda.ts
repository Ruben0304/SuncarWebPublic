"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProvinciaOferta, ProvinciasOfertaResponse } from "@/types/tienda";

/** La Habana: donde opera la sede y la única provincia con oferta al arrancar. */
export const PROVINCIA_POR_DEFECTO = "03";

interface ProvinciaStore {
  provincia: string;
  setProvincia: (codigo: string) => void;
}

/**
 * Provincia que el visitante está viendo.
 *
 * Se persiste para que no tenga que elegirla en cada visita; es la misma
 * decisión que ya toma el carrito, y de hecho las dos cosas tienen que
 * mantenerse coherentes (ver la guarda de provincia en useCart).
 */
export const useProvinciaTienda = create<ProvinciaStore>()(
  persist(
    (set) => ({
      provincia: PROVINCIA_POR_DEFECTO,
      setProvincia: (codigo) => set({ provincia: codigo }),
    }),
    { name: "suncar-provincia-tienda" },
  ),
);

/** Provincias que hoy tienen algo a la venta, para poblar el selector. */
export function useProvinciasConOferta() {
  const [provincias, setProvincias] = useState<ProvinciaOferta[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const controlador = new AbortController();
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/disponibilidad-web/provincias`,
      { signal: controlador.signal },
    )
      .then((r) => r.json())
      .then((datos: ProvinciasOfertaResponse) => {
        if (datos?.success && Array.isArray(datos.data)) setProvincias(datos.data);
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        console.error("Error cargando provincias con oferta:", e);
      })
      .finally(() => setCargando(false));
    return () => controlador.abort();
  }, []);

  return { provincias, cargando };
}
