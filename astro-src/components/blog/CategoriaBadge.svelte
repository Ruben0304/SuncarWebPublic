<script lang="ts">
  import { CATEGORIAS_INFO, type Categoria } from "~/lib/blog";

  interface Props {
    categoria: Categoria;
    size?: "sm" | "md" | "lg";
  }
  let { categoria, size = "md" }: Props = $props();

  const info = $derived(CATEGORIAS_INFO[categoria]);
  const tamanos = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1 text-xs gap-1",
    lg: "px-4 py-2 text-sm gap-2",
  };
</script>

{#if info}
  <span
    class={`inline-flex items-center rounded-full bg-gradient-to-r ${info.color} text-white font-semibold shadow-lg ${tamanos[size]}`}
  >
    <span>{info.icon}</span>
    {info.label}
  </span>
{/if}
