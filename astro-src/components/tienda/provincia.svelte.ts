// Provincia que el visitante está viendo y provincias con oferta. Reemplaza a
// hooks/useProvinciaTienda (zustand persist): misma clave de localStorage y
// mismo JSON, {"state":{"provincia":"03"},"version":0}.
import type { ProvinciaOferta, ProvinciasOfertaResponse } from "@/types/tienda";

/** La Habana: donde opera la sede y la única provincia con oferta al arrancar. */
export const PROVINCIA_POR_DEFECTO = "03";

const CLAVE = "suncar-provincia-tienda";

let provincia = $state(PROVINCIA_POR_DEFECTO);

/** Carga la provincia guardada. Llamar una vez desde onMount de la isla. */
export function hidratarProvincia() {
  try {
    const guardada = JSON.parse(localStorage.getItem(CLAVE) ?? "null")?.state?.provincia;
    if (typeof guardada === "string" && guardada) provincia = guardada;
  } catch {
    // Valor corrupto o sin almacenamiento: se queda la de por defecto.
  }
}

export const provinciaTienda = {
  get provincia() {
    return provincia;
  },
  set(codigo: string) {
    provincia = codigo;
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ state: { provincia: codigo }, version: 0 }));
    } catch {
      // Sin almacenamiento: vale solo para esta visita.
    }
  },
};

/** Provincias que hoy tienen algo a la venta, para poblar el selector. Úsalo en el script de un componente. */
export function useProvinciasConOferta() {
  let provincias = $state<ProvinciaOferta[]>([]);
  let cargando = $state(true);

  $effect(() => {
    const controlador = new AbortController();
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/disponibilidad-web/provincias`, {
      signal: controlador.signal,
    })
      .then((r) => r.json())
      .then((datos: ProvinciasOfertaResponse) => {
        if (datos?.success && Array.isArray(datos.data)) provincias = datos.data;
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        console.error("Error cargando provincias con oferta:", e);
      })
      .finally(() => {
        if (!controlador.signal.aborted) cargando = false;
      });
    return () => controlador.abort();
  });

  return {
    get provincias() {
      return provincias;
    },
    get cargando() {
      return cargando;
    },
  };
}
