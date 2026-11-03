<script lang="ts">
  import CheckCircle from "lucide-svelte/icons/circle-check";
  import Shield from "lucide-svelte/icons/shield";
  import type { Oferta } from "@/types/ofertas";
  import ModalDetalle from "./ModalDetalle.svelte";

  // "Ver garantías del kit".
  interface Props {
    /** null mientras se pide el detalle. */
    oferta: Oferta | null;
    descripcion: string;
    cargando?: boolean;
    error?: boolean;
    abierto: boolean;
    oncerrar: () => void;
  }
  let { oferta, descripcion, cargando = false, error = false, abierto, oncerrar }: Props = $props();
</script>

<ModalDetalle
  {abierto}
  {oncerrar}
  {descripcion}
  {cargando}
  {error}
  hayOferta={oferta !== null}
  icono={Shield}
  titulo="Garantías incluidas"
>
  {#if oferta && oferta.garantias && oferta.garantias.length > 0}
    <div class="space-y-4">
      <div class="space-y-3">
        {#each oferta.garantias as garantia, index (index)}
          <div class="flex items-start gap-3 rounded-lg bg-green-50 p-3">
            <CheckCircle class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" aria-hidden="true" />
            <span class="text-gray-700">{garantia}</span>
          </div>
        {/each}
      </div>

      <div class="border-t border-gray-200 pt-4">
        <div class="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <Shield class="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" aria-hidden="true" />
          <p class="text-xs leading-relaxed text-gray-700">
            Cualquier intervención de terceros anulará automáticamente la cobertura de garantía
            realizada por nuestro equipo de profesionales certificados de SUNCAR.
          </p>
        </div>
      </div>
    </div>
  {:else}
    <p class="italic text-gray-500">No hay garantías especificadas para esta oferta.</p>
  {/if}
</ModalDetalle>
