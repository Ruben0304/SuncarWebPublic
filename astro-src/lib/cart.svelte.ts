// Carrito de la tienda. Reemplaza a hooks/useCart (zustand + persist) con
// $state, pero escribe en localStorage la MISMA clave y el MISMO JSON que
// escribía zustand, así los carritos que los clientes ya tienen guardados
// siguen funcionando: {"state":{"items":[…]},"version":0}.
import type { ArticuloTienda } from "@/types/tienda";

export { abrirCarrito, alternarCarrito, carritoAbierto, cerrarCarrito } from "./carrito-ui.svelte";

const CLAVE = "suncar-cart-storage-v2";
// persist de zustand usa version 0 si no se le pasa otra.
const VERSION = 0;

export interface CartItem {
  producto: ArticuloTienda;
  cantidad: number;
}

/**
 * Resultado de intentar agregar al carrito.
 *
 * `provincia_distinta` es el caso que importa: los precios y la disponibilidad
 * son por provincia, así que un carrito con artículos de dos provincias no se
 * puede cotizar —ni siquiera se sabría a qué número escribir—. Se rechaza el
 * alta y la página avisa, en vez de dejar armar un pedido imposible.
 */
export type ResultadoAgregar =
  | { ok: true }
  | { ok: false; motivo: "provincia_distinta"; provinciaCarrito: string };

function leer(): CartItem[] {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return [];
    const items = JSON.parse(crudo)?.state?.items;
    if (!Array.isArray(items)) return [];
    return items.filter((i) => i?.producto?.id != null && typeof i.cantidad === "number");
  } catch {
    return [];
  }
}

function guardar(lista: CartItem[]) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ state: { items: lista }, version: VERSION }));
  } catch {
    // Sin almacenamiento (modo privado, cuota llena): el carrito vive en memoria.
  }
}

// Empieza vacío para que el HTML del servidor y la primera pintura del
// navegador coincidan; hidratarCarrito() carga lo guardado al montar la isla.
let items = $state.raw<CartItem[]>([]);
let hidratado = false;

const totalItems = $derived(items.reduce((total, i) => total + i.cantidad, 0));
const totalPrice = $derived(items.reduce((total, i) => total + i.producto.precio * i.cantidad, 0));
// Los carritos guardados antes de que existiera la venta por provincia no
// tienen el campo: se ignoran en vez de tratarlos como provincia propia, que
// bloquearía el carrito de alguien que sólo volvió a entrar.
const provincia = $derived(items.find((i) => i.producto.provincia)?.producto.provincia ?? null);

function fijar(lista: CartItem[]) {
  items = lista;
  guardar(lista);
}

/** Carga el carrito guardado. Llamar una vez desde onMount de la isla. */
export function hidratarCarrito() {
  if (hidratado) return;
  hidratado = true;
  items = leer();
}

export const carrito = {
  get items() {
    return items;
  },
  get totalItems() {
    return totalItems;
  },
  get totalPrice() {
    return totalPrice;
  },
  /** Provincia de los artículos del carrito, o null si está vacío. */
  get provincia() {
    return provincia;
  },

  cantidadDe(productoId: string): number {
    return items.find((i) => i.producto.id === productoId)?.cantidad ?? 0;
  },

  agregar(producto: ArticuloTienda, cantidad = 1): ResultadoAgregar {
    const provinciaCarrito = provincia;
    const provinciaProducto = producto.provincia ?? null;
    if (provinciaCarrito && provinciaProducto && provinciaCarrito !== provinciaProducto) {
      return { ok: false, motivo: "provincia_distinta", provinciaCarrito };
    }

    if (items.some((i) => i.producto.id === producto.id)) {
      fijar(
        items.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i,
        ),
      );
    } else {
      fijar([...items, { producto: $state.snapshot(producto) as ArticuloTienda, cantidad }]);
    }
    return { ok: true };
  },

  quitar(productoId: string) {
    fijar(items.filter((i) => i.producto.id !== productoId));
  },

  cambiarCantidad(productoId: string, cantidad: number) {
    if (cantidad <= 0) {
      carrito.quitar(productoId);
      return;
    }
    fijar(items.map((i) => (i.producto.id === productoId ? { ...i, cantidad } : i)));
  },

  vaciar() {
    fijar([]);
  },
};
