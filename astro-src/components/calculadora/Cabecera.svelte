<script lang="ts">
  import ArrowLeft from "lucide-svelte/icons/arrow-left";
  import Calculator from "lucide-svelte/icons/calculator";
  import Loader2 from "lucide-svelte/icons/loader-circle";
  import Plus from "lucide-svelte/icons/plus";
  import RotateCcw from "lucide-svelte/icons/rotate-ccw";
  import { imageSrcset, optimizedImage } from "@/lib/image";
  import type { EstadoCalculadora } from "./estado.svelte";
  import { botonBase } from "./clases";

  let { calc }: { calc: EstadoCalculadora } = $props();
</script>

<header class="bg-white border-b border-[#AFEB17]/25 sticky top-0 z-20 shadow-sm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <a
          href="/"
          class="flex items-center gap-2 px-3 py-2 rounded-full border border-[#AFEB17]/25 text-gray-700 hover:bg-[#AFEB17]/5 transition-all duration-300 group flex-shrink-0"
        >
          <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span class="hidden sm:inline text-sm font-semibold">Volver</span>
        </a>
        <a href="/" class="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity">
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#012928]/20 flex-shrink-0 bg-white flex items-center justify-center p-1">
            <img
              src={optimizedImage("/images/logo-icon.png", 96)}
              srcset={imageSrcset("/images/logo-icon.png", [48, 96])}
              sizes="48px"
              width="48"
              height="48"
              alt="Suncar Logo"
              class="w-full h-full object-contain"
            />
          </div>
          <div class="hidden sm:block">
            <h1 class="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calculator class="h-5 w-5 text-[#012928]" />
              Calculadora Solar
            </h1>
          </div>
        </a>
      </div>

      <div class="flex items-center gap-2">
        {#if calc.loadingCategorias}
          <span class="hidden md:flex items-center gap-2 text-sm text-[#012928]">
            <Loader2 class="h-4 w-4 animate-spin" />
            <span>Actualizando</span>
          </span>
        {/if}
        <button
          type="button"
          onclick={calc.restablecerParametros}
          class={`${botonBase} h-9 px-3 flex items-center gap-2 border border-[#AFEB17]/25 bg-white hover:bg-[#AFEB17]/5 hover:border-[#AFEB17]/40`}
          disabled={calc.totalEquipos === 0 && calc.equiposLocales.size === 0}
        >
          <RotateCcw class="h-4 w-4 text-[#012928]" />
          <span class="hidden sm:inline">Limpiar</span>
        </button>
        <button
          type="button"
          onclick={() => (calc.isCreateDialogOpen = true)}
          class={`${botonBase} h-9 px-3 flex items-center gap-2 bg-[#012928] hover:bg-[#011818] text-white`}
        >
          <Plus class="h-4 w-4" />
          <span class="hidden sm:inline">Crear</span>
        </button>
      </div>
    </div>
  </div>
</header>
