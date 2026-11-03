<script lang="ts">
  import Building2 from "lucide-svelte/icons/building-2";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import Clock from "lucide-svelte/icons/clock";
  import House from "lucide-svelte/icons/house";
  import SlidersHorizontal from "lucide-svelte/icons/sliders-horizontal";
  import Sparkles from "lucide-svelte/icons/sparkles";
  import { CONSTANTES, DOD, FACTOR_SIMULTANEIDAD } from "@/lib/solar/dimensionamiento";
  import type { EstadoCalculadora } from "./estado.svelte";
  import { input, select, tarjeta } from "./clases";

  let { calc }: { calc: EstadoCalculadora } = $props();

  const esExperto = $derived(calc.esExperto);
  const perfilOn = "border-[#AFEB17] bg-[#AFEB17]/10 text-[#012928]";
  const perfilOff = "border-gray-200 text-gray-600 hover:border-[#AFEB17]/40";
</script>

<!-- Selector de modo -->
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  <div class="inline-flex rounded-full border border-[#AFEB17]/30 bg-white p-1 shadow-sm self-start">
    <button
      type="button"
      onclick={() => (calc.modo = "asistido")}
      class={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
        !esExperto ? "bg-[#012928] text-white" : "text-gray-600 hover:text-[#012928]"
      }`}
    >
      <Sparkles class="h-4 w-4" />
      Modo Asistido
    </button>
    <button
      type="button"
      onclick={() => (calc.modo = "experto")}
      class={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
        esExperto ? "bg-[#012928] text-white" : "text-gray-600 hover:text-[#012928]"
      }`}
    >
      <SlidersHorizontal class="h-4 w-4" />
      Modo Experto
    </button>
  </div>
  <p class="text-sm text-gray-600 max-w-md">
    {esExperto
      ? "Ajusta factores técnicos (simultaneidad, DoD, pérdidas, fases) y ve el detalle en kVA."
      : "Selecciona tus equipos y te decimos qué necesitas, en lenguaje sencillo."}
  </p>
</div>

<!-- Configuración del sistema -->
<div class={`${tarjeta} bg-white border-[#AFEB17]/25`}>
  <div class="p-6 pt-5 sm:pt-6 space-y-5">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- Perfil -->
      <div>
        <span class="text-sm font-semibold text-gray-900">¿Dónde lo vas a instalar?</span>
        <div class="grid grid-cols-2 gap-2 mt-2">
          <button
            type="button"
            onclick={() => (calc.perfil = "hogar")}
            class={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
              calc.perfil === "hogar" ? perfilOn : perfilOff
            }`}
          >
            <House class="h-4 w-4" />
            Mi casa
          </button>
          <button
            type="button"
            onclick={() => (calc.perfil = "empresa")}
            class={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
              calc.perfil === "empresa" ? perfilOn : perfilOff
            }`}
          >
            <Building2 class="h-4 w-4" />
            Mi negocio
          </button>
        </div>
      </div>

      <!-- Autonomía -->
      <div>
        <label for="calc-autonomia" class="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Clock class="h-4 w-4 text-[#012928]" />
          ¿Cuántas horas de respaldo quieres en un apagón?
        </label>
        <div class="mt-3">
          <input
            id="calc-autonomia"
            type="range"
            min="1"
            max="24"
            step="1"
            value={calc.horasAutonomia}
            oninput={(e) => (calc.horasAutonomia = Number(e.currentTarget.value))}
            class="w-full h-2 cursor-pointer accent-[#012928]"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 h</span>
            <span class="font-semibold text-[#012928]">{calc.horasAutonomia} horas</span>
            <span>24 h</span>
          </div>
        </div>
      </div>

      <!-- Tecnología de batería -->
      <div>
        <label for="calc-bateria" class="text-sm font-semibold text-gray-900">Tipo de batería</label>
        <select id="calc-bateria" bind:value={calc.tecnologiaBateria} class={`${select} mt-2`}>
          <option value="litio">Litio (LiFePO4) — recomendada</option>
          <option value="plomo">Plomo-ácido — económica</option>
        </select>
        {#if esExperto}
          <p class="text-xs text-gray-500 mt-1">
            Profundidad de descarga útil (DoD): {(DOD[calc.tecnologiaBateria] * 100).toFixed(0)}%
          </p>
        {/if}
      </div>
    </div>

    <!-- Parámetros avanzados (solo experto) -->
    {#if esExperto}
      <div class="border-t border-[#AFEB17]/20 pt-4">
        <button
          type="button"
          onclick={() => (calc.showAvanzado = !calc.showAvanzado)}
          class="flex items-center gap-2 text-sm font-semibold text-[#012928] hover:opacity-80"
        >
          <SlidersHorizontal class="h-4 w-4" />
          Parámetros avanzados
          <ChevronDown class={`h-4 w-4 transition-transform ${calc.showAvanzado ? "rotate-180" : ""}`} />
        </button>
        {#if calc.showAvanzado}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div>
              <label for="calc-av-sim" class="text-xs text-gray-600">
                Factor de simultaneidad (def. {FACTOR_SIMULTANEIDAD[calc.perfil]})
              </label>
              <input
                id="calc-av-sim"
                type="number"
                step="0.05"
                min="0.1"
                max="1"
                placeholder={String(FACTOR_SIMULTANEIDAD[calc.perfil])}
                value={calc.avanzado.factorSimultaneidad ?? ""}
                oninput={(e) =>
                  (calc.avanzado.factorSimultaneidad =
                    e.currentTarget.value === "" ? null : parseFloat(e.currentTarget.value))}
                class={`${input} mt-1`}
              />
            </div>
            <div>
              <label for="calc-av-hsp" class="text-xs text-gray-600">Horas Sol Pico (HSP)</label>
              <input
                id="calc-av-hsp"
                type="number"
                step="0.1"
                value={calc.avanzado.hsp}
                oninput={(e) => (calc.avanzado.hsp = parseFloat(e.currentTarget.value) || CONSTANTES.HSP)}
                class={`${input} mt-1`}
              />
            </div>
            <div>
              <label for="calc-av-pr" class="text-xs text-gray-600">Performance Ratio (PR)</label>
              <input
                id="calc-av-pr"
                type="number"
                step="0.05"
                value={calc.avanzado.pr}
                oninput={(e) => (calc.avanzado.pr = parseFloat(e.currentTarget.value) || CONSTANTES.PR)}
                class={`${input} mt-1`}
              />
            </div>
            <div>
              <label for="calc-av-fp" class="text-xs text-gray-600">Factor de potencia</label>
              <input
                id="calc-av-fp"
                type="number"
                step="0.05"
                value={calc.avanzado.factorPotencia}
                oninput={(e) =>
                  (calc.avanzado.factorPotencia = parseFloat(e.currentTarget.value) || CONSTANTES.FACTOR_POTENCIA)}
                class={`${input} mt-1`}
              />
            </div>
            <div>
              <label for="calc-av-panel" class="text-xs text-gray-600">Potencia por panel (kWp)</label>
              <input
                id="calc-av-panel"
                type="number"
                step="0.05"
                value={calc.avanzado.potenciaPanelKwp}
                oninput={(e) =>
                  (calc.avanzado.potenciaPanelKwp =
                    parseFloat(e.currentTarget.value) || CONSTANTES.POTENCIA_PANEL_KWP)}
                class={`${input} mt-1`}
              />
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
