<script lang="ts">
  import { createTypewriter } from "./typewriter.svelte.ts";
  import SolarHouseModel from "./SolarHouseModel.svelte";

  // No hace falta un "LoadingProvider": en React era contexto compartido
  // entre islas; acá todo vive en este mismo componente.
  let isLoadingComplete = $state(true);

  const headlineLead = createTypewriter(() => ({
    text: "Energía",
    speed: 120,
    delay: 300,
    waitForLoading: true,
    isLoadingComplete,
  }));

  const headlineAccent = createTypewriter(() => ({
    text: "que transforma.",
    speed: 120,
    delay: headlineLead.isComplete ? 200 : 999999,
    waitForLoading: false,
    isLoadingComplete: true,
  }));
</script>

<section class="relative min-h-screen flex items-center px-4 py-24 md:px-6 lg:px-8 lg:py-0 [overflow-x:clip] z-10 bg-[#F2F2EF]">
  <div class="container mx-auto">
    <div class="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
      <div class="space-y-6 lg:space-y-10 relative z-20">
        <div class="space-y-3 lg:space-y-4 relative">
          <h1 class="text-[clamp(2.25rem,11vw,3rem)] sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-7xl 2xl:text-[5.25rem] font-bold text-[#012928] leading-[1.1] sm:leading-loose">
            <span class="inline-block min-h-[1.2em]">
              {headlineLead.displayText}{#if !headlineLead.isComplete}<span class="animate-pulse">|</span>{/if}
            </span>
            <span class="block bg-secondary-gradient bg-clip-text text-transparent pb-2 min-h-[1.2em]">
              {headlineAccent.displayText}{#if !headlineAccent.isComplete}<span class="animate-pulse text-[#012928]">|</span>{/if}
            </span>
          </h1>
          <p
            class="text-base sm:text-lg md:text-xl lg:text-2xl text-[#012928]/70 leading-relaxed max-w-lg lg:max-w-2xl opacity-0"
            style="animation: subtle-fade-in 0.8s ease-out 0.7s forwards;"
          >
            Transforma tu hogar o negocio con energía limpia y renovable con nuestros sistemas de paneles solares y
            baterías de última generación.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 lg:gap-4 opacity-0" style="animation: subtle-fade-in 0.8s ease-out 0.9s forwards;">
          <a
            href="/ofertas"
            class="px-5 py-2.5 lg:px-7 lg:py-3.5 bg-[#012928] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm lg:text-lg"
          >
            Kits de instalación
          </a>
          <a
            href="/productos"
            class="px-5 py-2.5 lg:px-7 lg:py-3.5 border-2 border-[#012928] text-[#012928] bg-transparent font-semibold rounded-lg hover:bg-[#012928] hover:text-white transition-all duration-300 text-sm lg:text-lg"
          >
            Productos
          </a>
        </div>
      </div>

      <div class="relative z-10 opacity-0" style="animation: subtle-fade-in 0.8s ease-out 0.4s forwards;">
        <SolarHouseModel />
      </div>
    </div>
  </div>

  <div class="hidden md:block absolute top-20 left-10 w-2 h-2 bg-secondary-gradient rounded-full animate-bounce animation-delay-1000"></div>
  <div class="hidden md:block absolute top-40 right-20 w-3 h-3 bg-primary/30 rounded-full animate-bounce animation-delay-1200"></div>
  <div class="hidden md:block absolute bottom-40 left-20 w-1 h-1 bg-secondary-gradient rounded-full animate-bounce animation-delay-800"></div>
</section>
