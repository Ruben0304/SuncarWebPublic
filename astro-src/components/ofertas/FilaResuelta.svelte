<script lang="ts">
  import { detalleOpcion, type OpcionKit, type PasoKit } from "@/lib/ofertas/configurador";
  import { etiquetaDe } from "./estadoArmarKit.svelte";
  import CuerpoFila from "./CuerpoFila.svelte";

  // Un paso ya resuelto: queda su fila elegida con "Editar", como en Apple.
  interface Props {
    paso: PasoKit;
    opcion: OpcionKit;
    oneditar: () => void;
  }
  let { paso, opcion, oneditar }: Props = $props();
</script>

<div class="flex w-full min-h-[83px] items-center justify-between rounded-[12px] border-2 border-[#012928] bg-white p-[14px] text-left transition-colors">
  <CuerpoFila
    titulo={etiquetaDe(paso, opcion)}
    detalle={detalleOpcion(paso, opcion.config, opcion.kits)}
    derecha={null}
  />
  <button
    type="button"
    onclick={oneditar}
    class="relative before:absolute before:-inset-x-2 before:-inset-y-3 before:content-[''] lg:before:hidden text-sm text-[#012928] underline underline-offset-2 hover:no-underline"
  >
    Editar
  </button>
</div>
