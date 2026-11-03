<script lang="ts">
  // Botón flotante del carrito (en la casa, el carrito está dibujado en la acera).
  import ShoppingCart from "lucide-svelte/icons/shopping-cart";
  import { alternarCarrito, carrito } from "~/lib/cart.svelte";
</script>

<button
  type="button"
  onclick={alternarCarrito}
  class="group fixed bottom-4 right-4 z-[60] flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#012928] text-white shadow-2xl transition-all duration-300 hover:scale-110 md:bottom-6 md:right-6 md:h-[60px] md:w-[60px]"
  aria-label="Abrir carrito de compras"
>
  <ShoppingCart class="h-6 w-6 md:h-7 md:w-7" />
  {#if carrito.totalItems > 0}
    <span class="absolute -right-0.5 -top-0.5 flex h-[22px] min-w-[22px] animate-pulse items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold text-white shadow-lg md:-right-1 md:-top-1 md:h-[26px] md:min-w-[26px] md:px-1.5 md:text-xs">
      {carrito.totalItems}
    </span>
  {/if}
</button>
