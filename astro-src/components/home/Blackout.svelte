<script lang="ts">
  import Zap from "lucide-svelte/icons/zap";
  import ZapOff from "lucide-svelte/icons/zap-off";
  import NightLightsMap from "./NightLightsMap.svelte";

  let lightsOn = $state(false);
  let municipios = $state(0);
  let isAnimating = $state(false);

  function handleToggle() {
    isAnimating = true;
    setTimeout(() => {
      lightsOn = !lightsOn;
      setTimeout(() => (isAnimating = false), 1000);
    }, 200);
  }
</script>

<section class="py-16 lg:py-24 bg-[#012928] relative overflow-hidden">
  <div class="absolute inset-0 transition-opacity duration-1000 pointer-events-none" style={`opacity: ${lightsOn ? 1 : 0}`}>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#F2C300]/50/5 rounded-full blur-3xl"></div>
    <div class="absolute top-0 right-0 w-96 h-96 bg-[#AFEB17]/50/5 rounded-full blur-3xl"></div>
  </div>

  <div class="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
    <div class="text-center mb-10 lg:mb-14">
      <div class="mb-6">
        <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight transition-colors duration-700">
          {#if lightsOn}
            <span class="text-white">Cuba iluminada </span>
            <span class="text-[#F2C300]">con Suncar</span>
          {:else}
            <span class="text-gray-500">Apagón </span>
            <span class="text-gray-600">sin Suncar</span>
          {/if}
        </h2>
      </div>

      <p
        class="text-base lg:text-lg max-w-xl mx-auto leading-relaxed mb-8 transition-colors duration-700"
        style={`color: ${lightsOn ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)"}`}
      >
        {#if lightsOn}
          {municipios > 0 ? municipios + " municipios" : "Municipios"} con energía solar instalada por Suncar brillan en el mapa.
        {:else}
          Sin energía solar, Cuba queda a oscuras. Activa el interruptor y mira el impacto de Suncar.
        {/if}
      </p>

      <div class="flex items-center justify-center gap-4">
        <ZapOff class={`w-5 h-5 transition-all duration-500 ${lightsOn ? "text-gray-700 opacity-30" : "text-gray-400 opacity-100 scale-110"}`} />

        <button
          onclick={handleToggle}
          disabled={isAnimating}
          class="relative group focus:outline-none disabled:cursor-not-allowed"
          aria-label={lightsOn ? "Apagar luces" : "Encender luces"}
        >
          {#if isAnimating && !lightsOn}
            <div class="absolute -inset-4 rounded-full bg-[#F2C300]/20 animate-ping"></div>
          {/if}

          <div
            class="absolute -inset-3 rounded-full transition-all duration-700"
            style={`opacity: ${lightsOn ? 1 : 0}; background: radial-gradient(circle, rgba(251,191,36,0.4) 0%, rgba(251,191,36,0.1) 50%, transparent 70%); filter: blur(8px);`}
          ></div>

          <div
            class={`relative w-20 h-10 rounded-full transition-all duration-700 border-2 ${
              lightsOn
                ? "bg-gradient-to-r from-[#F2C300]/50 to-[#F2C300] border-[#F2C300]/40 shadow-xl shadow-[#AFEB17]/40"
                : "bg-gray-800 border-gray-600 shadow-inner"
            } ${isAnimating ? "scale-105" : "scale-100"}`}
          >
            {#if lightsOn}
              <div class="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            {/if}
            <div
              class={`absolute top-0.5 w-8 h-8 rounded-full transition-all duration-700 flex items-center justify-center ${
                lightsOn ? "left-[calc(100%-2.25rem)] bg-white shadow-2xl shadow-[#AFEB17]/40" : "left-0.5 bg-gray-500 shadow-inner"
              } ${isAnimating ? "scale-110" : "scale-100"}`}
            >
              <Zap class={`w-4 h-4 transition-all duration-700 ${lightsOn ? "text-white0 drop-shadow-glow" : "text-gray-700"} ${isAnimating && !lightsOn ? "animate-pulse" : ""}`} />
            </div>
          </div>
        </button>

        <Zap class={`w-5 h-5 transition-all duration-500 ${lightsOn ? "text-[#F2C300] opacity-100 scale-110 drop-shadow-glow" : "text-gray-700 opacity-30"}`} />
      </div>
    </div>

    <div class="max-w-6xl mx-auto">
      <NightLightsMap {lightsOn} onStatsLoaded={(n) => (municipios = n)} />
    </div>
  </div>
</section>
