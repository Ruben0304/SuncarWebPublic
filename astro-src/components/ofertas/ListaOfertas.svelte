<script lang="ts">
  import Percent from "lucide-svelte/icons/percent";
  import Tag from "lucide-svelte/icons/tag";
  import type { EstadoOfertas } from "./ofertas.svelte";
  import TarjetaOferta from "./TarjetaOferta.svelte";

  interface Props {
    estado: EstadoOfertas;
  }
  let { estado }: Props = $props();

  const listas = $derived(estado.listas);
  const recomendando = $derived(estado.showRecommendations && estado.recommendationData !== null);
</script>

{#if recomendando}
  <!-- Vista de Recomendaciones - cuando el usuario usa el recomendador -->
  {#if listas.todas.length > 0}
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      {#each listas.todas as oferta, index (oferta.id || index)}
        <TarjetaOferta
          {oferta}
          variante="recomendada"
          indice={index}
          prioritaria={index === 0}
          isClient={estado.isClient}
          onelegir={(id) => estado.elegirOferta(id)}
        />
      {/each}
    </div>
  {/if}
{:else if listas.todas.length > 0}
  <!-- SECCIÓN 1: Ofertas con Descuentos -->
  {#if listas.conDescuento.length > 0}
    <div class="mb-10 px-4">
      <div class="bg-gradient-to-r from-[#AFEB17]/50 via-red-500 to-pink-500 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
        <div class="absolute inset-0 bg-black/10"></div>
        <div class="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-20 -translate-y-20"></div>
        <div class="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 translate-y-16"></div>

        <div class="relative z-10">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <Percent class="w-8 h-8 text-[#012928]" />
            </div>
          </div>
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            ¡Accede a Nuestras Ofertas con Descuentos!
          </h2>
          <p class="text-lg md:text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow">
            Aprovecha nuestros descuentos exclusivos con reserva previa. ¡Entérate de nuestras
            promociones y reserva ahora!
          </p>
          <a
            href="/contacto"
            class="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-white/30 hover:bg-white/30 transition-all duration-300 cursor-pointer group"
          >
            <Tag class="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
            <span class="text-white font-semibold">Reserva Previa Disponible</span>
          </a>
        </div>
      </div>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      {#each listas.conDescuento as oferta, index (oferta.id || index)}
        <TarjetaOferta
          {oferta}
          variante="descuento"
          indice={index}
          prioritaria={index === 0}
          isClient={estado.isClient}
          onelegir={(id) => estado.elegirOferta(id)}
        />
      {/each}
    </div>
  {/if}

  <!-- SECCIÓN 2: Ofertas Tradicionales (Sin Descuentos) -->
  {#if listas.sinDescuento.length > 0}
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      {#each listas.sinDescuento as oferta, index (oferta.id || index)}
        <TarjetaOferta
          {oferta}
          variante="normal"
          indice={index}
          prioritaria={listas.conDescuento.length === 0 && index === 0}
          isClient={estado.isClient}
          onelegir={(id) => estado.elegirOferta(id)}
        />
      {/each}
    </div>
  {/if}
{/if}
