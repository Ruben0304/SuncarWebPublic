<script lang="ts">
  import { onMount } from "svelte";
  import ChevronLeft from "lucide-svelte/icons/chevron-left";
  import ChevronRight from "lucide-svelte/icons/chevron-right";
  import {
    CAPTION_PASO,
    GRUPOS,
    etiquetaBateria,
    etiquetaInversor,
    etiquetaPaneles,
    type KitConfigurable,
    type PasoKit,
    type SeleccionKit,
  } from "@/lib/ofertas/configurador";
  import { FOTOS_FIJAS, fotoDeEquipo, type FotoEquipo } from "@/lib/ofertas/fotos-equipos";
  import { atributosImagen } from "./imagen";

  // La foto fija de la izquierda: los equipos del kit a escala, con puntos y
  // flechas para volver a un paso anterior, como el carrusel de Apple.

  /** Alto en pantalla de cada equipo: crece con su tamaño real, sin pasarse. */
  const altoEnPantalla = (altoM: number) =>
    Math.round(Math.min(310, Math.max(210, 225 * Math.sqrt(altoM / 0.55))));

  interface Ranura {
    clave: PasoKit;
    etiqueta: string;
    foto: FotoEquipo | null;
    copias: number;
    elegida: boolean;
    alto: number;
    /** Cuánto se tapan entre sí las copias de una misma pieza, en px sin escalar. */
    solape: number;
  }

  interface Props {
    kit: KitConfigurable | null;
    seleccion: SeleccionKit;
    indiceVisible: number;
    onanterior: (() => void) | null;
    onsiguiente: (() => void) | null;
  }
  let { kit, seleccion, indiceVisible, onanterior, onsiguiente }: Props = $props();

  const ranuras = $derived.by(() => {
    const lista: Ranura[] = [];
    if (!kit) return lista;
    const c = kit.config;
    const inversor = fotoDeEquipo(c.inversorCodigo, null, 0.55);
    lista.push({
      clave: "inversor",
      etiqueta: etiquetaInversor(c),
      foto: inversor,
      copias: Math.min(c.inversorUnidades, 3),
      elegida: seleccion.inversor !== null,
      alto: altoEnPantalla(inversor?.altoM ?? 0.55),
      solape: 24,
    });
    if (indiceVisible >= 1 && c.bateriaUnidades > 0) {
      const bateria = fotoDeEquipo(c.bateriaCodigo, null, 0.62);
      lista.push({
        clave: "bateria",
        etiqueta: etiquetaBateria(c),
        foto: bateria,
        copias: Math.min(c.bateriaUnidades, 3),
        elegida: seleccion.bateria !== null,
        alto: altoEnPantalla(bateria?.altoM ?? 0.62),
        solape: 24,
      });
    }
    if (indiceVisible >= 2) {
      lista.push({
        clave: "paneles",
        etiqueta: etiquetaPaneles(c),
        foto: c.paneles > 0 ? FOTOS_FIJAS.panel : null,
        copias: Math.min(c.paneles, 3),
        elegida: seleccion.paneles !== null,
        alto: 220,
        solape: Math.round(220 * FOTOS_FIJAS.panel.aspecto * 0.4),
      });
    }
    return lista;
  });

  // La fila de equipos se encoge para caber en el ancho real de la tarjeta,
  // sea cual sea el kit y la ventana.
  let caja: HTMLDivElement | null = $state(null);
  let anchoCaja = $state(620);
  onMount(() => {
    if (!caja) return;
    const elemento = caja;
    const medir = () => (anchoCaja = elemento.clientWidth);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(elemento);
    return () => observador.disconnect();
  });

  const HUECO = 24;
  const anchoDe = (r: Ranura) =>
    r.foto ? Math.round(r.alto * r.foto.aspecto) * r.copias - (r.copias - 1) * r.solape : 80;
  const anchoTotal = $derived(
    ranuras.reduce((n, r) => n + anchoDe(r), 0) + HUECO * Math.max(0, ranuras.length - 1),
  );
  const escala = $derived(
    Math.max(0.2, Math.min(1, Math.floor(((anchoCaja - 8) / Math.max(anchoTotal, 1)) * 100) / 100)),
  );
</script>

<div class="relative flex h-[440px] flex-col overflow-hidden rounded-[28px] bg-[#F5F5F7] p-6 sm:p-[30px] lg:sticky lg:top-28 lg:h-[calc(100vh-8rem)] lg:max-h-[640px] lg:min-h-[540px]">
  <p class="max-w-[26rem] text-[17px] font-semibold leading-[1.35] tracking-[-0.022em] text-[#6e6e73]">
    {CAPTION_PASO[GRUPOS[indiceVisible]]}
  </p>

  <div bind:this={caja} class="flex flex-1 items-center justify-center pb-[72px]">
    <div class="flex items-end justify-center gap-6" style:--k={escala}>
      {#each ranuras as r (r.clave)}
        <figure
          class={`flex flex-col items-center transition-opacity duration-500 ${r.elegida ? "opacity-100" : "opacity-40"}`}
        >
          <div class="flex items-end" style:min-height={`calc(${r.alto}px * var(--k))`}>
            {#if r.foto}
              {@const foto = r.foto}
              {@const ancho = Math.round(r.alto * foto.aspecto)}
              {@const imagen = atributosImagen(foto.src, { width: ancho, sizes: "200px" })}
              {#each Array.from({ length: r.copias }) as _, i (i)}
                <img
                  src={imagen.src}
                  srcset={imagen.srcset}
                  sizes={imagen.sizes}
                  alt={r.clave === "paneles" ? "Panel solar" : r.etiqueta}
                  width={ancho}
                  height={r.alto}
                  loading="lazy"
                  decoding="async"
                  class="drop-shadow-md"
                  style:height={`calc(${r.alto}px * var(--k))`}
                  style:width="auto"
                  style:margin-left={i > 0 ? `calc(-${r.solape}px * var(--k))` : undefined}
                />
              {/each}
            {/if}
          </div>
          <figcaption class="mt-3 whitespace-nowrap text-sm font-semibold text-[#6e6e73]">
            {r.etiqueta}
          </figcaption>
        </figure>
      {/each}
    </div>
  </div>

  <!-- Puntos y flechas: los tres pasos, como el carrusel de Apple. -->
  <div class="absolute inset-x-0 bottom-[30px] flex items-center justify-center gap-4">
    <button
      type="button"
      onclick={() => onanterior?.()}
      disabled={!onanterior}
      aria-label="Paso anterior"
      class="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8e8ed] text-[#1d1d1f] transition-opacity disabled:opacity-40 lg:h-9 lg:w-9"
    >
      <ChevronLeft class="h-5 w-5" aria-hidden="true" />
    </button>
    <div class="flex h-[38px] items-center gap-[14px] rounded-full bg-[#e8e8ed] px-5">
      {#each GRUPOS as p, i (p)}
        <span
          class={`h-[7px] w-[7px] rounded-full transition-colors ${i === indiceVisible ? "bg-[#1d1d1f]" : "bg-[#86868b]"}`}
        ></span>
      {/each}
    </div>
    <button
      type="button"
      onclick={() => onsiguiente?.()}
      disabled={!onsiguiente}
      aria-label="Volver al paso actual"
      class="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8e8ed] text-[#1d1d1f] transition-opacity disabled:opacity-40 lg:h-9 lg:w-9"
    >
      <ChevronRight class="h-5 w-5" aria-hidden="true" />
    </button>
  </div>
</div>
