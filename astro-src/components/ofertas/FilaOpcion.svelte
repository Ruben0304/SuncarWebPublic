<script lang="ts">
  import { detalleOpcion, type OpcionKit, type PasoKit } from "@/lib/ofertas/configurador";
  import { PASO_INFO, ayudaDe, etiquetaDe, textoPrecio } from "./estadoArmarKit.svelte";
  import CuerpoFila from "./CuerpoFila.svelte";

  interface Props {
    paso: PasoKit;
    opcion: OpcionKit;
    elegida: OpcionKit | undefined;
    seleccionada: boolean;
    moneda: string;
    onelegir: () => void;
  }
  let { paso, opcion, elegida, seleccionada, moneda, onelegir }: Props = $props();
</script>

<button
  type="button"
  role="radio"
  aria-checked={seleccionada}
  aria-disabled={!opcion.disponible}
  onclick={onelegir}
  class={`flex w-full min-h-[83px] items-center justify-between rounded-[12px] bg-white text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#012928] ${
    seleccionada
      ? "border-2 border-[#012928] p-[14px]"
      : "border border-[#86868b] p-[15px] hover:border-[#8f8f94]"
  } ${!opcion.disponible ? "opacity-[.42]" : ""}`}
>
  <CuerpoFila
    titulo={etiquetaDe(paso, opcion)}
    ayuda={opcion.disponible ? ayudaDe(paso, opcion) : null}
    detalle={opcion.disponible ? detalleOpcion(paso, opcion.config, opcion.kits) : null}
    derecha={opcion.disponible ? textoPrecio(opcion, elegida, moneda) : PASO_INFO[paso].sinKit}
  />
</button>
