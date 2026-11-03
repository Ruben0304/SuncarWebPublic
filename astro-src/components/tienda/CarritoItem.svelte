<script lang="ts">
  import Minus from "lucide-svelte/icons/minus";
  import Package from "lucide-svelte/icons/package";
  import Plus from "lucide-svelte/icons/plus";
  import Trash2 from "lucide-svelte/icons/trash-2";
  import { carrito, type CartItem } from "~/lib/cart.svelte";
  import { imagenResponsive } from "~/lib/imagenes";

  interface Props {
    item: CartItem;
    /** Las primeras filas no esperan al lazy-load. */
    prioritaria: boolean;
  }
  let { item, prioritaria }: Props = $props();

  const producto = $derived(item.producto);
  const foto = $derived(producto.foto ? imagenResponsive(producto.foto, [128, 256]) : null);
</script>

<div class="flex gap-3 px-4 py-3.5 transition-colors active:bg-slate-50">
  <!-- Imagen - tamaño touch-friendly -->
  <div class="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
    {#if foto}
      <img
        src={foto.src}
        srcset={foto.srcset}
        sizes="72px"
        alt={producto.modelo}
        loading={prioritaria ? "eager" : "lazy"}
        decoding="async"
        class="absolute inset-0 h-full w-full object-contain p-1.5"
      />
    {:else}
      <div class="flex h-full w-full items-center justify-center text-slate-300">
        <Package class="h-7 w-7" />
      </div>
    {/if}
  </div>

  <!-- Info del producto -->
  <div class="flex min-w-0 flex-1 flex-col justify-between">
    <div class="flex items-start justify-between gap-1.5">
      <div class="min-w-0 flex-1">
        <h3 class="line-clamp-2 text-[13px] font-semibold leading-tight text-slate-900">{producto.modelo}</h3>
        <p class="mt-0.5 text-[11px] text-slate-400">{producto.categoria}</p>
      </div>
      <button
        type="button"
        onclick={() => carrito.quitar(producto.id)}
        class="-mr-1.5 -mt-0.5 flex-shrink-0 rounded-full p-1.5 text-slate-300 transition-colors hover:text-red-500 active:bg-red-50 active:text-red-600"
        title="Eliminar"
        aria-label={`Eliminar ${producto.modelo}`}
      >
        <Trash2 class="h-[15px] w-[15px]" />
      </button>
    </div>

    <div class="mt-2 flex items-center justify-between gap-2">
      <!-- Controles de cantidad - touch targets 44px -->
      <div class="flex items-center overflow-hidden rounded-full border border-slate-200 bg-white">
        <button
          type="button"
          onclick={() => carrito.cambiarCantidad(producto.id, item.cantidad - 1)}
          class="flex h-9 w-9 items-center justify-center text-slate-500 transition-colors active:bg-slate-100"
          aria-label="Quitar uno"
        >
          <Minus class="h-3.5 w-3.5" />
        </button>
        <span class="w-8 text-center text-[13px] font-bold tabular-nums text-slate-900">{item.cantidad}</span>
        <button
          type="button"
          onclick={() => carrito.cambiarCantidad(producto.id, item.cantidad + 1)}
          class="flex h-9 w-9 items-center justify-center text-slate-500 transition-colors active:bg-slate-100"
          aria-label="Agregar uno"
        >
          <Plus class="h-3.5 w-3.5" />
        </button>
      </div>

      <!-- Precio -->
      <div class="flex-shrink-0 text-right">
        <p class="text-[15px] font-bold tabular-nums text-slate-900">
          ${(producto.precio * item.cantidad).toLocaleString()}
        </p>
        {#if item.cantidad > 1}
          <p class="text-[10px] tabular-nums text-slate-400">
            ${producto.precio.toLocaleString()}/{producto.unidad}
          </p>
        {/if}
      </div>
    </div>
  </div>
</div>
