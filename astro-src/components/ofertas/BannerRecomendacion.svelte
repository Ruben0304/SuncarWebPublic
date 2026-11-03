<script lang="ts">
  import Star from "lucide-svelte/icons/star";
  import Trophy from "lucide-svelte/icons/trophy";
  import MessageCircle from "lucide-svelte/icons/message-circle";
  import X from "lucide-svelte/icons/x";
  import Markdown from "~/components/ui/Markdown.svelte";

  interface Props {
    texto: string;
    oncerrar: () => void;
  }
  let { texto, oncerrar }: Props = $props();
</script>

<div class="mb-8 px-4">
  <div class="bg-gradient-to-r from-[#AFEB17]/5 via-[#F2C300]/5 to-[#AFEB17]/5 border-2 border-[#AFEB17]/25 rounded-2xl p-4 sm:p-6 shadow-xl">
    <div class="flex flex-col sm:flex-row items-start gap-4">
      <div class="flex-shrink-0">
        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#AFEB17] to-[#F2C300] rounded-full flex items-center justify-center">
          <Star class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
      <div class="flex-1 w-full">
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
          <h3 class="text-base sm:text-lg font-bold text-[#012928]">Resultados de búsqueda</h3>
          <div class="flex items-center gap-1 bg-[#AFEB17]/15 px-2 py-1 rounded-full w-fit">
            <Trophy class="w-3 h-3 text-[#012928]" />
            <span class="text-xs font-medium text-[#012928] hidden sm:inline">Ordenadas por relevancia</span>
            <span class="text-xs font-medium text-[#012928] sm:hidden">Por relevancia</span>
          </div>
        </div>
        <div class="bg-white/70 rounded-lg p-3 sm:p-4 border border-[#AFEB17]/15">
          <div class="flex items-start gap-2">
            <MessageCircle class="w-4 h-4 text-[#012928] mt-0.5 flex-shrink-0" />
            <Markdown
              {texto}
              class="text-gray-700 text-xs sm:text-sm leading-relaxed prose prose-sm max-w-none"
            />
          </div>
        </div>
      </div>
      <button
        type="button"
        onclick={oncerrar}
        aria-label="Cerrar resultados"
        class="flex-shrink-0 p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 self-start sm:self-auto"
      >
        <X class="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  </div>
</div>
