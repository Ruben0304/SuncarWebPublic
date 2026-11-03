import { carrito } from "~/lib/cart.svelte";
import type { ArticuloTienda } from "@/types/tienda";

interface RecomendadorCarritoResponse {
  success: boolean;
  message: string;
  data: {
    oferta_id: string | null;
    precio_oferta: number | null;
    productos: ArticuloTienda[];
    productos_no_vendibles_extra: ArticuloTienda[];
    coincidencias_carrito: number;
  };
}

const MAX_PRODUCTOS_RECOMENDADOS = 5;
export type ProductoRecomendado = ArticuloTienda & { vendible: boolean };

/**
 * «Comprados juntos» y «Oferta de instalación» del drawer del carrito: el
 * backend recomienda según lo que hay en el carrito. Solo pregunta con el
 * drawer abierto y el carrito con algo. Úsalo en el script de un componente.
 */
export function useRecomendadorCarrito(abierto: () => boolean) {
  let recomendados = $state.raw<ProductoRecomendado[]>([]);
  let ofertaId = $state<string | null>(null);
  let precioOferta = $state<number | null>(null);
  let cargando = $state(false);

  // La petición solo depende de qué productos hay, no de cuántas unidades.
  const clave = $derived(
    Array.from(new Set(carrito.items.map((item) => item.producto.id).filter(Boolean))).join(","),
  );

  $effect(() => {
    if (!abierto() || clave === "") {
      recomendados = [];
      ofertaId = null;
      precioOferta = null;
      return;
    }

    const controller = new AbortController();
    (async () => {
      cargando = true;
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ofertas/confeccion/recomendador-carrito`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productos: clave.split(",").map((id) => ({ id })),
              max_productos: MAX_PRODUCTOS_RECOMENDADOS,
            }),
            signal: controller.signal,
          },
        );

        if (!response.ok) throw new Error("No se pudieron obtener recomendaciones del carrito");

        const payload = (await response.json()) as RecomendadorCarritoResponse;
        const data = payload?.data;
        const productos = Array.isArray(data?.productos) ? data.productos : [];
        const noVendiblesExtra = Array.isArray(data?.productos_no_vendibles_extra)
          ? data.productos_no_vendibles_extra
          : [];
        const noVendiblesIds = new Set(noVendiblesExtra.map((p) => p.id));

        const conEstado: ProductoRecomendado[] = productos.map((p) => ({
          ...p,
          vendible: !noVendiblesIds.has(p.id),
        }));
        noVendiblesExtra.forEach((p) => {
          if (!conEstado.some((item) => item.id === p.id)) conEstado.push({ ...p, vendible: false });
        });

        recomendados = conEstado;
        ofertaId = data?.oferta_id ?? null;
        precioOferta = typeof data?.precio_oferta === "number" ? data.precio_oferta : null;
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          recomendados = [];
          ofertaId = null;
          precioOferta = null;
        }
      } finally {
        // Si la abortaron, la petición que la reemplaza se encarga del estado.
        if (!controller.signal.aborted) cargando = false;
      }
    })();

    return () => controller.abort();
  });

  return {
    get recomendados() {
      return recomendados;
    },
    get ofertaId() {
      return ofertaId;
    },
    get precioOferta() {
      return precioOferta;
    },
    get cargando() {
      return cargando;
    },
  };
}
