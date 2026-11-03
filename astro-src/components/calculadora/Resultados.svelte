<script lang="ts">
  import Battery from "lucide-svelte/icons/battery";
  import Cpu from "lucide-svelte/icons/cpu";
  import Info from "lucide-svelte/icons/info";
  import Sun from "lucide-svelte/icons/sun";
  import Zap from "lucide-svelte/icons/zap";
  import { CONSTANTES, DOD, FACTOR_SIMULTANEIDAD } from "@/lib/solar/dimensionamiento";
  import { fmt, type EstadoCalculadora } from "./estado.svelte";
  import { tarjeta } from "./clases";

  let { calc }: { calc: EstadoCalculadora } = $props();

  const esExperto = $derived(calc.esExperto);
  const resultado = $derived(calc.resultado);
  const parametros = $derived(calc.parametros);
  const factorSimAplicado = $derived(parametros.factorSimultaneidad ?? FACTOR_SIMULTANEIDAD[calc.perfil]);
</script>

{#if calc.tieneEquipos}
  <div>
    <h2 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
      <Sun class="h-5 w-5 text-[#F2C300]" />
      Tu sistema solar recomendado
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Inversor -->
      <div class={`${tarjeta} border-[#AFEB17]/25 overflow-hidden`}>
        <div class="bg-[#012928] px-4 py-3 flex items-center gap-2">
          <Cpu class="h-5 w-5 text-[#AFEB17]" />
          <span class="font-semibold text-white">Inversor</span>
        </div>
        <div class="p-6 pt-4 space-y-2">
          <p class="text-3xl font-bold text-[#012928]">
            {fmt(esExperto ? resultado.inversorKva : resultado.inversorKw, 1)}{" "}
            <span class="text-lg font-semibold text-gray-500">{esExperto ? "kVA" : "kW"}</span>
          </p>
          {#if esExperto}
            <div class="text-xs text-gray-600 space-y-1">
              <p>Potencia continua: <b>{fmt(resultado.potenciaContinuaKw)} kW</b></p>
              <p>Pico de arranque: <b>{fmt(resultado.potenciaPicoKw)} kW</b></p>
              <p>Potencia instalada: {fmt(resultado.potenciaInstaladaKw)} kW</p>
              <p>Simultaneidad: {factorSimAplicado} · FP: {parametros.factorPotencia ?? CONSTANTES.FACTOR_POTENCIA}</p>
            </div>
          {:else}
            <p class="text-sm text-gray-600">
              Capaz de mover tus equipos a la vez, con margen para el arranque de motores.
            </p>
          {/if}
        </div>
      </div>

      <!-- Baterías -->
      <div class={`${tarjeta} border-[#AFEB17]/25 overflow-hidden`}>
        <div class="bg-[#012928] px-4 py-3 flex items-center gap-2">
          <Battery class="h-5 w-5 text-[#AFEB17]" />
          <span class="font-semibold text-white">Baterías</span>
        </div>
        <div class="p-6 pt-4 space-y-2">
          <p class="text-3xl font-bold text-[#012928]">
            {fmt(resultado.bateriaBancoKwh)} <span class="text-lg font-semibold text-gray-500">kWh</span>
          </p>
          {#if esExperto}
            <div class="text-xs text-gray-600 space-y-1">
              <p>Energía útil requerida: <b>{fmt(resultado.bateriaUtilKwh)} kWh</b></p>
              <p>
                Tecnología: {calc.tecnologiaBateria === "litio" ? "Litio" : "Plomo-ácido"} (DoD {(
                  DOD[calc.tecnologiaBateria] * 100
                ).toFixed(0)}%)
              </p>
              <p>Incluye pérdidas de batería e inversor.</p>
            </div>
          {:else}
            <p class="text-sm text-gray-600">
              Para mantener tus equipos encendidos ~{calc.horasAutonomia} h durante un apagón.
            </p>
          {/if}
        </div>
      </div>

      <!-- Paneles -->
      <div class={`${tarjeta} border-[#AFEB17]/25 overflow-hidden`}>
        <div class="bg-[#012928] px-4 py-3 flex items-center gap-2">
          <Sun class="h-5 w-5 text-[#AFEB17]" />
          <span class="font-semibold text-white">Paneles solares</span>
        </div>
        <div class="p-6 pt-4 space-y-2">
          <p class="text-3xl font-bold text-[#012928]">
            {resultado.numeroPaneles} <span class="text-lg font-semibold text-gray-500">paneles</span>
          </p>
          {#if esExperto}
            <div class="text-xs text-gray-600 space-y-1">
              <p>Potencia del campo: <b>{fmt(resultado.panelesKwp)} kWp</b></p>
              <p>Consumo diario: {fmt(resultado.energiaDiaKwh)} kWh/día</p>
              <p>HSP: {parametros.hsp ?? CONSTANTES.HSP} · PR: {parametros.pr ?? CONSTANTES.PR}</p>
            </div>
          {:else}
            <p class="text-sm text-gray-600">
              ~{fmt(resultado.panelesKwp)} kWp para generar tu consumo de {fmt(resultado.energiaDiaKwh)} kWh al día.
            </p>
          {/if}
        </div>
      </div>
    </div>

    <!-- Resumen de consumo -->
    <div class={`${tarjeta} mt-4 border-[#AFEB17]/25 bg-gradient-to-br from-[#AFEB17]/5 to-[#F2C300]/5`}>
      <div class="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p class="text-xs text-gray-600">Equipos</p>
          <p class="text-xl font-bold text-gray-900">{calc.totalEquipos}</p>
        </div>
        <div>
          <p class="text-xs text-gray-600">Potencia instalada</p>
          <p class="text-xl font-bold text-gray-900 flex items-center gap-1">
            <Cpu class="h-4 w-4 text-[#012928]" />
            {fmt(resultado.potenciaInstaladaKw)} kW
          </p>
        </div>
        <div>
          <p class="text-xs text-gray-600">Consumo diario</p>
          <p class="text-xl font-bold text-gray-900 flex items-center gap-1">
            <Zap class="h-4 w-4 text-[#012928]" />
            {fmt(resultado.energiaDiaKwh)} kWh
          </p>
        </div>
        <div>
          <p class="text-xs text-gray-600">Consumo mensual aprox.</p>
          <p class="text-xl font-bold text-gray-900">{fmt(resultado.energiaDiaKwh * 30, 0)} kWh</p>
        </div>
      </div>
    </div>

    <p class="text-xs text-gray-500 mt-3 flex items-start gap-1.5">
      <Info class="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
      Resultado estimado de referencia. El dimensionamiento final debe confirmarlo un técnico de Suncar según tus equipos reales y la ubicación.
    </p>
  </div>
{:else}
  <div class={`${tarjeta} border-dashed border-[#AFEB17]/30 bg-white`}>
    <div class="px-6 py-8 text-center">
      <Sun class="h-10 w-10 text-[#F2C300] mx-auto mb-3" />
      <p class="text-gray-700 font-medium">Agrega tus equipos para ver qué sistema necesitas</p>
      <p class="text-sm text-gray-500 mt-1">Búscalos abajo o créalos con el botón “Crear”.</p>
    </div>
  </div>
{/if}
