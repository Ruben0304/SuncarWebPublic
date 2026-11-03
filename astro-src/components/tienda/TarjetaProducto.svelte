<script lang="ts">
  import Minus from "lucide-svelte/icons/minus";
  import Package from "lucide-svelte/icons/package";
  import Plus from "lucide-svelte/icons/plus";
  import Zap from "lucide-svelte/icons/zap";
  import { carrito } from "~/lib/cart.svelte";
  import { imagenResponsive } from "~/lib/imagenes";
  import { formatearPrecio } from "@/lib/ofertas/ofertas-publicas";
  import t from "./tienda.module.css";
  import type { ArticuloTienda } from "@/types/tienda";

  const POR_UNIDAD: Record<string, string> = {
    pieza: "c/u",
    set: "por set",
    m: "por metro",
  };

  interface Props {
    producto: ArticuloTienda;
    onagregar: (producto: ArticuloTienda) => void;
    onver: (producto: ArticuloTienda) => void;
    compacta?: boolean;
    /** Las primeras tarjetas visibles no esperan al lazy-load. */
    prioritaria?: boolean;
    class?: string;
    style?: string;
  }
  let {
    producto,
    onagregar,
    onver,
    compacta = false,
    prioritaria = false,
    class: className = "",
    style,
  }: Props = $props();

  const cantidad = $derived(carrito.cantidadDe(producto.id));
  const foto = $derived(producto.foto ? imagenResponsive(producto.foto, [256, 384, 640]) : null);
  const sizes = $derived(compacta ? "(max-width: 768px) 45vw, 220px" : "(max-width: 768px) 64vw, 200px");
</script>

<article
  {style}
  class={`group flex flex-col overflow-hidden rounded-[22px] bg-white ring-1 ring-[#012928]/[0.06] shadow-[0_10px_30px_-18px_rgba(1,41,40,0.45)] transition-shadow hover:shadow-[0_18px_40px_-18px_rgba(1,41,40,0.5)] ${className}`}
>
  <button
    type="button"
    onclick={() => onver(producto)}
    class="relative block aspect-square w-full bg-gradient-to-b from-[#F2F2EF] to-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#012928]"
    aria-label={`Ver detalles de ${producto.modelo}`}
  >
    {#if foto}
      <img
        src={foto.src}
        srcset={foto.srcset}
        {sizes}
        alt=""
        loading={prioritaria ? "eager" : "lazy"}
        decoding="async"
        class="absolute inset-0 h-full w-full object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-[1.06]"
      />
    {:else}
      <Package class="absolute inset-0 m-auto h-10 w-10 text-slate-300" />
    {/if}
    {#if producto.potenciaKW != null && producto.potenciaKW >= 1}
      <span class="absolute right-2.5 top-2.5 inline-flex items-center gap-0.5 rounded-full bg-[#AFEB17] px-2 py-0.5 text-[10px] font-bold text-[#012928]">
        <Zap class="h-2.5 w-2.5" />
        {producto.potenciaKW} kW
      </span>
    {/if}
    {#if producto.precio_por_cantidad}
      <span class="absolute left-2.5 top-2.5 rounded-full bg-[#F2C300] px-2 py-0.5 text-[10px] font-bold text-[#012928]">
        Dto. volumen
      </span>
    {/if}
  </button>

  <div class={`flex flex-1 flex-col ${compacta ? "p-3" : "p-4"}`}>
    {#if producto.marca_nombre}
      <span class="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {producto.marca_nombre}
      </span>
    {/if}
    <h3 class={`line-clamp-2 font-semibold leading-snug text-[#012928] ${compacta ? "text-[13px]" : "text-[15px]"}`}>
      {producto.modelo}
    </h3>
    <div class="mt-auto flex items-end justify-between gap-2 pt-3">
      <div class="min-w-0">
        <span class={`font-bold tabular-nums text-[#012928] ${compacta ? "text-lg" : "text-2xl"}`}>
          ${formatearPrecio(producto.precio)}
        </span>
        <span class="ml-1 text-[11px] text-slate-400">
          {POR_UNIDAD[producto.unidad] ?? producto.unidad}
        </span>
      </div>

      {#if cantidad > 0}
        <div class={`${t.pop} flex h-10 shrink-0 items-center rounded-full bg-[#012928] text-white`}>
          <button
            type="button"
            onclick={() => carrito.cambiarCantidad(producto.id, cantidad - 1)}
            class="flex h-10 w-9 items-center justify-center rounded-l-full active:bg-white/10"
            aria-label="Quitar uno"
          >
            <Minus class="h-3.5 w-3.5" />
          </button>
          <span class="min-w-[1.25rem] text-center text-sm font-bold tabular-nums">{cantidad}</span>
          <button
            type="button"
            onclick={() => onagregar(producto)}
            class="flex h-10 w-9 items-center justify-center rounded-r-full active:bg-white/10"
            aria-label="Agregar otro"
          >
            <Plus class="h-3.5 w-3.5" />
          </button>
        </div>
      {:else}
        <button
          type="button"
          onclick={() => onagregar(producto)}
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#012928] text-white shadow-[0_6px_16px_-6px_rgba(1,41,40,0.7)] transition-transform hover:scale-105 active:scale-90"
          aria-label={`Agregar ${producto.modelo} al carrito`}
        >
          <Plus class="h-4 w-4" />
        </button>
      {/if}
    </div>
  </div>
</article>
