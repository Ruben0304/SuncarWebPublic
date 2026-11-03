<script lang="ts">
  import { onMount } from "svelte";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import type { KitConfigurable } from "@/lib/ofertas/configurador";
  import { useContacto } from "~/lib/contacto.svelte";
  import type { OfertaSimplificada } from "@/types/ofertas";
  import { EstadoArmarKit, PASO_INFO, TITULO_GRUPO } from "./estadoArmarKit.svelte";
  import CajaDudas from "./CajaDudas.svelte";
  import Escaparate from "./Escaparate.svelte";
  import FilaOpcion from "./FilaOpcion.svelte";
  import FilaResuelta from "./FilaResuelta.svelte";
  import ChipVoltaje from "./ChipVoltaje.svelte";
  import IconoWhatsApp from "./IconoWhatsApp.svelte";
  import { etiquetaVoltaje } from "./voltaje";
  import ModalElementos from "./ModalElementos.svelte";
  import ModalGarantias from "./ModalGarantias.svelte";

  // "Comprar un kit", con el diseño del configurador de Apple (Mac Studio): foto
  // fija a la izquierda y, a la derecha, un paso a la vez con filas a todo el
  // ancho. Cada paso solo deja elegir lo que existe como kit publicado; lo demás
  // se ve apagado y, al tocarlo, explica con qué cambio sí hay kit.

  interface Props {
    ofertas: OfertaSimplificada[];
    /** Número del kit con el que arranca ya elegido (viene del listado o de un enlace). */
    kitInicial?: string | null;
    onverlistado?: () => void;
  }
  let { ofertas, kitInicial = null, onverlistado }: Props = $props();

  // Amplía el área de toque a ~44 px en móvil sin cambiar el layout.
  const TACTIL =
    "relative before:absolute before:-inset-x-2 before:-inset-y-3 before:content-[''] lg:before:hidden";
  const ENLACE_SUBRAYADO = "text-[#012928] underline underline-offset-2 hover:no-underline";

  const datosContacto = useContacto();
  const estado = new EstadoArmarKit(ofertas, kitInicial, () => datosContacto.contacto.whatsapp);

  let rejilla: HTMLDivElement | null = $state(null);
  let ctaRef: HTMLAnchorElement | null = $state(null);
  let ctaVisible = $state(false);

  const irAlConfigurador = () =>
    requestAnimationFrame(() => rejilla?.scrollIntoView({ behavior: "smooth", block: "start" }));

  // Llegar con un kit ya elegido (desde el listado o un enlace): ir directo al configurador.
  onMount(() => {
    if (!estado.kitDeInicio) return;
    const id = irAlConfigurador();
    return () => cancelAnimationFrame(id);
  });

  // Una sugerencia de la IA deja el configurador en ese kit y lo lleva a la vista.
  function elegirDeIA(kit: KitConfigurable) {
    estado.aplicarKit(kit);
    irAlConfigurador();
  }

  // En móvil, cuando el botón "Solicitar kit" del resumen ya se ve, la barra de
  // abajo repetiría el mismo botón: se oculta. En escritorio no cambia.
  const resumenAbierto = $derived(estado.kit !== null && !estado.editando);
  $effect(() => {
    const boton = ctaRef;
    if (!resumenAbierto || !boton) {
      ctaVisible = false;
      return;
    }
    const observador = new IntersectionObserver(([entrada]) => (ctaVisible = entrada.isIntersecting), {
      rootMargin: "0px 0px -72px 0px",
    });
    observador.observe(boton);
    return () => observador.disconnect();
  });
</script>

