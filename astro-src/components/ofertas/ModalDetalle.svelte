<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import Loader2 from "lucide-svelte/icons/loader-circle";
  import X from "lucide-svelte/icons/x";
  import Modal from "~/components/ui/Modal.svelte";

  // Armazón de los dos modales de la oferta: cabecera fija (que se queda arriba
  // al hacer scroll) y el contenido debajo. Se cierra con la X, con Escape o
  // tocando fuera.
  interface Props {
    abierto: boolean;
    oncerrar: () => void;
    icono: Component<{ class?: string; "aria-hidden"?: "true" }>;
    titulo: string;
    /** Nombre del kit para la cabecera, que se conoce antes que el detalle. */
    descripcion: string;
    cargando?: boolean;
    error?: boolean;
    /** false mientras se pide el detalle (el modal abre ya y muestra "cargando"). */
    hayOferta: boolean;
    children: Snippet;
  }
  let { abierto, oncerrar, icono: Icono, titulo, descripcion, cargando = false, error = false, hayOferta, children }: Props = $props();
</script>

<Modal open={abierto} onclose={oncerrar} label={titulo} class="max-w-2xl" cerrarVisible={false}>
  <div class="sticky top-0 z-[5] border-b border-gray-200 bg-white px-6 pb-4 pt-6 pr-14 text-left">
    <h2 class="flex items-center gap-3 text-xl font-semibold leading-none tracking-tight">
      <Icono class="h-6 w-6 text-[#012928]" aria-hidden="true" />
      {titulo}
    </h2>
    <p class="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{descripcion}</p>
    <button
      type="button"
      onclick={oncerrar}
      aria-label="Cerrar"
      class="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
    >
      <X class="h-4 w-4" />
    </button>
  </div>
  <div class="touch-pan-y overscroll-contain px-6 py-5">
    {#if cargando}
      <p role="status" class="flex items-center gap-2 text-gray-600">
        <Loader2 class="h-4 w-4 animate-spin" aria-hidden="true" />
        Cargando…
      </p>
    {:else if error || !hayOferta}
      <p role="alert" class="text-gray-600">
        No pudimos cargar el detalle del kit. Cierra e inténtalo de nuevo.
      </p>
    {:else}
      {@render children()}
    {/if}
  </div>
</Modal>
