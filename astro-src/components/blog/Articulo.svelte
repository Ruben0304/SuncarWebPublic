<script lang="ts">
  import ArrowLeft from "lucide-svelte/icons/arrow-left";
  import Share2 from "lucide-svelte/icons/share-2";
  import TrendingUp from "lucide-svelte/icons/trending-up";
  import CategoriaBadge from "./CategoriaBadge.svelte";
  import { formatearFecha, minutosDeLectura, type BlogDetalle } from "~/lib/blog";

  interface Props {
    blog: BlogDetalle;
    /** Contenido markdown ya convertido a HTML (lib/blogMarkdown). */
    html: string;
  }
  let { blog, html }: Props = $props();

  // El botón "Compartir" no lleva onclick: la página lo atiende con un solo
  // script (así el artículo servido por el servidor no necesita hidratarse).
</script>

<article class="pt-20 pb-8">
  <div class="container mx-auto px-4 md:px-6">
    <div class="max-w-3xl mx-auto mb-8 pt-8">
      <a
        href="/blog"
        class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
      >
        <ArrowLeft class="w-4 h-4" />
        Volver al blog
      </a>
    </div>

    <header class="max-w-3xl mx-auto mb-12">
      <div class="mb-6">
        <CategoriaBadge categoria={blog.categoria} size="lg" />
      </div>

      <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
        {blog.titulo}
      </h1>

      <p class="text-xl text-gray-600 mb-8 leading-relaxed font-light">
        {blog.resumen}
      </p>

      <div class="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-gray-200">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#012928] to-[#023d3a] flex items-center justify-center text-white font-bold text-lg">
              {blog.autor.charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="font-semibold text-gray-900">{blog.autor}</div>
              <div class="flex items-center gap-3 text-sm text-gray-500">
                <span>{formatearFecha(blog.fecha_publicacion)}</span>
                <span>•</span>
                <span>{minutosDeLectura(blog.contenido)} min de lectura</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            data-compartir
            data-titulo={blog.titulo}
            data-resumen={blog.resumen}
            class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors text-sm font-medium"
          >
            <Share2 class="w-4 h-4" />
            Compartir
          </button>
        </div>
      </div>
    </header>

    {#if blog.imagen_principal}
      <figure class="max-w-4xl mx-auto mb-12">
        <div class="relative rounded-lg overflow-hidden shadow-xl aspect-[16/9] bg-gray-100">
          <img
            src={blog.imagen_principal}
            alt={blog.titulo}
            fetchpriority="high"
            decoding="async"
            class="w-full h-full object-cover"
          />
        </div>
      </figure>
    {/if}

    <div class="max-w-3xl mx-auto">
      <div class="max-w-none">
        {@html html}
      </div>

      {#if blog.tags.length > 0}
        <div class="mt-12 pt-8 border-t border-gray-200">
          <div class="flex flex-wrap gap-2">
            {#each blog.tags as tag}
              <span class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-md hover:bg-gray-200 transition-colors">
                {tag}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      {#if blog.imagenes_adicionales && blog.imagenes_adicionales.length > 0}
        <div class="mt-12 pt-12 border-t border-gray-200">
          <h3 class="text-2xl font-bold text-gray-900 mb-8">Galería de Imágenes</h3>
          <div class="grid sm:grid-cols-2 gap-4">
            {#each blog.imagenes_adicionales as img, index}
              <div class="relative rounded-lg overflow-hidden shadow-md group aspect-[4/3] bg-gray-100">
                <img
                  src={img}
                  alt={`${blog.titulo} - Imagen ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <div class="mt-12 pt-8 border-t border-gray-200">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-6 text-sm text-gray-500">
            <div class="flex items-center gap-2">
              <TrendingUp class="w-4 h-4" />
              <span>{blog.visitas} visitas</span>
            </div>
          </div>
          <button
            type="button"
            data-compartir
            data-titulo={blog.titulo}
            data-resumen={blog.resumen}
            class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors text-sm font-medium"
          >
            <Share2 class="w-4 h-4" />
            Compartir artículo
          </button>
        </div>
      </div>

      <div class="mt-16 p-8 bg-gradient-to-br from-[#F2F2EF] to-[#F2C300]/10 rounded-2xl border border-gray-200">
        <div class="text-center">
          <h3 class="text-2xl font-bold text-gray-900 mb-3">¿Interesado en energía solar?</h3>
          <p class="text-gray-600 mb-6 max-w-xl mx-auto">
            Solicita una cotización personalizada para tu hogar o negocio y descubre cuánto puedes ahorrar
          </p>
          <div class="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="/blog"
              class="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 border border-gray-200"
            >
              <ArrowLeft class="w-4 h-4" />
              Ver más artículos
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</article>
