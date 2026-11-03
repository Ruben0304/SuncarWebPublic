<script lang="ts">
  // Catálogo de una zona a pantalla completa. Sube como una hoja en el móvil;
  // las píldoras de arriba cambian de zona sin volver a la casa.
  import { onMount, type Snippet } from "svelte";
  import ChevronLeft from "lucide-svelte/icons/chevron-left";
  import MapPin from "lucide-svelte/icons/map-pin";
  import { ZONAS, ZONAS_POR_ID, kitsDeZona, productosDeZona, type ZonaId } from "@/components/tienda/zonas";
  import type { ArticuloTienda, ProvinciaOferta } from "@/types/tienda";
  import type { OfertaSimplificada } from "@/types/ofertas";
  import { ICONOS } from "./iconos";
  import KitsIncluidos from "./KitsIncluidos.svelte";
  import SinProductos from "./SinProductos.svelte";
  import TarjetaFantasma from "./TarjetaFantasma.svelte";
  import TarjetaProducto from "./TarjetaProducto.svelte";
  import t from "./tienda.module.css";

  const CURVA = "cubic-bezier(0.32, 0.72, 0, 1)";
  const DURACION_SALIDA = 380;

  interface Props {
    zonaId: ZonaId;
    productos: ArticuloTienda[];
    kits: OfertaSimplificada[];
    cargando: boolean;
    error: string | null;
    onreintentar: () => void;
    provincia: string;
    provincias: ProvinciaOferta[];
    onprovincia: (codigo: string) => void;
    oncambiar: (zona: ZonaId) => void;
    oncerrar: () => void;
    onagregar: (producto: ArticuloTienda) => void;
    onver: (producto: ArticuloTienda) => void;
    /** false mientras otra capa (la ficha del producto) se queda con la tecla Escape. */
    atajoEscape?: boolean;
  }
  let {
    zonaId,
    productos,
    kits,
    cargando,
    error,
    onreintentar,
    provincia,
    provincias,
    onprovincia,
    oncambiar,
    oncerrar,
    onagregar,
    onver,
    atajoEscape = true,
  }: Props = $props();

  const zona = $derived(ZONAS_POR_ID[zonaId]);
  let abierto = $state(false);
  let scrollEl: HTMLDivElement | undefined = $state();
  let pildorasEl: HTMLDivElement | undefined = $state();
  let cerrarEl: HTMLButtonElement | undefined = $state();

  onMount(() => {
    // Doble frame: el primero pinta la hoja abajo, el segundo ya la sube.
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => (abierto = true));
    });
    cerrarEl?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = overflow;
    };
  });

  function cerrar() {
    abierto = false;
    setTimeout(oncerrar, DURACION_SALIDA);
  }

  function teclado(e: KeyboardEvent) {
    if (e.key === "Escape" && atajoEscape) cerrar();
  }

  // Al cambiar de zona: arriba del todo y la píldora activa a la vista.
  $effect(() => {
    const id = zonaId;
    scrollEl?.scrollTo({ top: 0 });
    pildorasEl
      ?.querySelector<HTMLElement>(`[data-zona="${id}"]`)
      ?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  });

  const propios = $derived(productosDeZona(zona, productos));
  const suyos = $derived(kitsDeZona(zona, kits));
  const total = $derived(propios.length || suyos.length);
</script>

<svelte:window onkeydown={teclado} />

