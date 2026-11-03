<script lang="ts">
  import Eye from "lucide-svelte/icons/eye";
  import Percent from "lucide-svelte/icons/percent";
  import { formatearPrecio } from "@/lib/ofertas/ofertas-publicas";
  import type { OfertaSimplificada } from "@/types/ofertas";
  import { atributosImagen } from "./imagen";

  interface Props {
    oferta: OfertaSimplificada;
    /** Con descuento, normal o resultado del recomendador (con su posición). */
    variante: "descuento" | "normal" | "recomendada";
    indice: number;
    /** La primera imagen visible se pide con prioridad. */
    prioritaria?: boolean;
    isClient: boolean;
    onelegir: (id?: string | null) => void;
  }
  let { oferta, variante, indice, prioritaria = false, isClient, onelegir }: Props = $props();

  const formatCurrency = (moneda: string) => moneda.toUpperCase();

  const imagen = $derived(
    atributosImagen(oferta.imagen || "/placeholder.svg", {
      rellena: true,
      sizes: "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
      quality: 70,
    }),
  );
  const precio = $derived(isClient && oferta.precio_cliente ? oferta.precio_cliente : oferta.precio);

  const AGOTADA_BASE =
    "inline-flex items-center rounded-full border-2 border-white bg-gray-600 text-sm font-bold text-white shadow-xl";

  function alTeclear(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onelegir(oferta.id);
    }
  }
</script>

<div
  class={`group bg-white border border-gray-200 rounded-xl ${
    variante === "descuento" ? "shadow-lg hover:shadow-2xl" : "shadow-sm hover:shadow-xl"
  } transition-all duration-300 hover:-translate-y-2 overflow-hidden h-full flex flex-col cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#012928] focus-visible:ring-offset-2`}
  role={oferta.id ? "link" : undefined}
  tabindex={oferta.id ? 0 : -1}
  aria-label={oferta.id ? `Elegir el kit ${oferta.descripcion}` : undefined}
  onclick={() => onelegir(oferta.id)}
  onkeydown={alTeclear}
>
  <div class="relative overflow-hidden aspect-square">
    <img
      src={imagen.src}
      srcset={imagen.srcset}
      sizes={imagen.sizes}
      alt={oferta.descripcion}
      loading={prioritaria ? "eager" : "lazy"}
      decoding="async"
      fetchpriority={prioritaria ? "high" : "auto"}
      class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

    {#if variante === "descuento"}
      <div class="absolute top-4 left-4 flex flex-col gap-2">
        {#if oferta.is_active === false}
          <div class={`${AGOTADA_BASE} px-4 py-2`}>AGOTADA</div>
        {/if}
        <div class="inline-flex items-center gap-2 rounded-full border-2 border-white bg-gradient-to-r from-[#AFEB17]/50 to-red-500 px-4 py-2 text-sm font-bold text-white shadow-xl">
          <Percent class="w-4 h-4" />
          DESCUENTO
        </div>
      </div>
    {:else if variante === "normal"}
      <div class="absolute top-4 left-4">
        {#if oferta.is_active === false}
          <div class={`${AGOTADA_BASE} px-3 py-1`}>AGOTADA</div>
        {:else}
          <div class="inline-flex items-center rounded-full border-2 border-white bg-[#012928] px-5 py-2.5 text-lg font-bold text-white shadow-xl">
            {oferta.potenciaInversor ?? "OFERTA"}
          </div>
        {/if}
      </div>
    {:else}
      <div class="absolute top-4 left-4 flex flex-col gap-2">
        {#if oferta.is_active === false}
          <div class={`${AGOTADA_BASE} px-3 py-1`}>AGOTADA</div>
        {/if}
        {#if indice === 0 && oferta.is_active !== false}
          <div class="inline-flex items-center rounded-full border border-transparent bg-gradient-to-r from-[#AFEB17] to-[#F2C300] px-3 py-1 text-sm font-medium text-white shadow-lg">
            Más recomendada
          </div>
        {/if}
      </div>

      <div class="absolute top-4 right-4">
        <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#AFEB17] to-[#F2C300] rounded-full shadow-lg border-2 border-white">
          <span class="text-white font-bold text-lg">#{indice + 1}</span>
        </div>
      </div>
    {/if}
  </div>

  <div class="p-6 flex flex-col">
    <h3 class="text-lg font-bold text-[#012928] mb-3 leading-snug break-words">
      {oferta.descripcion}
    </h3>

    <div class="mb-6 flex-1">
      <div class="space-y-3">
        <div class="text-3xl font-bold text-[#F2C300]">
          {formatearPrecio(precio)} {formatCurrency(oferta.moneda)}
        </div>

        {#if isClient && oferta.precio_cliente}
          <div class="text-sm text-gray-500 line-through">
            Precio original: {formatearPrecio(oferta.precio)} {formatCurrency(oferta.moneda)}
          </div>
        {/if}
      </div>
    </div>

    <div
      aria-hidden="true"
      class="inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#012928] px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 group-hover:shadow-lg pointer-events-none"
    >
      <Eye class="w-4 h-4 mr-2" />
      Elegir este kit
    </div>
  </div>
</div>
