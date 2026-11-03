<script lang="ts">
  // La casa a toda la pantalla, con un diseño para pantallas verticales y otro
  // para horizontales. Las dos llegan en el HTML y el CSS muestra la que toca
  // según la orientación, así no hay salto al cargar.
  import { DISENO_ESCRITORIO, DISENO_MOVIL } from "@/components/tienda/disenos";
  import type { ZonaId } from "@/components/tienda/zonas";
  import s from "./casa-solar.module.css";
  import Escena from "./Escena.svelte";

  let { onelegir }: { onelegir: (zona: ZonaId) => void } = $props();
</script>

<Escena
  diseno={DISENO_MOVIL}
  prefijo="vertical"
  class={`${s.soloVertical} absolute inset-x-1 bottom-[2svh] top-20`}
  {onelegir}
/>
<Escena
  diseno={DISENO_ESCRITORIO}
  prefijo="horizontal"
  class={`${s.soloHorizontal} absolute inset-x-6 bottom-6 top-20 lg:top-24`}
  {onelegir}
/>
