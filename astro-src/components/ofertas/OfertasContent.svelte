<script lang="ts">
  import { onMount } from "svelte";
  import ChevronLeft from "lucide-svelte/icons/chevron-left";
  import Eye from "lucide-svelte/icons/eye";
  import Loader2 from "lucide-svelte/icons/loader-circle";
  import Phone from "lucide-svelte/icons/phone";
  import ArrowRight from "lucide-svelte/icons/arrow-right";
  import Star from "lucide-svelte/icons/star";
  import ArmarKit from "./ArmarKit.svelte";
  import BannerRecomendacion from "./BannerRecomendacion.svelte";
  import ErrorRecomendacion from "./ErrorRecomendacion.svelte";
  import ListaOfertas from "./ListaOfertas.svelte";
  import NotasLegales from "./NotasLegales.svelte";
  import OfertasPrincipales from "./OfertasPrincipales.svelte";
  import RecomendacionInput from "./RecomendacionInput.svelte";
  import { EstadoOfertas, type PropsOfertas } from "./ofertas.svelte";

  let props: PropsOfertas = $props();
  const estado = new EstadoOfertas(props);

  onMount(() => {
    estado.iniciarEnNavegador();

    // El navegador no debe restaurar el scroll solo: al cambiar entre el
    // configurador y el listado la página se coloca arriba a mano.
    if (!("scrollRestoration" in window.history)) return;
    const previo = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previo;
    };
  });

  const mostrandoContenido = $derived(!estado.loading && !estado.error);
</script>

<div class="min-h-screen bg-[#F2F2EF] pt-32 pb-16">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Configurador: es la entrada; el listado se abre desde su pie -->
    {#if mostrandoContenido && estado.enArmar}
      <!-- Los kits con etiqueta («Más vendida», «Del momento»…), pasando solos encima del configurador -->
      <OfertasPrincipales ofertas={estado.ofertas} onelegir={(id) => estado.elegirOferta(id)} />
      {#key estado.kitElegido ?? "nuevo"}
        <ArmarKit
          ofertas={estado.ofertas}
          kitInicial={estado.kitElegido}
          onverlistado={() => estado.cambiarModo("lista")}
        />
      {/key}
    {/if}

    <!-- Volver al configurador desde el listado -->
    {#if mostrandoContenido && estado.enLista && estado.puedeArmar}
      <div class="mx-auto mb-6 max-w-6xl px-4">
        <button
          type="button"
          onclick={() => estado.volverAArmar()}
          class="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#012928] shadow-sm transition-colors hover:bg-[#F5F5F7]"
        >
          <ChevronLeft class="h-4 w-4" aria-hidden="true" />
          Comprar un kit
        </button>
      </div>
    {/if}

    <!-- AI Recommendation Input -->
    {#if mostrandoContenido && estado.enLista && estado.ofertas.length > 0}
      <RecomendacionInput
        onsearch={estado.handleRecommendationSearch}
        loading={estado.isRecommendationLoading}
        disabled={estado.loading}
      />
    {/if}

    <!-- Recommendation Results Banner -->
    {#if estado.enLista && estado.showRecommendations && estado.recommendationData}
      <BannerRecomendacion
        texto={estado.recommendationData.texto}
        oncerrar={() => estado.clearRecommendations()}
      />
    {/if}

    <!-- Recommendation Error -->
    {#if estado.enLista && estado.recommendationError}
      <ErrorRecomendacion
        mensaje={estado.recommendationError}
        oncerrar={() => (estado.recommendationError = null)}
      />
    {/if}

    <!-- Loading State -->
    {#if estado.loading}
      <div class="flex items-center justify-center py-12 md:py-16 px-4">
        <div class="text-center">
          <Loader2 class="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-[#012928] mx-auto mb-4" />
          <p class="text-sm sm:text-base text-gray-600">Cargando ofertas...</p>
        </div>
      </div>
    {/if}

    <!-- Error State -->
    {#if estado.error}
      <div class="text-center py-12 md:py-16 px-4">
        <div class="max-w-md mx-auto rounded-lg border bg-card text-card-foreground shadow-lg">
          <div class="p-6 sm:p-8">
            <div class="text-red-500 mb-4">
              <Star class="w-10 h-10 sm:w-12 sm:h-12 mx-auto" />
            </div>
            <h3 class="text-base sm:text-lg font-semibold text-[#012928] mb-2">Error al cargar ofertas</h3>
            <p class="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">{estado.error}</p>
            <button
              type="button"
              onclick={estado.fetchOfertas}
              class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-[#012928] px-4 sm:px-6 py-2 text-sm sm:text-base font-medium text-white transition-colors hover:opacity-90"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Listado de kits (con descuentos aparte) o resultados del recomendador -->
    {#if mostrandoContenido && estado.enLista}
      <ListaOfertas {estado} />
    {/if}

    <!-- Condiciones al pie, con el estilo de las notas de Apple -->
    {#if mostrandoContenido && estado.listas.todas.length > 0}
      <NotasLegales />
    {/if}

    <!-- Empty State -->
    {#if mostrandoContenido && estado.ofertas.length === 0}
      <div class="text-center py-12 md:py-16 px-4">
        <div class="max-w-md mx-auto rounded-lg border bg-card text-card-foreground shadow-lg">
          <div class="p-6 sm:p-8">
            <div class="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4 flex items-center justify-center">
              <Eye class="w-12 h-12 sm:w-16 sm:h-16" />
            </div>
            <h3 class="text-base sm:text-lg font-semibold text-[#012928] mb-2">No hay ofertas disponibles</h3>
            <p class="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
              En este momento no tenemos ofertas disponibles. Vuelve pronto para ver nuestras nuevas
              opciones.
            </p>
            <a
              href="/servicios"
              class="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#012928] px-4 sm:px-6 py-2 text-sm sm:text-base font-medium text-white transition-colors hover:opacity-90"
            >
              <ArrowRight class="w-4 h-4 mr-2" />
              Ver Servicios
            </a>
          </div>
        </div>
      </div>
    {/if}

    <!-- Contact CTA -->
    <div class="rounded-lg border bg-[#012928] text-white text-center shadow-xl">
      <div class="py-12">
        <Phone class="w-12 h-12 mx-auto mb-6" />
        <h3 class="text-2xl font-bold mb-3">¿Interesado en alguna oferta?</h3>
        <p class="text-white/90 mb-8 max-w-lg mx-auto">
          Contacta a nuestro equipo de especialistas para obtener más información y asesoramiento
          personalizado
        </p>
        <a
          href="/contacto"
          class="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-white px-8 py-3 text-sm font-semibold text-[#AFEB17] transition-colors hover:bg-gray-100"
        >
          <Phone class="w-4 h-4 mr-2" />
          Contactar Ahora
        </a>
      </div>
    </div>
  </div>
</div>
