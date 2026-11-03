<script lang="ts">
  // Isla principal de /calculadora: arma el estado y reparte las piezas.
  import { onMount } from "svelte";
  import Loader2 from "lucide-svelte/icons/loader-circle";
  import Buscador from "./Buscador.svelte";
  import Cabecera from "./Cabecera.svelte";
  import Catalogo from "./Catalogo.svelte";
  import Configuracion from "./Configuracion.svelte";
  import CrearEquipoModal from "./CrearEquipoModal.svelte";
  import Resultados from "./Resultados.svelte";
  import { EstadoCalculadora } from "./estado.svelte";

  const calc = new EstadoCalculadora();

  onMount(() => {
    calc.fetchCategorias();
  });
</script>

<div class="min-h-screen bg-[#F2F2EF]">
  <Cabecera {calc} />

  {#if calc.initialLoading}
    <div class="flex items-center justify-center" style="min-height: calc(100vh - 60px)">
      <div class="text-center">
        <Loader2 class="h-8 w-8 animate-spin text-[#012928] mx-auto mb-4" />
        <p class="text-gray-600">Cargando calculadora...</p>
      </div>
    </div>
  {:else}
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <Configuracion {calc} />
      <Resultados {calc} />
      <Buscador {calc} />
      <Catalogo {calc} />
    </main>
  {/if}

  <CrearEquipoModal {calc} />
</div>
