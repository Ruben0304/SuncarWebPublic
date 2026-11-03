<script lang="ts">
  import Package from "lucide-svelte/icons/package";
  import ImageIcon from "lucide-svelte/icons/image";
  import type { Oferta } from "@/types/ofertas";
  import { atributosImagen } from "./imagen";
  import ModalDetalle from "./ModalDetalle.svelte";

  // "Ver qué trae el kit".
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
</script>

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
  {#if oferta && oferta.elementos && oferta.elementos.length > 0}
    <div class="space-y-4">
      {#each oferta.elementos as elemento, index (`${index}-${elemento.categoria || ""}-${elemento.descripcion || ""}`)}
        {@const clave = `${index}-${elemento.categoria || ""}-${elemento.descripcion || ""}`}
        {@const hayFoto = Boolean(elemento.foto) && !fotosRotas[clave]}
        <div class="rounded-lg border bg-gray-50 p-4 transition-colors hover:bg-gray-100">
          <div class="flex items-start gap-4">
            {#if hayFoto}
              {@const foto = atributosImagen(elemento.foto as string, { rellena: true, sizes: "64px", quality: 60 })}
              <div class="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                <img
                  src={foto.src}
                  srcset={foto.srcset}
                  sizes={foto.sizes}
                  alt={elemento.descripcion || "Elemento"}
                  loading="lazy"
                  decoding="async"
                  class="absolute inset-0 h-full w-full object-contain p-1"
                  onerror={() => (fotosRotas = { ...fotosRotas, [clave]: true })}
                />
              </div>
            {:else}
              <div class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border border-[#F2C300]/25 bg-[#F2C300]/15">
                <ImageIcon class="h-6 w-6 text-[#F2C300]/80" aria-hidden="true" />
              </div>
            {/if}
            <div class="flex-1">
              {#if elemento.categoria}
                <span class="mb-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground">
                  {elemento.categoria}
                </span>
              {/if}
              {#if elemento.descripcion}
                <h4 class="mb-1 font-semibold text-gray-900">{elemento.descripcion}</h4>
              {/if}
              {#if elemento.cantidad}
                <p class="text-sm text-gray-600">
                  Cantidad: <span class="font-medium">{elemento.cantidad}</span>
                </p>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <p class="italic text-gray-500">No hay elementos especificados para esta oferta.</p>
  {/if}
</ModalDetalle>
