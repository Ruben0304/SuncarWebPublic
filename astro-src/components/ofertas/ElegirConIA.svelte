<script lang="ts">
  import Loader2 from "lucide-svelte/icons/loader-circle";
  import X from "lucide-svelte/icons/x";
  import Markdown from "~/components/ui/Markdown.svelte";
  import { etiquetaVoltaje } from "./voltaje";
  import {
    etiquetaPaneles,
    etiquetaPotenciaBateria,
    etiquetaPotenciaInversor,
    type KitConfigurable,
  } from "@/lib/ofertas/configurador";
  import { formatearPrecio } from "@/lib/ofertas/ofertas-publicas";
  import { recomendadorService } from "@/services/api/recomendadorService";
  import type { RecomendadorData } from "@/types/ofertas";

  // "Elegir con IA": el cliente cuenta qué necesita y el recomendador (el mismo
  // del listado de kits) sugiere entre los kits publicados. Cada sugerencia que
  // también está en el configurador se puede aplicar con un toque, y deja el
  // kit elegido paso a paso.

  const EJEMPLOS = [
    "Que no se apague la nevera ni la TV por la noche",
    "Una casa con aire acondicionado",
    "Lo más económico para empezar",
  ];

  const FILA =
    "flex w-full items-center justify-between gap-4 rounded-[12px] border border-[#86868b] bg-white p-[15px] text-left transition-colors hover:border-[#012928] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#012928]";

  function resumenDe(kit: KitConfigurable): string {
    const c = kit.config;
    return (
      [
        etiquetaPotenciaInversor(c),
        etiquetaPotenciaBateria(c),
        c.paneles > 0 ? etiquetaPaneles(c) : "sin paneles",
      ].join(" + ") + (kit.voltaje ? ` · ${etiquetaVoltaje(kit.voltaje)}` : "")
    );
  }

  interface Props {
    kits: KitConfigurable[];
    moneda: string;
    /** Aplica el kit al configurador. */
    onelegir: (kit: KitConfigurable) => void;
    oncerrar: () => void;
  }
  let { kits, moneda, onelegir, oncerrar }: Props = $props();

  let texto = $state("");
  let cargando = $state(false);
  let error = $state<string | null>(null);
  let resultado = $state.raw<RecomendadorData | null>(null);
  let campo: HTMLTextAreaElement | null = $state(null);

  async function consultar(consulta: string) {
    const limpia = consulta.trim();
    if (!limpia || cargando) return;
    cargando = true;
    error = null;
    const respuesta = await recomendadorService.recomendarOfertas(limpia);
    if (respuesta.success && respuesta.data) {
      resultado = respuesta.data;
    } else {
      resultado = null;
      error = respuesta.message || "No pudimos obtener recomendaciones.";
    }
    cargando = false;
  }

  function enviar(e: SubmitEvent) {
    e.preventDefault();
    void consultar(texto);
  }

  function teclado(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void consultar(texto);
    }
  }

  // El recomendador responde con el id de Mongo; el configurador usa el número.
  const aplicables = $derived(
    (resultado?.ofertas ?? []).flatMap((oferta) => {
      const kit = kits.find((k) => (k.idInterno && k.idInterno === oferta.id) || k.id === oferta.id);
      return kit ? [kit] : [];
    }),
  );
</script>

