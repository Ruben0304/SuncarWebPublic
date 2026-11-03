<script lang="ts">
  // Desplegable con buscador (reemplaza Radix Popover + cmdk Command): un
  // botón abre un panel con un campo de búsqueda y el contenido que le pases.
  // Cierra con Escape o al hacer clic fuera. Enter avisa con onenter (para
  // elegir el primer resultado, como hacía cmdk).
  import type { Snippet } from "svelte";
  import Search from "lucide-svelte/icons/search";

  interface Props {
    open?: boolean;
    query?: string;
    /** Contenido del botón que abre el panel. */
    trigger: Snippet;
    /** Contenido del panel; recibe el texto buscado. */
    children: Snippet<[string]>;
    searchPlaceholder?: string;
    /** Clases del botón. */
    triggerClass?: string;
    /** Clases del panel (ancho, etc.). */
    panelClass?: string;
    onenter?: () => void;
  }
  let {
    open = $bindable(false),
    query = $bindable(""),
    trigger,
    children,
    searchPlaceholder = "Buscar...",
    triggerClass = "",
    panelClass = "w-[90vw] sm:w-[600px]",
    onenter,
  }: Props = $props();

  let raiz: HTMLDivElement | undefined = $state();
  let campo: HTMLInputElement | undefined = $state();

  $effect(() => {
    if (!open) return;
    campo?.focus();
    const fuera = (e: PointerEvent) => {
      if (raiz && !raiz.contains(e.target as Node)) open = false;
    };
    const teclado = (e: KeyboardEvent) => {
      if (e.key === "Escape") open = false;
    };
    document.addEventListener("pointerdown", fuera);
    window.addEventListener("keydown", teclado);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      window.removeEventListener("keydown", teclado);
    };
  });
</script>

<div bind:this={raiz} class="relative">
  <button
    type="button"
    role="combobox"
    aria-expanded={open}
    aria-haspopup="listbox"
    class={triggerClass}
    onclick={() => (open = !open)}
  >
    {@render trigger()}
  </button>
  {#if open}
    <div class={`absolute left-0 top-full z-50 mt-1 max-w-[calc(100vw-2rem)] rounded-md border bg-white text-gray-900 shadow-md ${panelClass}`}>
      <div class="flex items-center border-b px-3">
        <Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          bind:this={campo}
          bind:value={query}
          type="text"
          placeholder={searchPlaceholder}
          class="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-gray-500"
          onkeydown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onenter?.();
            }
          }}
        />
      </div>
      <div role="listbox" class="max-h-[300px] overflow-y-auto overflow-x-hidden">
        {@render children(query)}
      </div>
    </div>
  {/if}
</div>
