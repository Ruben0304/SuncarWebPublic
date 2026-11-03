<script lang="ts">
  import Package from "lucide-svelte/icons/package";
  import ImageIcon from "lucide-svelte/icons/image";
  import type { Oferta, OfertaElemento } from "@/types/ofertas";
  import { ordenarElementosKit } from "@/lib/ofertas/elementos-kit";
  import { atributosImagen } from "./imagen";
  import ChipVoltaje from "./ChipVoltaje.svelte";
  import ModalDetalle from "./ModalDetalle.svelte";
  import { etiquetaVoltaje } from "./voltaje";

  // "Ver qué trae el kit": arriba los equipos principales con su cantidad; debajo,
  // "Además incluye", el material complementario, más pequeño y sin cantidad.
  interface Props {
    /** null mientras se pide el detalle. */
    oferta: Oferta | null;
    descripcion: string;
    cargando?: boolean;
    error?: boolean;
    abierto: boolean;
    oncerrar: () => void;
  }
  let { oferta, descripcion, cargando = false, error = false, abierto, oncerrar }: Props = $props();

  let fotosRotas = $state<Record<string, boolean>>({});

  const grupos = $derived(ordenarElementosKit(oferta?.elementos ?? []));
  const principales = $derived(grupos.principales);
  const ademas = $derived(grupos.ademas);

  const clave = (e: OfertaElemento, i: number) =>
    `${i}-${e.codigo || ""}-${e.categoria || ""}-${e.descripcion || ""}`;
</script>

{#snippet elemento(e: OfertaElemento, i: number, compacto: boolean)}
  {@const k = clave(e, i)}
  {@const hayFoto = Boolean(e.foto) && !fotosRotas[k]}
  {@const lado = compacto ? "h-11 w-11" : "h-16 w-16"}
  <div
    class={compacto
      ? "flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/70 p-2.5"
      : "flex items-start gap-4 rounded-lg border bg-gray-50 p-4 transition-colors hover:bg-gray-100"}
  >
    {#if hayFoto}
      {@const foto = atributosImagen(e.foto as string, { rellena: true, sizes: compacto ? "44px" : "64px", quality: 60 })}
      <div class={`relative ${lado} flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white`}>
        <img
          src={foto.src}
          srcset={foto.srcset}
          sizes={foto.sizes}
          alt={e.descripcion || "Elemento"}
          loading="lazy"
          decoding="async"
          class="absolute inset-0 h-full w-full object-contain p-1"
          onerror={() => (fotosRotas = { ...fotosRotas, [k]: true })}
        />
      </div>
    {:else}
      <div class={`flex ${lado} flex-shrink-0 items-center justify-center rounded-lg border border-[#F2C300]/25 bg-[#F2C300]/15`}>
        <ImageIcon class={`${compacto ? "h-4 w-4" : "h-6 w-6"} text-[#F2C300]/80`} aria-hidden="true" />
      </div>
    {/if}
    <div class="min-w-0 flex-1">
      {#if e.categoria}
        <span
          class={`inline-flex items-center rounded-full border font-semibold text-foreground ${
            compacto ? "mb-1 px-1.5 py-0 text-[10px]" : "mb-2 px-2.5 py-0.5 text-xs"
          }`}
        >
          {e.categoria}
        </span>
      {/if}
      {#if e.descripcion}
        {#if compacto}
          <p class="text-sm leading-snug text-gray-800">{e.descripcion}</p>
        {:else}
          <h4 class="mb-1 font-semibold text-gray-900">{e.descripcion}</h4>
        {/if}
      {/if}
      {#if !compacto && e.cantidad}
        <p class="text-sm text-gray-600">Cantidad: <span class="font-medium">{e.cantidad}</span></p>
      {/if}
    </div>
  </div>
{/snippet}

<ModalDetalle
  {abierto}
  {oncerrar}
  {descripcion}
  {cargando}
  {error}
  hayOferta={oferta !== null}
  icono={Package}
  titulo="Elementos incluidos"
>
  {#if principales.length + ademas.length > 0}
    <div>
      {#if oferta?.voltaje}
        <p class="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <ChipVoltaje voltaje={oferta.voltaje} />
          Kit para instalaciones de {etiquetaVoltaje(oferta.voltaje)}
        </p>
      {/if}
      {#if principales.length > 0}
        <div class="space-y-4">
          {#each principales as e, i (clave(e, i))}
            {@render elemento(e, i, false)}
          {/each}
        </div>
      {/if}

      {#if ademas.length > 0}
        <section aria-labelledby="kit-ademas" class={principales.length > 0 ? "mt-7" : ""}>
          <div class="mb-3 flex items-center gap-3">
            <span class="h-px flex-1 bg-gray-200" aria-hidden="true"></span>
            <h3 id="kit-ademas" class="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
              {principales.length > 0 ? "Además incluye" : "Incluye"}
            </h3>
            <span class="h-px flex-1 bg-gray-200" aria-hidden="true"></span>
          </div>
          <div class="grid gap-2 sm:grid-cols-2">
            {#each ademas as e, i (clave(e, i))}
              {@render elemento(e, i, true)}
            {/each}
          </div>
        </section>
      {/if}

      <p class="mt-6 border-t border-gray-100 pt-4 text-[11px] leading-relaxed text-gray-500">
        El material complementario puede diferir del que aparece en las fotos, y la cantidad a utilizar se determina
        según las características de cada instalación.
      </p>
    </div>
  {:else}
    <p class="italic text-gray-500">No hay elementos especificados para esta oferta.</p>
  {/if}
</ModalDetalle>
