import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ArticuloTienda } from '@/types/tienda';

export interface CartItem {
  producto: ArticuloTienda;
  cantidad: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (producto: ArticuloTienda, cantidad?: number) => void;
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

      addItem: (producto, cantidad = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.producto.id === producto.id);

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.producto.id === producto.id
                  ? { ...item, cantidad: item.cantidad + cantidad }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { producto, cantidad }],
          };
        });
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
            item.producto.id === productoId
              ? { ...item, cantidad }
              : item
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
          0
        );
      },
    }),
    {
      name: 'suncar-cart-storage',
    }
  )
);
