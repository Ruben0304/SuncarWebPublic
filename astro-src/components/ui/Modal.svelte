<script lang="ts">
  // Diálogo modal (reemplaza a Radix Dialog): fondo oscuro, Escape y clic fuera
  // para cerrar, bloquea el scroll del body y se monta en <body> para que
  // ningún contenedor con transform lo recorte.
  import type { Snippet } from "svelte";
  import X from "lucide-svelte/icons/x";
  import { portal } from "~/lib/portal";

  interface Props {
    open: boolean;
    onclose: () => void;
    /** Nombre accesible del diálogo (aria-label). */
    label: string;
    /** Clases del panel: ancho máximo, padding, etc. */
    class?: string;
    /** Muestra la X de cerrar arriba a la derecha. */
    cerrarVisible?: boolean;
    children: Snippet;
  }
  let { open, onclose, label, class: className = "max-w-lg", cerrarVisible = true, children }: Props = $props();

  $effect(() => {
    if (!open) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const teclado = (e: KeyboardEvent) => {
      if (e.key === "Escape") onclose();
    };
    window.addEventListener("keydown", teclado);
    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", teclado);
    };
  });
</script>

{#if open}
  <div use:portal class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <button
      type="button"
      class="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
      aria-label="Cerrar"
      tabindex="-1"
      onclick={onclose}
    ></button>
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      class={`relative w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl ${className}`}
    >
      {#if cerrarVisible}
        <button
          type="button"
          onclick={onclose}
          class="absolute right-3 top-3 z-10 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          aria-label="Cerrar"
        >
          <X class="h-5 w-5" />
        </button>
      {/if}
      {@render children()}
    </div>
  </div>
{/if}
