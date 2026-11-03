<script lang="ts">
  import Modal from "~/components/ui/Modal.svelte";
  import type { EstadoCalculadora } from "./estado.svelte";
  import { botonBase, input, select } from "./clases";

  let { calc }: { calc: EstadoCalculadora } = $props();

  const etiqueta = "text-sm font-medium leading-none";
</script>

<Modal
  open={calc.isCreateDialogOpen}
  onclose={() => calc.handleCreateDialogChange(false)}
  label="Crear equipo personalizado"
  class="sm:max-w-lg p-6"
>
  <div class="flex flex-col space-y-1.5 text-left pr-6">
    <h2 class="text-lg font-semibold leading-none tracking-tight">Crear equipo personalizado</h2>
    <p class="text-sm text-gray-500">
      Este equipo solo estará disponible en esta sesión y no se guardará de forma permanente.
    </p>
  </div>
  <div class="space-y-4 mt-4">
    <div class="space-y-2">
      <label for="nuevo-equipo-nombre" class={etiqueta}>Nombre del equipo</label>
      <input
        id="nuevo-equipo-nombre"
        class={input}
        placeholder="Ej: Refrigerador Samsung 2023"
        bind:value={calc.createForm.nombre}
      />
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="space-y-2">
        <label for="nuevo-equipo-potencia" class={etiqueta}>Potencia (kW)</label>
        <input
          id="nuevo-equipo-potencia"
          class={input}
          type="number"
          inputmode="decimal"
          placeholder="Ej: 0.15"
          min="0"
          step="0.01"
          bind:value={calc.createForm.potencia_kw}
        />
        <p class="text-xs text-gray-500 mt-1">1 kW = 1000 Watts</p>
      </div>
      <div class="space-y-2">
        <label for="nuevo-equipo-energia" class={etiqueta}>Consumo medio (kWh/h)</label>
        <input
          id="nuevo-equipo-energia"
          class={input}
          type="number"
          inputmode="decimal"
          placeholder="Ej: 0.06"
          min="0"
          step="0.01"
          bind:value={calc.createForm.energia_kwh}
        />
        <p class="text-xs text-gray-500 mt-1">Consumo real por hora de uso</p>
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="space-y-2">
        <label for="nuevo-equipo-horas" class={etiqueta}>Horas de uso al día</label>
        <input
          id="nuevo-equipo-horas"
          class={input}
          type="number"
          inputmode="decimal"
          placeholder="Ej: 4"
          min="0"
          max="24"
          step="0.5"
          bind:value={calc.createForm.horas_uso_dia}
        />
      </div>
      <div class="space-y-2">
        <label for="nuevo-equipo-carga" class={etiqueta}>Tipo de carga</label>
        <select id="nuevo-equipo-carga" bind:value={calc.createForm.tipo_carga} class={`${select} mt-1`}>
          <option value="resistiva">Resistiva (luces, TV, cargadores)</option>
          <option value="electronica">Electrónica</option>
          <option value="motor">Motor (aire, nevera, bomba)</option>
        </select>
      </div>
    </div>
    <div class="space-y-2">
      <label for="nuevo-equipo-categoria" class={etiqueta}>Categoría</label>
      <select
        id="nuevo-equipo-categoria"
        value={calc.createForm.categoria}
        onchange={(e) => {
          const value = e.currentTarget.value;
          calc.createForm.categoria = value;
          if (value !== "otro") calc.createForm.categoriaPersonalizada = "";
        }}
        class={`${select} mt-1`}
      >
        <option value="" disabled>Selecciona una categoría</option>
        {#each calc.categoriaOptions as nombre (nombre)}
          <option value={nombre}>{nombre}</option>
        {/each}
        <option value="otro">Otra categoría</option>
      </select>
      {#if calc.createForm.categoria === "otro"}
        <input
          class={`${input} mt-3`}
          placeholder="Nombre de la nueva categoría"
          bind:value={calc.createForm.categoriaPersonalizada}
        />
      {/if}
    </div>
  </div>
  <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0 pt-4">
    <button
      type="button"
      class={`${botonBase} h-10 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-100`}
      onclick={() => calc.handleCreateDialogChange(false)}
    >
      Cancelar
    </button>
    <button
      type="button"
      class={`${botonBase} h-10 px-4 py-2 text-white bg-[#012928] hover:bg-[#011818]`}
      onclick={calc.handleCreateEquipoLocal}
    >
      Crear Equipo
    </button>
  </div>
</Modal>
