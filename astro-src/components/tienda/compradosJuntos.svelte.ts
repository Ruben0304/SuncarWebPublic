import { compradosJuntos } from "@/components/tienda/comprados-juntos";
import type { ArticuloTienda, CatalogoWebResponse } from "@/types/tienda";
import type { OfertaSimplificada } from "@/types/ofertas";

const MAXIMO = 4;

/** Lo ya consultado: abrir otra vez el mismo producto no repite la petición. */
const consultados = new Map<string, ArticuloTienda[]>();

type Respuesta = { clave: string; productos: ArticuloTienda[] | null };

/**
 * "Se suele comprar junto con" de la ficha de un producto.
 *
 * Lo calcula el backend con las ventas reales (facturas, ofertas confirmadas y
 * kits), que la web no puede leer. Si la petición falla o no hay datos
 * suficientes, se recurre al cálculo local con los kits publicados.
 *
 * Mientras llega la respuesta no se devuelve nada, para que la lista no cambie
 * de un grupo de productos a otro delante del cliente. Úsalo en el script de
 * un componente.
 */
export function useCompradosJuntos(
  producto: () => ArticuloTienda | null,
  provincia: () => string | null,
  catalogo: () => ArticuloTienda[],
  kits: () => OfertaSimplificada[],
) {
  const id = $derived(producto() ? String(producto()!.id) : null);
  const clave = $derived(id ? `${id}|${provincia() ?? ""}` : null);
  let respuesta = $state.raw<Respuesta | null>(null);

  $effect(() => {
    if (!id || !clave) return;
    const miClave = clave;
    const miId = id;
    const miProvincia = provincia();
    const guardado = consultados.get(miClave);
    if (guardado) {
      respuesta = { clave: miClave, productos: guardado };
      return;
    }

    const controlador = new AbortController();
    (async () => {
      let productos: ArticuloTienda[] | null = null;
      try {
        const params = new URLSearchParams({ limit: String(MAXIMO) });
        if (miProvincia) params.set("provincia", miProvincia);
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/productos/${encodeURIComponent(miId)}/comprados-juntos?${params}`;
        const r = await fetch(url, { signal: controlador.signal });
        if (r.ok) {
          const datos: CatalogoWebResponse = await r.json();
          if (datos.success && Array.isArray(datos.data)) productos = datos.data;
        }
      } catch (e) {
        // Abortada: el producto o la provincia cambiaron y hay otra petición en curso.
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
      // Solo se recuerda lo que llegó bien: un fallo se reintenta al volver a abrirlo.
      if (productos) consultados.set(miClave, productos);
      respuesta = { clave: miClave, productos };
    })();

    return () => controlador.abort();
  });

  const delosKits = $derived.by(() => {
    const p = producto();
    return p ? compradosJuntos(p, catalogo(), kits()) : [];
  });

  return {
    get lista(): ArticuloTienda[] {
      if (!clave || respuesta?.clave !== clave) return [];
      return respuesta.productos?.length ? respuesta.productos : delosKits;
    },
  };
}
