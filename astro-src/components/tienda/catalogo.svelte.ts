import type { ArticuloTienda, CatalogoWebResponse } from "@/types/tienda";

/** Tope que acepta `/api/productos/catalogo-web` (Query(..., le=200)). */
const CATALOGO_PAGE_SIZE = 200;
/** Cortafuegos: 2000 artículos. Si se alcanza, toca paginar en la UI. */
const MAX_CATALOGO_PAGES = 10;

/**
 * Catálogo web completo de una provincia (o el nacional si es null).
 *
 * Se trae entero y se filtra en el navegador: son decenas de artículos, y así
 * tocar una zona de la casa responde al instante sin otra vuelta al backend.
 * Úsalo en el script de un componente; se vuelve a pedir si cambia la provincia.
 */
export function useCatalogoWeb(provincia: () => string | null) {
  let productos = $state.raw<ArticuloTienda[]>([]);
  let cargando = $state(true);
  let error = $state<string | null>(null);
  let intento = $state(0);

  $effect(() => {
    const codigo = provincia();
    void intento;
    const controlador = new AbortController();
    const base = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/productos/catalogo-web`;

    const pedirPagina = async (page: number): Promise<CatalogoWebResponse> => {
      const params = new URLSearchParams();
      // Sin `provincia` el backend devuelve el catálogo nacional; con ella,
      // sólo lo que esa provincia vende y a su precio.
      if (codigo) params.set("provincia", codigo);
      params.set("page", String(page));
      params.set("limit", String(CATALOGO_PAGE_SIZE));
      const respuesta = await fetch(`${base}?${params}`, { signal: controlador.signal });
      if (!respuesta.ok) throw new Error("Error al cargar los productos");
      const datos: CatalogoWebResponse = await respuesta.json();
      if (!datos.success || !Array.isArray(datos.data)) {
        throw new Error(datos.message || "Error al procesar los productos");
      }
      return datos;
    };

    cargando = true;
    error = null;
    (async () => {
      try {
        // El backend topa `limit` en 200: se pide la primera página y el resto
        // según `meta.totalPages`, o el catálogo se cortaría en silencio.
        const primera = await pedirPagina(1);
        const totalPaginas = Math.min(primera.meta?.totalPages ?? 1, MAX_CATALOGO_PAGES);
        let articulos = primera.data;
        if (totalPaginas > 1) {
          const resto = await Promise.all(
            Array.from({ length: totalPaginas - 1 }, (_, i) => pedirPagina(i + 2)),
          );
          articulos = articulos.concat(...resto.map((r) => r.data));
        }
        productos = articulos;
        cargando = false;
      } catch (e) {
        // Abortada: ya hay otra petición en curso, que ella cierre el estado.
        if (e instanceof DOMException && e.name === "AbortError") return;
        console.error("Error cargando el catálogo:", e);
        error = e instanceof Error ? e.message : "Error desconocido";
        cargando = false;
      }
    })();

    return () => controlador.abort();
  });

  return {
    get productos() {
      return productos;
    },
    get cargando() {
      return cargando;
    },
    get error() {
      return error;
    },
    reintentar() {
      intento++;
    },
  };
}