{#snippet rejilla(titulo: string | undefined, tarjetas: Snippet)}
  <div class="mt-6">
    {#if titulo}
      <h3 class="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{titulo}</h3>
    {/if}
    <div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {@render tarjetas()}
    </div>
  </div>
{/snippet}

<div
  bind:this={scrollEl}
  role="dialog"
  aria-modal="true"
  aria-label={zona.nombre}
  class={`${t.sinBarra} fixed inset-0 z-[55] overflow-y-auto overscroll-contain bg-[#F2F2EF]`}
  style:transform={abierto ? "translateY(0)" : "translateY(100%)"}
  style:transition={`transform .5s ${CURVA}`}
>
  <header class="sticky top-0 z-10 bg-[#F2F2EF]/85 backdrop-blur-xl">
    <div class="mx-auto flex max-w-6xl items-center gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <button
        bind:this={cerrarEl}
        type="button"
        onclick={cerrar}
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#012928] ring-1 ring-[#012928]/[0.08] transition-transform active:scale-90"
        aria-label="Volver a la casa"
      >
        <ChevronLeft class="h-5 w-5" />
      </button>
      {#key zonaId}
        <div class={`${t.entrar} min-w-0 flex-1`}>
          <h2 class="truncate text-lg font-bold leading-tight text-[#012928]">{zona.nombre}</h2>
          <p class="text-xs text-slate-500">
            {cargando && zona.categorias.length > 0
              ? "Cargando…"
              : `${total} ${total === 1 ? "opción" : "opciones"}`}
          </p>
        </div>
      {/key}
      {#if provincias.length > 0}
        <label class="flex shrink-0 items-center gap-1 rounded-full bg-white py-1 pl-2.5 pr-1 ring-1 ring-[#012928]/[0.08]">
          <MapPin class="h-3.5 w-3.5 text-[#012928]" />
          <span class="sr-only">Provincia</span>
          <select
            value={provincia}
            onchange={(e) => onprovincia(e.currentTarget.value)}
            class="max-w-[7.5rem] cursor-pointer truncate bg-transparent py-1 pr-1 text-[13px] font-semibold text-[#012928] outline-none"
          >
            {#each provincias as p (p.codigo)}
              <option value={p.codigo}>{p.nombre}</option>
            {/each}
          </select>
        </label>
      {/if}
    </div>

    <div
      bind:this={pildorasEl}
      class={`${t.sinBarra} mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3`}
    >
      {#each ZONAS as z (z.id)}
        {@const I = ICONOS[z.id]}
        {@const activa = z.id === zonaId}
        <button
          type="button"
          data-zona={z.id}
          onclick={() => oncambiar(z.id)}
          aria-current={activa}
          class={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors duration-300 ${
            activa
              ? "bg-[#012928] text-white"
              : "bg-white text-[#012928]/75 ring-1 ring-[#012928]/[0.08] hover:text-[#012928]"
          }`}
        >
          <I class={`h-3.5 w-3.5 ${activa ? "text-[#AFEB17]" : ""}`} />
          {z.nombre}
        </button>
      {/each}
    </div>
  </header>

  <main class="mx-auto max-w-6xl px-4 pb-28">
    {#key zonaId}
      <p class={`${t.entrar} mt-1 text-sm text-slate-500`}>{zona.frase}</p>
    {/key}

    {#key zonaId}
      <div>
        {#if error && zona.categorias.length > 0}
          <div class="mt-6 rounded-[22px] bg-white p-6 text-center ring-1 ring-[#012928]/[0.06]">
            <p class="font-semibold text-[#012928]">No pudimos cargar los productos</p>
            <button
              type="button"
              onclick={onreintentar}
              class="mt-3 rounded-full bg-[#012928] px-5 py-2 text-sm font-semibold text-white"
            >
              Reintentar
            </button>
          </div>
        {:else if cargando && zona.categorias.length > 0}
          {#snippet fantasmas()}
            {#each Array.from({ length: 4 }, (_, i) => i) as i (i)}
              <TarjetaFantasma />
            {/each}
          {/snippet}
          {@render rejilla(undefined, fantasmas)}
        {:else if propios.length > 0}
          {#snippet tarjetas()}
            {#each propios as p, i (p.id)}
              <TarjetaProducto
                producto={p}
                {onagregar}
                {onver}
                compacta
                prioritaria={i < 4}
                class={t.entrar}
                style={`animation-delay: ${Math.min(i, 8) * 45}ms`}
              />
            {/each}
          {/snippet}
          {@render rejilla(suyos.length > 0 ? "Por separado" : undefined, tarjetas)}
        {:else if zona.categorias.length > 0}
          <SinProductos {zona} hayKits={suyos.length > 0} />
        {/if}

        {#if suyos.length > 0}
          <KitsIncluidos kits={suyos} hayProductos={propios.length > 0} />
        {/if}
      </div>
    {/key}
  </main>
</div>
