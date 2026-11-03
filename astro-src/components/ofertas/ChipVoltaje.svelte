<script lang="ts">
  // El voltaje del kit (110 o 220 V). Los kits publicados antes de que existiera
  // el campo no lo traen: entonces no se pinta nada.
  import Zap from "lucide-svelte/icons/zap";
  import { etiquetaVoltaje } from "./voltaje";

  interface Props {
    voltaje?: number | null;
    class?: string;
  }
  let { voltaje, class: className = "" }: Props = $props();
</script>

{#if voltaje}
  <span
    class={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-[#012928]/15 bg-white px-2.5 py-0.5 text-xs font-semibold tracking-[-0.01em] text-[#012928] ${className}`}
    title={`Kit para instalaciones de ${etiquetaVoltaje(voltaje)}`}
  >
    <Zap class="h-3.5 w-3.5 fill-[#F2C300] text-[#F2C300]" aria-hidden="true" />
    {etiquetaVoltaje(voltaje)}
  </span>
{/if}
