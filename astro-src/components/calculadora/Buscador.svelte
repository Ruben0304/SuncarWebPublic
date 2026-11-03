<script lang="ts">
  import Minus from "lucide-svelte/icons/minus";
  import Plus from "lucide-svelte/icons/plus";
  import Search from "lucide-svelte/icons/search";
  import Combobox from "~/components/ui/Combobox.svelte";
  import type { EquipoWithMeta, EstadoCalculadora } from "./estado.svelte";
  import { botonOutline, insignia, tarjeta } from "./clases";

  let { calc }: { calc: EstadoCalculadora } = $props();

  const grupos = $derived.by(() => {
    const q = calc.busqueda.trim().toLowerCase();
    const salida: [string, EquipoWithMeta[]][] = [];
    for (const [categoriaNombre, equipos] of calc.categoriasPorNombre) {
      const filtrados = equipos.filter(
        (equipo) =>
          !q || equipo.nombre.toLowerCase().includes(q) || categoriaNombre.toLowerCase().includes(q)
      );
      if (filtrados.length > 0) salida.push([categoriaNombre, filtrados]);
    }
    return salida;
  });

  const primero = () => {
    const key = grupos[0]?.[1][0]?.key;
    if (key) calc.agregarDesdeBuscador(key);
  };
</script>

<div class={`${tarjeta} border-[#AFEB17]/25`}>
  <div class="p-6 pt-4 sm:pt-6">
    <Combobox
      bind:open={calc.openBuscador}
      bind:query={calc.busqueda}
      searchPlaceholder="Buscar por nombre o categoría..."
      triggerClass={`${botonOutline} h-10 px-4 py-2 w-full justify-start text-left font-normal border-[#AFEB17]/25 hover:bg-[#AFEB17]/5`}
      onenter={primero}
    >
      {#snippet trigger()}
        <Search class="mr-2 h-4 w-4 shrink-0 text-[#012928]" />
        <span class="text-gray-500">Buscar equipos...</span>
      {/snippet}

      {#if grupos.length === 0}
        <div class="py-6 text-center text-sm">Sin resultados para la búsqueda.</div>
      {/if}
      {#each grupos as [categoriaNombre, equipos] (categoriaNombre)}
        <div class="p-1 text-gray-900">
          <div class="px-2 py-1.5 text-xs font-medium text-gray-500">{categoriaNombre}</div>
          {#each equipos as equipo (equipo.key)}
            {@const yaAgregado = calc.equiposCantidad.has(equipo.key)}
            {@const cantidadActual = calc.cantidadBuscador.get(equipo.key) || 1}
            <div
              role="option"
              aria-selected="false"
              tabindex="-1"
              onclick={() => calc.agregarDesdeBuscador(equipo.key)}
              onkeydown={(e) => {
                if (e.key === "Enter") calc.agregarDesdeBuscador(equipo.key);
              }}
              class="relative flex cursor-pointer select-none flex-col sm:flex-row items-start sm:items-center gap-2 rounded-sm px-2 py-3 text-sm outline-none hover:bg-gray-100"
            >
              <div class="flex-1 w-full">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900 flex items-center gap-2">
                      {equipo.nombre}
                      {#if equipo.isLocal}<span class={`${insignia} text-xs`}>Personalizado</span>{/if}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                      {Math.round(equipo.potencia_kw * 1000)} W · consumo medio {Math.round(equipo.energia_kwh * 1000)} W
                    </p>
                  </div>
                  {#if yaAgregado}
                    <span class={`${insignia} bg-green-100 text-green-700 border-green-200`}>Agregado</span>
                  {/if}
                </div>
              </div>
              <div class="flex items-center gap-2 w-full sm:w-auto">
                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    onclick={(e) => {
                      e.stopPropagation();
                      calc.actualizarCantidadBuscador(equipo.key, Math.max(1, cantidadActual - 1));
                    }}
                    class={`${botonOutline} h-7 w-7 p-0`}
                    aria-label="Menos"
                  >
                    <Minus class="h-3 w-3" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={cantidadActual}
                    onclick={(e) => e.stopPropagation()}
                    oninput={(e) => {
                      e.stopPropagation();
                      const valor = parseInt(e.currentTarget.value, 10) || 1;
                      calc.actualizarCantidadBuscador(equipo.key, Math.max(1, valor));
                    }}
                    class="w-14 h-7 rounded-md border border-gray-200 bg-white px-3 py-2 text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#012928]/40"
                  />
                  <button
                    type="button"
                    onclick={(e) => {
                      e.stopPropagation();
                      calc.actualizarCantidadBuscador(equipo.key, cantidadActual + 1);
                    }}
                    class={`${botonOutline} h-7 w-7 p-0`}
                    aria-label="Más"
                  >
                    <Plus class="h-3 w-3" />
                  </button>
                </div>
                <button
                  type="button"
                  onclick={(e) => {
                    e.stopPropagation();
                    calc.agregarDesdeBuscador(equipo.key);
                  }}
                  class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium text-white transition-colors bg-[#012928] hover:bg-[#011818] h-7"
                >
                  Agregar
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/each}
    </Combobox>
  </div>
</div>
