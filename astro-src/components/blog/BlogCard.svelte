<script lang="ts">
  import ArrowRight from "lucide-svelte/icons/arrow-right";
  import Calendar from "lucide-svelte/icons/calendar";
  import Tag from "lucide-svelte/icons/tag";
  import TrendingUp from "lucide-svelte/icons/trending-up";
  import { formatearFecha, type BlogListadoItem } from "~/lib/blog";

  interface Props extends BlogListadoItem {
    index?: number;
  }
  let { titulo, slug, resumen, imagen_principal, tags, autor, fecha_publicacion, visitas, index = 0 }: Props = $props();
</script>

<article
  class="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
  style={`animation: fade-in-up 0.6s ease-out ${index * 0.1}s backwards`}
>
  <a href={`/blog/${slug}`} class="block relative h-64 overflow-hidden bg-gray-200">
    {#if imagen_principal}
      <img
        src={imagen_principal}
        alt={titulo}
        loading={index < 3 ? "eager" : "lazy"}
        decoding="async"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
    {:else}
      <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#012928] to-[#023d3a]">
        <span class="text-6xl">☀️</span>
      </div>
    {/if}
  </a>

  <div class="p-6 space-y-4">
    <div class="flex items-center gap-4 text-xs text-gray-500">
      <div class="flex items-center gap-1">
        <Calendar class="w-3 h-3" />
        {formatearFecha(fecha_publicacion)}
      </div>
      <div class="flex items-center gap-1">
        <TrendingUp class="w-3 h-3" />
        {visitas} visitas
      </div>
    </div>

    <a href={`/blog/${slug}`}>
      <h3 class="text-xl font-bold text-primary group-hover:opacity-80 transition-opacity duration-300 line-clamp-2">
        {titulo}
      </h3>
    </a>

    <p class="text-gray-600 text-sm leading-relaxed line-clamp-3">{resumen}</p>

    {#if tags.length > 0}
      <div class="flex flex-wrap gap-2">
        {#each tags.slice(0, 3) as tag}
          <span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            <Tag class="w-3 h-3" />
            {tag}
          </span>
        {/each}
      </div>
    {/if}

    <a
      href={`/blog/${slug}`}
      class="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:opacity-80 transition-opacity duration-300"
    >
      Leer más
      <ArrowRight class="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
    </a>

    <div class="pt-3 border-t border-gray-100">
      <p class="text-xs text-gray-500">Por {autor}</p>
    </div>
  </div>
</article>