<section aria-label="Elegir con IA" class="mb-8 rounded-[18px] bg-[#F5F5F7] p-5 sm:p-7">
  <div class="flex items-start justify-between gap-4">
    <h2 class="text-[24px] font-semibold leading-[1.17] tracking-[-0.003em] text-[#012928]">
      Cuéntanos qué necesitas.
      <span class="text-[#86868b]">Te sugerimos los kits que mejor encajan.</span>
    </h2>
    <button
      type="button"
      onclick={oncerrar}
      aria-label="Cerrar"
      class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#e8e8ed] text-[#1d1d1f] transition-colors hover:bg-[#d2d2d7]"
    >
      <X class="h-5 w-5" aria-hidden="true" />
    </button>
  </div>

  <form onsubmit={enviar} class="mt-5 flex flex-col gap-3 sm:flex-row">
    <label for="armar-ia-texto" class="sr-only">Qué necesitas</label>
    <textarea
      id="armar-ia-texto"
      bind:this={campo}
      rows={2}
      bind:value={texto}
      onkeydown={teclado}
      disabled={cargando}
      placeholder="Ej: quiero que no se apague la nevera ni la TV por la noche"
      class="min-h-[56px] w-full flex-1 resize-none rounded-[12px] border border-[#86868b] bg-white p-[15px] text-[17px] leading-[1.3] tracking-[-0.022em] text-[#012928] placeholder:text-[#86868b] focus:border-2 focus:border-[#012928] focus:p-[14px] focus:outline-none disabled:opacity-60"
    ></textarea>
    <button
      type="submit"
      disabled={!texto.trim() || cargando}
      class="rounded-full bg-[#012928] px-6 py-3 text-[17px] tracking-[-0.022em] text-white transition-opacity hover:opacity-90 disabled:opacity-40 sm:self-end"
    >
      Sugerir kits
    </button>
  </form>

  {#if !resultado && !cargando}
    <div class="mt-3 flex flex-wrap gap-2">
      {#each EJEMPLOS as ejemplo (ejemplo)}
        <button
          type="button"
          onclick={() => {
            texto = ejemplo;
            campo?.focus();
          }}
          class="rounded-full border border-[#d2d2d7] bg-white px-4 py-2 text-left text-sm tracking-[-0.016em] text-[#1d1d1f] transition-colors hover:border-[#012928]"
        >
          {ejemplo}
        </button>
      {/each}
    </div>
  {/if}

  {#if cargando}
    <p role="status" class="mt-5 flex items-center gap-2 text-sm tracking-[-0.016em] text-[#6e6e73]">
      <Loader2 class="h-4 w-4 animate-spin" aria-hidden="true" />
      Buscando los kits que mejor encajan…
    </p>
  {/if}

  {#if error}
    <p role="alert" class="mt-5 text-sm leading-[1.43] tracking-[-0.016em] text-[#1d1d1f]">
      {error}
      <button
        type="button"
        onclick={() => void consultar(texto)}
        class="text-[#012928] underline underline-offset-2 hover:no-underline"
      >
        Intentar de nuevo
      </button>
    </p>
  {/if}

  {#if resultado && !cargando}
    <div class="mt-6">
      {#if resultado.texto}
        <Markdown texto={resultado.texto} class="prose prose-sm max-w-none text-[#1d1d1f]" />
      {/if}

      {#if aplicables.length > 0}
        <div class="mt-5 flex flex-col gap-[14px]">
          {#each aplicables as kit (kit.id)}
            <button type="button" onclick={() => onelegir(kit)} class={FILA}>
              <span class="block min-w-0">
                <span class="block text-[17px] leading-[1.24] tracking-[-0.022em] text-[#012928]">
                  {resumenDe(kit)}
                </span>
                <span class="mt-1 hidden text-xs font-semibold leading-[1.33] tracking-[-0.01em] text-[#012928] sm:block">
                  {kit.descripcion}
                </span>
              </span>
              <span class="block flex-shrink-0 text-right text-xs leading-[1.33] tracking-[-0.01em] text-[#012928]">
                <span class="block text-sm font-semibold">
                  {formatearPrecio(kit.precio)} {moneda}
                </span>
                <span class="underline underline-offset-2">Usar este kit</span>
              </span>
            </button>
          {/each}
        </div>
      {:else if (resultado.ofertas ?? []).length > 0}
        <p class="mt-5 text-sm leading-[1.43] tracking-[-0.016em] text-[#6e6e73]">
          Ninguna de esas sugerencias se puede armar aquí. Elige las opciones de abajo o contáctanos y
          te preparamos una configuración.
        </p>
      {/if}
    </div>
  {/if}
</section>
