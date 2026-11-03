<script lang="ts">
  import X from "lucide-svelte/icons/x";

  interface Props {
    mensaje: string;
    oncerrar: () => void;
  }
  let { mensaje, oncerrar }: Props = $props();
</script>

<div class="mb-8 px-4">
  <div class="bg-red-50 border border-[#AFEB17]/20 rounded-2xl p-4 sm:p-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span class="text-red-600 font-bold text-sm">!</span>
      </div>
      <div class="flex-1 w-full">
        <h3 class="font-semibold text-red-800 mb-1 text-sm sm:text-base">Error en recomendaciones</h3>
        <p class="text-xs sm:text-sm text-red-700 leading-relaxed">{mensaje}</p>
      </div>
      <button
        type="button"
        onclick={oncerrar}
        aria-label="Cerrar aviso"
        class="p-1.5 sm:p-2 text-red-400 hover:text-red-600 transition-colors duration-200 self-end sm:self-auto"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
</div>
