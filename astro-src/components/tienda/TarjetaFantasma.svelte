<script lang="ts">
  // Tarjeta de relleno con brillo mientras carga el catálogo.
  import t from "./tienda.module.css";

  let { class: className = "" }: { class?: string } = $props();
</script>

<div class={`overflow-hidden rounded-[22px] bg-white ring-1 ring-[#012928]/[0.06] ${className}`}>
  <div class={`${t.brillo} aspect-square bg-gradient-to-r from-[#F2F2EF] via-white to-[#F2F2EF]`}></div>
  <div class="space-y-2 p-4">
    <div class="h-3 w-3/4 rounded-full bg-[#F2F2EF]"></div>
    <div class="h-3 w-1/2 rounded-full bg-[#F2F2EF]"></div>
    <div class="h-6 w-1/3 rounded-full bg-[#F2F2EF]"></div>
  </div>
</div>
