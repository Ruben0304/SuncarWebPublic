<script lang="ts">
  import MessageCircle from "lucide-svelte/icons/message-circle";
  import t from "./tienda.module.css";
  import type { Zona } from "@/components/tienda/zonas";

  interface Props {
    zona: Zona;
    hayKits: boolean;
  }
  let { zona, hayKits }: Props = $props();
</script>

<div class={`${t.entrar} mt-6 rounded-[22px] bg-white p-5 ring-1 ring-[#012928]/[0.06]`}>
  <p class="text-[15px] font-semibold text-[#012928]">
    {hayKits
      ? `Las ${zona.nombre.toLowerCase()} van dentro de nuestros kits`
      : "Pronto tendremos productos aquí"}
  </p>
  <p class="mt-1 text-[13px] leading-relaxed text-slate-500">
    {hayKits
      ? "Así te las instalamos con garantía y dimensionadas para tu consumo."
      : "Escríbenos y te decimos qué tenemos disponible ahora mismo."}
  </p>
  {#if !hayKits}
    <a
      href="/contacto"
      class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#012928] px-4 py-2 text-sm font-semibold text-white"
    >
      <MessageCircle class="h-4 w-4" />
      Contáctanos
    </a>
  {/if}
</div>
