<script lang="ts">
  import Search from "lucide-svelte/icons/search";
  import Loader2 from "lucide-svelte/icons/loader-circle";
  import X from "lucide-svelte/icons/x";
  import Zap from "lucide-svelte/icons/zap";
  import Brain from "lucide-svelte/icons/brain";
  import ShoppingCart from "lucide-svelte/icons/shopping-cart";
  import BarChart3 from "lucide-svelte/icons/chart-column";
  import Award from "lucide-svelte/icons/award";
  import Sparkles from "lucide-svelte/icons/sparkles";
  import Check from "lucide-svelte/icons/check";

  interface Props {
    onsearch: (query: string) => Promise<void>;
    loading?: boolean;
    disabled?: boolean;
    placeholder?: string;
  }
  let {
    onsearch,
    loading = false,
    disabled = false,
    placeholder = "Ej: 'Necesito paneles solares para una casa de 3 habitaciones con bajo consumo' o 'Busco un sistema económico y confiable'...",
  }: Props = $props();

  const LOADING_MESSAGES = [
    { text: "Analizando tus necesidades energéticas", icon: Brain },
    { text: "Explorando nuestro catálogo de ofertas", icon: ShoppingCart },
    { text: "Comparando precios y características", icon: BarChart3 },
    { text: "Evaluando las mejores opciones para ti", icon: Award },
    { text: "Calculando la mejor relación calidad-precio", icon: Sparkles },
    { text: "Preparando tus recomendaciones personalizadas", icon: Check },
  ];

  let query = $state("");
  let isExpanded = $state(false);
  let currentMessageIndex = $state(0);
  let inputRef: HTMLInputElement | null = $state(null);

  // Rota los mensajes de carga cada 3 segundos
  $effect(() => {
    if (!loading) {
      currentMessageIndex = 0;
      return;
    }
    const interval = setInterval(() => {
      currentMessageIndex = (currentMessageIndex + 1) % LOADING_MESSAGES.length;
    }, 3000);
    return () => clearInterval(interval);
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (query.trim() && !loading && !disabled) {
      await onsearch(query.trim());
    }
  }

  function clearSearch() {
    query = "";
    isExpanded = false;
    inputRef?.focus();
  }

  const currentMessage = $derived(LOADING_MESSAGES[currentMessageIndex]);
  const CurrentIcon = $derived(currentMessage.icon);
</script>

<div class="w-full max-w-6xl mx-auto mb-8 md:mb-12 px-4">
  <!-- Search Header -->
  <div class="mb-6 md:mb-8 text-center">
    <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#012928] leading-tight mb-3">
      Encuentra Tu Oferta Perfecta
    </h1>
    <p class="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-2">
      Cuéntanos qué necesitas y nuestra IA te recomendará las mejores opciones
    </p>
    <div class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-[#AFEB17]/5 px-4 py-2 rounded-full border border-blue-200">
      <Zap class="w-4 h-4 text-[#012928]" />
      <span class="text-sm font-medium text-[#012928]">Búsqueda inteligente con IA</span>
    </div>
  </div>

  {#if loading}
    <!-- Loading State - Componente transformado -->
    <div class="relative">
      <div class="relative bg-gradient-to-r from-[#AFEB17]/5 via-[#F2C300]/5 to-[#AFEB17]/5 rounded-2xl border-2 border-[#AFEB17]/40 shadow-2xl overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>

        <div class="absolute top-0 left-0 right-0 h-1 bg-[#AFEB17]/15">
          <div class="h-full bg-gradient-to-r from-[#AFEB17] to-[#F2C300] animate-progress"></div>
        </div>

        <div class="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 md:p-8">
          <div class="flex-shrink-0">
            <div class="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20">
              <div class="absolute inset-0 rounded-full bg-gradient-to-r from-[#AFEB17] to-[#F2C300] animate-ping opacity-20"></div>
              <div class="absolute inset-0 rounded-full bg-gradient-to-r from-[#AFEB17] to-[#F2C300] animate-pulse opacity-30"></div>

              <div class="relative flex items-center justify-center w-full h-full rounded-full bg-gradient-to-r from-[#AFEB17] to-[#F2C300] shadow-lg">
                {#key currentMessageIndex}
                  <CurrentIcon class="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white animate-fade-in" />
                {/key}
              </div>

              <div class="absolute -inset-2 sm:-inset-3">
                <Loader2 class="w-full h-full text-[#AFEB17] animate-spin opacity-30" />
              </div>
            </div>
          </div>

          <div class="flex-1 text-center sm:text-left w-full">
            <div class="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <div class="flex gap-1">
                <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#AFEB17]/50 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#AFEB17]/50 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#AFEB17]/50 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
              </div>
              <span class="text-xs sm:text-sm font-semibold text-[#012928] uppercase tracking-wider">
                Procesando
              </span>
            </div>

            {#key currentMessageIndex}
              <h3 class="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#012928] mb-1 animate-fade-in px-2 sm:px-0">
                {currentMessage.text}
              </h3>
            {/key}

            <p class="text-xs sm:text-sm text-gray-600">Esto solo tomará unos momentos...</p>

            <div class="flex justify-center sm:justify-start gap-1.5 sm:gap-2 mt-3">
              {#each LOADING_MESSAGES as mensaje, index (mensaje.text)}
                <div
                  class={`h-1 sm:h-1.5 rounded-full transition-all duration-500 ${
                    index === currentMessageIndex
                      ? "w-6 sm:w-8 bg-gradient-to-r from-[#AFEB17] to-[#F2C300]"
                      : "w-1 sm:w-1.5 bg-[#AFEB17]/20"
                  }`}
                ></div>
              {/each}
            </div>
          </div>

          <div class="absolute top-2 right-2 hidden sm:block">
            <Sparkles class="w-3 h-3 sm:w-4 sm:h-4 text-[#AFEB17] animate-pulse" />
          </div>
          <div class="absolute bottom-2 left-2 hidden sm:block">
            <Sparkles class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400 animate-pulse" style="animation-delay: 500ms" />
          </div>
        </div>
      </div>
    </div>
  {:else}
    <!-- Search Container - Estado normal -->
    <div class="relative">
      <form onsubmit={handleSubmit}>
        <div
          class={`relative bg-white rounded-2xl border-2 transition-all duration-500 shadow-lg hover:shadow-xl ${
            isExpanded ? "border-[#AFEB17]/40 shadow-[#AFEB17]/15" : "border-gray-200 hover:border-[#AFEB17]/25"
          }`}
        >
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-6">
            <div class="flex-shrink-0 hidden sm:block">
              <div
                class={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-300 ${
                  isExpanded ? "bg-gradient-to-r from-[#AFEB17] to-[#F2C300] scale-110" : "bg-gray-100"
                }`}
              >
                <Search
                  class={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${isExpanded ? "text-white" : "text-gray-400"}`}
                />
              </div>
            </div>

            <div class="flex-1 w-full relative">
              <div class="flex items-center">
                <div class="flex-shrink-0 mr-3 sm:hidden">
                  <div
                    class={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                      isExpanded ? "bg-gradient-to-r from-[#AFEB17] to-[#F2C300]" : "bg-gray-100"
                    }`}
                  >
                    <Search
                      class={`w-4 h-4 transition-colors duration-300 ${isExpanded ? "text-white" : "text-gray-400"}`}
                    />
                  </div>
                </div>

                <input
                  bind:this={inputRef}
                  type="text"
                  bind:value={query}
                  onfocus={() => (isExpanded = true)}
                  onblur={() => {
                    if (!query.trim()) isExpanded = false;
                  }}
                  {placeholder}
                  {disabled}
                  class="flex-1 text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none resize-none disabled:opacity-50 leading-relaxed"
                />

                {#if query}
                  <button
                    type="button"
                    onclick={clearSearch}
                    aria-label="Borrar búsqueda"
                    class="flex-shrink-0 p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X class="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                {/if}
              </div>
            </div>

            <button
              type="submit"
              disabled={!query.trim() || disabled}
              class="inline-flex h-10 w-full sm:w-auto items-center justify-center whitespace-nowrap px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#012928] to-[#AFEB17] hover:from-[#0D2555] hover:to-[#E5551A] text-white font-semibold text-sm sm:text-base rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:pointer-events-none shadow-lg hover:shadow-xl"
            >
              <Sparkles class="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Buscar con IA
            </button>
          </div>
        </div>
      </form>
    </div>
  {/if}
</div>
