<script lang="ts">
  import { avisos, quitar } from "~/lib/toast.svelte";

  const color = {
    info: "border-gray-200 bg-white text-gray-900",
    exito: "border-green-200 bg-green-50 text-green-900",
    error: "border-red-200 bg-red-50 text-red-900",
  } as const;
</script>

<div class="pointer-events-none fixed bottom-4 left-1/2 z-[200] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4" aria-live="polite">
  {#each avisos as a (a.id)}
    <button
      type="button"
      onclick={() => quitar(a.id)}
      class={`pointer-events-auto rounded-xl border p-4 text-left shadow-lg ${color[a.tipo]}`}
    >
      <p class="text-sm font-semibold">{a.titulo}</p>
      {#if a.descripcion}<p class="mt-0.5 text-sm opacity-80">{a.descripcion}</p>{/if}
    </button>
  {/each}
</div>