<div class="rounded-[28px] bg-white px-4 pb-10 sm:px-8 lg:px-12">
  <!-- Encabezado -->
  <header class="flex flex-col gap-6 pb-8 pt-10 lg:flex-row lg:items-center lg:justify-between lg:pb-[22px] lg:pt-[52px]">
    <div>
      <h1 class="pb-1 text-[32px] font-semibold leading-[1.125] tracking-[.004em] text-[#012928] lg:text-[48px] lg:leading-[1.083] lg:tracking-[-0.003em]">
        Comprar un kit
      </h1>
      <p class="text-[17px] leading-[1.47] tracking-[-0.022em] text-[#6e6e73]">
        (incluye instalación llave en mano)
      </p>
      <p class="mt-3 text-[17px] leading-[1.47] tracking-[-0.022em] text-[#012928]">
        {estado.precioTotal ?? "—"}
      </p>
    </div>
    <button
      type="button"
      onclick={() => (estado.iaAbierta = !estado.iaAbierta)}
      aria-expanded={estado.iaAbierta}
      aria-controls="armar-ia"
      class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#012928] px-8 py-3 text-[17px] font-medium tracking-[-0.022em] text-white transition-colors hover:bg-[#01403d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#012928] sm:w-auto lg:flex-shrink-0"
    >
      Elegir con IA
      <ChevronDown
        class={`h-4 w-4 transition-transform ${estado.iaAbierta ? "rotate-180" : ""}`}
        aria-hidden="true"
      />
    </button>
  </header>

  {#if estado.iaAbierta}
    <div id="armar-ia">
      {#await import("./ElegirConIA.svelte") then { default: ElegirConIA }}
        <ElegirConIA
          kits={estado.kits}
          moneda={estado.moneda}
          onelegir={elegirDeIA}
          oncerrar={() => (estado.iaAbierta = false)}
        />
      {/await}
    </div>
  {/if}

  <div
    bind:this={rejilla}
    class="grid scroll-mt-28 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_328px] lg:gap-14"
  >
    <Escaparate
      kit={estado.referencia}
      seleccion={estado.seleccion}
      indiceVisible={estado.indiceVisible}
      onanterior={estado.indiceMostrable > 0
        ? () => estado.editar(estado.mostrables[estado.indiceMostrable - 1])
        : null}
      onsiguiente={estado.editando ? () => (estado.editando = null) : null}
    />

    <div class="lg:pt-6">
      {#if estado.aviso}
        <div
          role="status"
          class="mb-5 rounded-[12px] bg-[#F5F5F7] p-[15px] text-sm leading-[1.43] tracking-[-0.016em] text-[#1d1d1f]"
        >
          {estado.aviso}
        </div>
      {/if}

      {#each estado.mostrables as paso (paso)}
        {@const resuelto = estado.seleccion[paso] !== null && estado.editando !== paso}
        {@const expandido = estado.editando === paso || (paso === estado.pasoActual && !estado.editando)}
        {#if resuelto || expandido}
          {@const lista = estado.opcionesPorPaso[paso]}
          {@const libres = lista.filter((o) => o.disponible)}
          {@const idTitulo = `armar-${paso}`}
          <section aria-labelledby={idTitulo} class="mb-[58px]">
            <h2
              id={idTitulo}
              class="mb-5 text-[24px] font-semibold leading-[1.17] tracking-[-0.003em] text-[#012928]"
            >
              {PASO_INFO[paso].titulo}
              <span class="text-[#86868b]">{PASO_INFO[paso].subtitulo}</span>
            </h2>

            {#if resuelto}
              <FilaResuelta paso={paso} opcion={estado.elegida(paso)!} oneditar={() => estado.editar(paso)} />
            {:else}
              {#if libres.length === 1 && lista.length > 1}
                <p class="mb-3 text-sm leading-[1.43] tracking-[-0.016em] text-[#6e6e73]">
                  Con tu selección solo hay una opción disponible.
                </p>
              {/if}
              <div role="radiogroup" aria-labelledby={idTitulo} class="flex flex-col gap-[14px]">
                {#each lista as opcion (opcion.clave)}
                  <FilaOpcion
                    {paso}
                    {opcion}
                    elegida={estado.elegida(paso)}
                    seleccionada={estado.seleccion[paso] === opcion.clave}
                    moneda={estado.moneda}
                    onelegir={() => estado.elegir(paso, opcion)}
                  />
                {/each}
              </div>

              {#if estado.explicacion && estado.explicacion.paso === paso}
                <div
                  role="status"
                  class="mt-4 rounded-[12px] bg-[#F5F5F7] p-[15px] text-sm leading-[1.43] tracking-[-0.016em] text-[#1d1d1f]"
                >
                  <p>{estado.explicacion.texto}</p>
                  <div class="mt-3 flex flex-col gap-2">
                    {#each estado.explicacion.lista as alt (alt.texto)}
                      <button
                        type="button"
                        onclick={() => estado.aplicar(alt.seleccion)}
                        class="rounded-[12px] border border-[#86868b] bg-white px-[15px] py-3 text-left transition-colors hover:border-[#012928]"
                      >
                        Cambiar a {alt.texto}
                      </button>
                    {/each}
                  </div>
                </div>
              {/if}

              {#if libres.length > 1}
                <p class="mt-3 text-[13px] leading-[1.33] text-[#6e6e73] lg:text-[12px]">
                  {#if paso !== "paneles" && estado.elegida(paso)}
                    Las diferencias se calculan con el kit más económico de cada opción.
                  {/if}
                </p>
              {/if}

              <CajaDudas
                {paso}
                abierta={estado.dudaAbierta === paso}
                onalternar={() => estado.alternarDuda(paso)}
              />
            {/if}
          </section>
        {/if}
      {/each}

      <!-- Resumen, cuando los tres pasos están resueltos -->
      {#if estado.kit && !estado.editando}
        <section aria-labelledby="armar-resumen" class="mb-6">
          <h2
            id="armar-resumen"
            class="text-[24px] font-semibold leading-[1.17] tracking-[-0.003em] text-[#012928]"
          >
            Tu kit solar te espera.
            <span class="text-[#86868b]">Hazlo tuyo.</span>
          </h2>

          <dl class="mt-5 divide-y divide-[#d2d2d7] border-y border-[#d2d2d7] text-sm tracking-[-0.016em]">
            {#each estado.resumen as { grupo, texto } (grupo)}
              <div class="flex justify-between gap-4 py-3">
                <dt class="text-[#6e6e73]">{TITULO_GRUPO[grupo]}</dt>
                <dd class="text-right font-semibold text-[#012928]">{texto}</dd>
              </div>
            {/each}
            {#if estado.kit?.voltaje}
              <div class="flex items-center justify-between gap-4 py-3">
                <dt id="armar-voltaje" class="text-[#6e6e73]">Voltaje</dt>
                <dd>
                  {#if estado.voltajes.length > 1}
                    <div role="radiogroup" aria-labelledby="armar-voltaje" class="flex rounded-full bg-[#F5F5F7] p-0.5">
                      {#each estado.voltajes as v (v)}
                        <button
                          type="button"
                          role="radio"
                          aria-checked={estado.kit.voltaje === v}
                          onclick={() => (estado.voltajeElegido = v)}
                          class={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                            estado.kit.voltaje === v
                              ? "bg-white text-[#012928] shadow-sm"
                              : "text-[#6e6e73] hover:text-[#012928]"
                          }`}
                        >
                          {etiquetaVoltaje(v)}
                        </button>
                      {/each}
                    </div>
                  {:else}
                    <ChipVoltaje voltaje={estado.kit.voltaje} />
                  {/if}
                </dd>
              </div>
            {/if}
          </dl>

          <p class="mt-5 text-[28px] font-semibold leading-[1.14] tracking-[.007em] text-[#012928]">
            {estado.precioKit}
          </p>
          <p class="mt-1 text-[13px] leading-[1.33] text-[#6e6e73] lg:text-[12px]">
            Precio referencial: puede ajustarse según las características de tu proyecto.
          </p>

          <a
            bind:this={ctaRef}
            href={estado.enlaceSolicitar}
            target="_blank"
            rel="noopener noreferrer"
            class="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#012928] px-6 py-3 text-[17px] font-normal tracking-[-0.022em] text-white transition-opacity hover:opacity-90"
          >
            <IconoWhatsApp class="h-5 w-5" />
            Solicitar kit
          </a>
          <a
            href={estado.enlaceAlternativa}
            target="_blank"
            rel="noopener noreferrer"
            class="mt-3 flex w-full items-center justify-center rounded-full border border-[#012928] px-6 py-3 text-center text-[17px] leading-tight tracking-[-0.022em] text-[#012928] transition-colors hover:bg-[#F5F5F7]"
          >
            Contactar para una configuración alternativa
          </a>
          <p class="mt-3 text-[13px] leading-[1.33] text-[#6e6e73] lg:text-[12px]">
            Son configuraciones por defecto. Si necesitas otra, más específica para tu caso,
            contáctanos.
          </p>

          <div class="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onclick={() => void estado.abrirModal("elementos")}
              class="rounded-full bg-[#F5F5F7] px-4 py-3 text-sm lg:py-2.5 tracking-[-0.016em] text-[#1d1d1f] transition-colors hover:bg-[#e8e8ed]"
            >
              Ver qué trae el kit
            </button>
            <button
              type="button"
              onclick={() => void estado.abrirModal("garantias")}
              class="rounded-full bg-[#F5F5F7] px-4 py-3 text-sm lg:py-2.5 tracking-[-0.016em] text-[#1d1d1f] transition-colors hover:bg-[#e8e8ed]"
            >
              Ver garantías del kit
            </button>
          </div>

          <div class="mt-4 text-sm">
            <button type="button" onclick={() => estado.reiniciar()} class={`${TACTIL} ${ENLACE_SUBRAYADO}`}>
              Empezar de nuevo
            </button>
          </div>
        </section>
      {/if}
    </div>
  </div>

  <!-- Otras formas de elegir, como el "Más formas de comprar" de Apple. -->
  <p class="mt-12 border-t border-[#d2d2d7] pt-6 text-sm leading-[1.43] tracking-[-0.016em] text-[#6e6e73]">
    Más formas de elegir:
    {#if onverlistado}
      <button type="button" onclick={onverlistado} class={`${TACTIL} ${ENLACE_SUBRAYADO}`}>
        ver todos los kits
      </button>
      o
    {/if}
    <a href="/contacto" class={`${TACTIL} max-lg:inline-block ${ENLACE_SUBRAYADO}`}>habla con un asesor</a>.
  </p>

  <!-- Barra de precio que acompaña la pantalla, como la de Apple. -->
  {#if estado.seleccion.inversor}
    <div class={`sticky bottom-0 z-30 -mx-4 mt-8 sm:-mx-8 lg:-mx-12 ${ctaVisible ? "max-lg:hidden" : ""}`}>
      <div class="flex items-center justify-between gap-3 rounded-t-[18px] bg-[#F5F5F7] py-3 pl-4 pr-[84px] shadow-[0_-1px_0_#d2d2d7] sm:px-8 lg:px-12">
        <div class="min-w-0">
          <p class="truncate text-[13px] leading-4 tracking-[-0.01em] text-[#6e6e73] lg:text-xs">
            {estado.textoKit}
          </p>
          <p class="whitespace-nowrap text-[17px] font-semibold tracking-[-0.022em] text-[#012928]">
            {estado.precioTotal}
          </p>
        </div>
        {#if estado.kit}
          <a
            href={estado.enlaceSolicitar}
            target="_blank"
            rel="noopener noreferrer"
            class="flex-shrink-0 rounded-full bg-[#012928] px-4 py-3 text-sm text-white sm:px-5 lg:py-2 transition-opacity hover:opacity-90"
          >
            Solicitar kit
          </a>
        {:else}
          <button
            type="button"
            onclick={() => estado.reiniciar()}
            class={`${TACTIL} flex-shrink-0 text-sm ${ENLACE_SUBRAYADO}`}
          >
            Empezar de nuevo
          </button>
        {/if}
      </div>
    </div>
  {/if}

  {#if estado.kit}
    <ModalElementos
      oferta={estado.detalleDelKit?.oferta ?? null}
      descripcion={estado.kit.descripcion}
      cargando={estado.detalleDelKit?.estado === "cargando"}
      error={estado.detalleDelKit?.estado === "error"}
      abierto={estado.modal === "elementos"}
      oncerrar={() => (estado.modal = null)}
    />
    <ModalGarantias
      oferta={estado.detalleDelKit?.oferta ?? null}
      descripcion={estado.kit.descripcion}
      cargando={estado.detalleDelKit?.estado === "cargando"}
      error={estado.detalleDelKit?.estado === "error"}
      abierto={estado.modal === "garantias"}
      oncerrar={() => (estado.modal = null)}
    />
  {/if}
</div>
