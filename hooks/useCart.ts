import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ArticuloTienda } from "@/types/tienda";

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

interface CartStore {
  items: CartItem[];
  addItem: (producto: ArticuloTienda, cantidad?: number) => ResultadoAgregar;
  /** Provincia de los artículos del carrito, o null si está vacío. */
  getProvincia: () => string | null;
  removeItem: (productoId: string) => void;
  updateQuantity: (productoId: string, cantidad: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      getProvincia: () => {
        // Los carritos guardados antes de que existiera la venta por provincia
        // no tienen el campo: se ignoran en vez de tratarlos como provincia
        // propia, que bloquearía el carrito de alguien que sólo volvió a entrar.
        const conProvincia = get().items.find((i) => i.producto.provincia);
        return conProvincia?.producto.provincia ?? null;
      },

      addItem: (producto, cantidad = 1) => {
        const provinciaCarrito = get().getProvincia();
        const provinciaProducto = producto.provincia ?? null;
        if (
          provinciaCarrito &&
          provinciaProducto &&
          provinciaCarrito !== provinciaProducto
        ) {
          return { ok: false, motivo: "provincia_distinta", provinciaCarrito };
        }

        set((state) => {
          const existingItem = state.items.find(
            (item) => item.producto.id === producto.id,
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.producto.id === producto.id
                  ? { ...item, cantidad: item.cantidad + cantidad }
                  : item,
              ),
            };
          }

          return {
            items: [...state.items, { producto, cantidad }],
          };
        });
        return { ok: true };
      },

      removeItem: (productoId) => {
        set((state) => ({
          items: state.items.filter((item) => item.producto.id !== productoId),
        }));
      },

      updateQuantity: (productoId, cantidad) => {
        if (cantidad <= 0) {
          get().removeItem(productoId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.producto.id === productoId ? { ...item, cantidad } : item,
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.cantidad, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.producto.precio * item.cantidad,
          0,
        );
      },
    }),
    {
      name: "suncar-cart-storage-v2",
    },
  ),
);
