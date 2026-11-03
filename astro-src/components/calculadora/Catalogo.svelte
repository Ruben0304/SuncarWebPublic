<script lang="ts">
  import Minus from "lucide-svelte/icons/minus";
  import Plus from "lucide-svelte/icons/plus";
  import Trash2 from "lucide-svelte/icons/trash-2";
  import X from "lucide-svelte/icons/x";
  import { categoriaIconos, type EstadoCalculadora } from "./estado.svelte";
  import { botonOutline, insignia, tarjeta } from "./clases";

  let { calc }: { calc: EstadoCalculadora } = $props();
</script>

{#if calc.categoriasError}
  <div class="rounded-lg border border-[#AFEB17]/20 bg-red-50 px-4 py-3 text-sm text-red-700">
    {calc.categoriasError}
  </div>
{/if}

{#if calc.noEquiposRegistrados && !calc.loadingCategorias}
  <div class={`${tarjeta} border-dashed border-[#AFEB17]/25`}>
    <div class="px-6 py-10 text-center">
      <p class="text-gray-600">No hay equipos disponibles.</p>
      <p class="text-sm text-gray-500 mt-2">Usa el botón “Crear” para agregar equipos personalizados.</p>
    </div>
  </div>
{:else}
  <div class="space-y-4">
    {#each [...calc.categoriasPorNombre] as [categoriaNombre, equipos] (categoriaNombre)}
      <div class={`${tarjeta} border-[#AFEB17]/15`}>
        <div class="flex flex-col space-y-1.5 p-6 pb-3">
          <h3 class="font-semibold leading-none tracking-tight text-base sm:text-lg flex items-center gap-2">
            <span>{categoriaIconos[categoriaNombre] || "⚡️"}</span>
            {categoriaNombre}
          </h3>
        </div>
        <div class="p-6 pt-0">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {#each equipos as equipo (equipo.key)}
              {@const cantidad = calc.equiposCantidad.get(equipo.key) || 0}
              {@const seleccionado = cantidad > 0}
              {@const horasUso = calc.getHorasUso(equipo)}
              <div
                class={`p-3 rounded-lg border transition-colors ${
                  seleccionado ? "border-[#AFEB17]/40 bg-[#AFEB17]/5" : "border-gray-200 bg-white"
                }`}
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                      {equipo.nombre}
                      {#if equipo.tipo_carga === "motor"}
                        <span class={`${insignia} text-xs bg-amber-100 text-amber-800 border-amber-200`}>Motor</span>
                      {/if}
                      {#if equipo.isLocal}<span class={`${insignia} text-xs`}>Personalizado</span>{/if}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                      {Math.round(equipo.potencia_kw * 1000)} W · consumo medio {Math.round(equipo.energia_kwh * 1000)} W
                    </p>
                  </div>
                  {#if equipo.isLocal}
                    <button
                      type="button"
                      class="inline-flex items-center justify-center rounded-md h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 ml-2 transition-colors"
                      onclick={() => calc.eliminarEquipoLocal(equipo.key)}
                      aria-label={`Eliminar ${equipo.nombre}`}
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  {/if}
                </div>

                {#if !seleccionado}
                  <button
                    type="button"
                    onclick={() => calc.agregarEquipo(equipo.key, 1)}
                    class={`${botonOutline} h-9 px-3 w-full border-[#AFEB17]/25 hover:bg-[#AFEB17]/15`}
                  >
                    <Plus class="h-3 w-3 mr-1" />
                    Agregar
                  </button>
                {:else}
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-500 w-16">Cantidad</span>
                      <button type="button" onclick={() => calc.decrementarCantidad(equipo.key)} class={`${botonOutline} h-8 w-8 p-0`} aria-label="Menos">
                        <Minus class="h-3 w-3" />
                      </button>
                      <div class="flex-1 text-center">
                        <span class="text-sm font-semibold">{cantidad}</span>
                      </div>
                      <button type="button" onclick={() => calc.incrementarCantidad(equipo.key)} class={`${botonOutline} h-8 w-8 p-0`} aria-label="Más">
                        <Plus class="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onclick={() => calc.eliminarEquipo(equipo.key)}
                        class="inline-flex items-center justify-center rounded-md h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                        aria-label="Quitar"
                      >
                        <X class="h-4 w-4" />
                      </button>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-500 w-16">Horas/día</span>
                      <button
                        type="button"
                        onclick={() => calc.actualizarHorasUso(equipo.key, horasUso - 1)}
                        class={`${botonOutline} h-8 w-8 p-0`}
                        aria-label="Menos horas"
                      >
                        <Minus class="h-3 w-3" />
                      </button>
                      <div class="flex-1 text-center">
                        <span class="text-sm font-semibold">{horasUso}</span>
                        <span class="text-xs text-gray-400"> h</span>
                      </div>
                      <button
                        type="button"
                        onclick={() => calc.actualizarHorasUso(equipo.key, horasUso + 1)}
                        class={`${botonOutline} h-8 w-8 p-0`}
                        aria-label="Más horas"
                      >
                        <Plus class="h-3 w-3" />
                      </button>
                      <div class="h-8 w-8"></div>
                    </div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}
