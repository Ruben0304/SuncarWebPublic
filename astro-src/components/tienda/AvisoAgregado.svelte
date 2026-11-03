<script module lang="ts">
  export type Aviso = { tipo: "ok" | "provincia"; texto: string; n: number };
</script>

<script lang="ts">
  // Aviso breve arriba: «Agregado» al meter algo al carrito, o por qué no se pudo.
  import Check from "lucide-svelte/icons/check";
  import MapPin from "lucide-svelte/icons/map-pin";
  import t from "./tienda.module.css";

  let { aviso }: { aviso: Aviso } = $props();
</script>

<div role="status" class="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4">
  {#key aviso.n}
    <div
      class={`${t.entrar} flex w-full max-w-[380px] items-center gap-3 rounded-full bg-[#012928] py-2 pl-2 pr-5 text-white shadow-[0_16px_40px_-12px_rgba(1,41,40,0.6)]`}
    >
      <span
        class={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#012928] ${
          aviso.tipo === "ok" ? "bg-[#AFEB17]" : "bg-[#F2C300]"
        }`}
      >
        {#if aviso.tipo === "ok"}
          <Check class="h-4 w-4" />
        {:else}
          <MapPin class="h-4 w-4" />
        {/if}
      </span>
      <p class="min-w-0 text-[13px] leading-snug">
        {#if aviso.tipo === "ok"}
          <span class="font-semibold">Agregado</span>
          <span class="block truncate text-white/60">{aviso.texto}</span>
        {:else}
          {aviso.texto}
        {/if}
      </p>
    </div>
  {/key}
</div>
