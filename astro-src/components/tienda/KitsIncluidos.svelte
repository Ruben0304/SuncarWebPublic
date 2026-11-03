<script lang="ts">
  // Los kits cargan muchas imágenes: solo se montan cuando el cliente los pide.
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import TarjetaKit from "./TarjetaKit.svelte";
  import t from "./tienda.module.css";
  import type { OfertaSimplificada } from "@/types/ofertas";

  interface Props {
    kits: OfertaSimplificada[];
    hayProductos: boolean;
  }
  let { kits, hayProductos }: Props = $props();

  let visibles = $state(false);
</script>

{#if !visibles}
  <button
    type="button"
    onclick={() => (visibles = true)}
    class="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#012928] ring-1 ring-[#012928]/[0.08] transition-transform active:scale-[0.98]"
  >
    Ver kits donde está incluido ({kits.length})
    <ChevronDown class="h-4 w-4" />
  </button>
{:else}
  <div class="mt-8">
    <h3 class="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
      Incluido en estos kits con instalación
    </h3>
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {#each kits as k, i (k.id ?? i)}
        <TarjetaKit
          kit={k}
          class={t.entrar}
          style={`animation-delay: ${(Math.min(i, 8) + (hayProductos ? 3 : 0)) * 45}ms`}
        />
      {/each}
    </div>
  </div>
{/if}
