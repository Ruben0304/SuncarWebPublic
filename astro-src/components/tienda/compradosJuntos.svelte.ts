import { carrito } from "~/lib/cart.svelte";
import { compradosJuntos } from "@/components/tienda/comprados-juntos";
import type { ArticuloTienda, CatalogoWebResponse } from "@/types/tienda";
import type { OfertaSimplificada } from "@/types/ofertas";

const MAXIMO = 4;

/** Lo ya consultado: abrir otra vez el mismo producto no repite la petición. */
const consultados = new Map<string, ArticuloTienda[]>();

type Respuesta = { clave: string; productos: ArticuloTienda[] | null };

/**
 * Pide al backend lo que se compra junto con un producto. null si falla o no
 * hay datos. Solo recuerda lo que llegó bien: un fallo se reintenta la próxima
 * vez. Si la petición se aborta lanza AbortError.
 */
export async function pedirCompradosJuntos(
  id: string,
  provincia: string | null,
  signal: AbortSignal,
): Promise<ArticuloTienda[] | null> {
  const clave = `${id}|${provincia ?? ""}`;
  const guardado = consultados.get(clave);
  if (guardado) return guardado;

  let productos: ArticuloTienda[] | null = null;
  try {
    const params = new URLSearchParams({ limit: String(MAXIMO) });
    if (provincia) params.set("provincia", provincia);
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/productos/${encodeURIComponent(id)}/comprados-juntos?${params}`;
    const r = await fetch(url, { signal });
    if (r.ok) {
      const datos: CatalogoWebResponse = await r.json();
      if (datos.success && Array.isArray(datos.data)) productos = datos.data;
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
  }
  if (productos) consultados.set(clave, productos);
  return productos;
}

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
    const controlador = new AbortController();
    pedirCompradosJuntos(miId, provincia(), controlador.signal).then(
      (productos) => {
        respuesta = { clave: miClave, productos };
      },
      () => {
        // Abortada: el producto o la provincia cambiaron y hay otra petición en curso.
      },
    );

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

const MAXIMO_CARRITO = 8;

/**
 * «Comprados juntos» del carrito: la misma lógica de la ficha (backend y, si
 * no hay datos, kits publicados) aplicada a cada producto del carrito. Se
 * mezclan los resultados turnándose entre productos, sin repetir y sin lo que
 * ya está en el carrito. Úsalo en el script de un componente.
 */
export function useCompradosJuntosCarrito(
  abierto: () => boolean,
  provincia: () => string | null,
  catalogo: () => ArticuloTienda[],
  kits: () => OfertaSimplificada[],
) {
  const ids = $derived(
    Array.from(new Set(carrito.items.map((i) => String(i.producto.id)).filter(Boolean))),
  );
  const clave = $derived(`${ids.join(",")}|${provincia() ?? ""}`);
  let respuesta = $state.raw<{ clave: string; porProducto: Map<string, ArticuloTienda[] | null> } | null>(null);
  let cargando = $state(false);

  $effect(() => {
    if (!abierto() || ids.length === 0) {
      cargando = false;
      return;
    }
    const miClave = clave;
    const misIds = ids;
    const miProvincia = provincia();
    const controlador = new AbortController();
    cargando = true;
    Promise.all(
      misIds.map(async (id) => [id, await pedirCompradosJuntos(id, miProvincia, controlador.signal)] as const),
    ).then(
      (pares) => {
        respuesta = { clave: miClave, porProducto: new Map(pares) };
        cargando = false;
      },
      () => {
        // Abortada: el carrito cambió y hay otra petición en curso.
      },
    );
    return () => controlador.abort();
  });

  const lista = $derived.by((): ArticuloTienda[] => {
    if (ids.length === 0 || respuesta?.clave !== clave) return [];
    const enCarrito = new Set(ids);
    const cat = catalogo();
    const losKits = kits();
    const columnas = carrito.items.map((i) => {
      const delBackend = respuesta!.porProducto.get(String(i.producto.id));
      return delBackend?.length ? delBackend : compradosJuntos(i.producto, cat, losKits);
    });
    const salida: ArticuloTienda[] = [];
    const vistos = new Set<string>();
    for (let fila = 0; salida.length < MAXIMO_CARRITO; fila++) {
      let hayMas = false;
      for (const col of columnas) {
        const p = col[fila];
        if (!p) continue;
        hayMas = true;
        const pid = String(p.id);
        if (enCarrito.has(pid) || vistos.has(pid) || salida.length >= MAXIMO_CARRITO) continue;
        vistos.add(pid);
        salida.push(p);
      }
      if (!hayMas) break;
    }
    return salida;
  });

  return {
    get lista() {
      return lista;
    },
    get cargando() {
      return cargando;
    },
  };
}
