<script lang="ts">
  interface Props {
    titulo: string;
    ayuda?: string | null;
    detalle?: string | null;
    derecha: string | null;
  }
  let { titulo, ayuda = null, detalle = null, derecha }: Props = $props();
</script>

<span class="block max-w-[60%] basis-[60%] pr-[3%]">
  <span class="block text-[17px] leading-[1.24] tracking-[-0.022em] text-[#012928]">{titulo}</span>
  {#if ayuda}
    <span class="mt-1 block text-[13px] font-semibold leading-[1.33] tracking-[-0.01em] text-[#012928] lg:text-[12px]">
      {ayuda}
    </span>
  {/if}
  {#if detalle}
    <span class="mt-1 block text-[13px] leading-[1.33] tracking-[-0.01em] text-[#012928] lg:text-[12px]">
      {detalle}
    </span>
  {/if}
</span>
<span class="block max-w-[40%] basis-[40%] text-right text-[13px] leading-[1.33] lg:text-[12px] tracking-[-0.01em] text-[#012928]">
  {derecha}
</span>
