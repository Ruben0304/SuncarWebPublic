<script lang="ts">
  // Tarjeta de «Comprados juntos» del drawer del carrito.
  import Package from "lucide-svelte/icons/package";
  import { imagenResponsive } from "~/lib/imagenes";
  import type { ProductoRecomendado } from "./recomendadorCarrito.svelte";

  interface Props {
    producto: ProductoRecomendado;
    /** Las primeras tarjetas no esperan al lazy-load. */
    prioritaria: boolean;
  }
  let { producto, prioritaria }: Props = $props();

  const foto = $derived(producto.foto ? imagenResponsive(producto.foto, [256, 384]) : null);
</script>

<div class="w-[calc(50%-6px)] min-w-[calc(50%-6px)] flex-shrink-0 snap-start rounded-xl border border-slate-200 bg-white p-2.5 transition-transform active:scale-[0.98]">
  <div class="relative mb-2 aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
    {#if foto}
      <img
        src={foto.src}
        srcset={foto.srcset}
        sizes="(max-width: 480px) 45vw, 200px"
        alt={producto.modelo}
        loading={prioritaria ? "eager" : "lazy"}
        decoding="async"
        class="absolute inset-0 h-full w-full object-contain p-2"
      />
    {:else}
      <div class="flex h-full w-full items-center justify-center text-slate-300">
        <Package class="h-6 w-6" />
      </div>
    {/if}
  </div>

  <p class="line-clamp-2 min-h-[2rem] text-xs font-medium leading-snug text-slate-800">{producto.modelo}</p>
  <p class="mt-0.5 truncate text-[10px] text-slate-400">{producto.categoria}</p>
  {#if producto.potenciaKW != null}
    <p class="mt-0.5 text-[10px] font-semibold text-primary">{producto.potenciaKW} kW</p>
  {/if}

  <div class="mt-2">
    {#if producto.vendible}
      <a
        href="/productos"
        class="inline-flex h-8 w-full items-center justify-center whitespace-nowrap rounded-lg bg-[#012928] px-3 text-[11px] font-medium text-white transition-colors hover:bg-[#012928]/90"
      >
        Ver producto
      </a>
    {:else}
      <div class="flex h-8 w-full items-center justify-center rounded-lg border border-[#F2C300]/25 bg-[#F2C300]/5 px-1.5 text-center text-[10px] font-medium leading-tight text-[#F2C300]/80">
        No se vende suelto
      </div>
    {/if}
  </div>
</div>
