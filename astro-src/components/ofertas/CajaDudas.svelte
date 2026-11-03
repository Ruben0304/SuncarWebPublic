<script lang="ts">
  import CircleMinus from "lucide-svelte/icons/circle-minus";
  import CirclePlus from "lucide-svelte/icons/circle-plus";
  import { AYUDA_PASO, type PasoKit } from "@/lib/ofertas/configurador";
  import { PASO_INFO } from "./estadoArmarKit.svelte";

  interface Props {
    paso: PasoKit;
    abierta: boolean;
    onalternar: () => void;
  }
  let { paso, abierta, onalternar }: Props = $props();

  const Icono = $derived(abierta ? CircleMinus : CirclePlus);
</script>

<div class="mt-5 rounded-[12px] bg-[#F5F5F7]">
  <button
    type="button"
    onclick={onalternar}
    aria-expanded={abierta}
    class="flex w-full items-start justify-between gap-3 p-[15px] text-left"
  >
    <span class="text-sm leading-[1.43] tracking-[-0.016em] text-[#1d1d1f]">
      <span class="block font-semibold">¿No sabes qué {PASO_INFO[paso].nombre} elegir?</span>
      <span class="block">Conoce cómo decidir cuál te conviene.</span>
    </span>
    <Icono class="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1d1d1f]" aria-hidden="true" />
  </button>
  {#if abierta}
    <p class="px-[15px] pb-[15px] text-sm leading-[1.43] tracking-[-0.016em] text-[#6e6e73]">
      {AYUDA_PASO[paso]}
    </p>
  {/if}
</div>
