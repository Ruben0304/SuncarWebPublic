<script lang="ts">
  // Solo entra en juego si el servidor no pudo traer el artículo (backend
  // lento o caído): lo pide desde el navegador como se hacía antes. El
  // convertidor de markdown se baja únicamente en ese caso.
  import { onMount } from "svelte";
  import ArrowLeft from "lucide-svelte/icons/arrow-left";
  import Articulo from "./Articulo.svelte";
  import { backendDelNavegador, type BlogDetalle } from "~/lib/blog";

  let { slug }: { slug: string } = $props();

  let blog = $state<BlogDetalle | null>(null);
  let html = $state("");
  let cargando = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    try {
      const respuesta = await fetch(`${backendDelNavegador()}/api/blog/${encodeURIComponent(slug)}`);
      const resultado = await respuesta.json();
      if (resultado.success && resultado.data) {
        const { markdownAHtml } = await import("~/lib/blogMarkdown");
        html = markdownAHtml(resultado.data.contenido);
        blog = resultado.data;
      } else {
        error = resultado.message || "Blog no encontrado";
      }
    } catch (err) {
      error = "Error de conexión al cargar el blog";
      console.error("Error fetching blog:", err);
    } finally {
      cargando = false;
    }
  });
</script>

{#if cargando}
  <div class="container mx-auto px-4 py-24">
    <div class="max-w-4xl mx-auto space-y-8 animate-pulse">
      <div class="h-8 bg-gray-200 rounded w-1/4"></div>
      <div class="h-12 bg-gray-200 rounded w-3/4"></div>
      <div class="h-96 bg-gray-200 rounded-2xl"></div>
      <div class="space-y-4">
        <div class="h-4 bg-gray-200 rounded"></div>
        <div class="h-4 bg-gray-200 rounded"></div>
        <div class="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  </div>
{:else if error || !blog}
  <div class="container mx-auto px-4 py-24">
    <div class="max-w-4xl mx-auto text-center">
      <div class="inline-block p-12 bg-gray-50 rounded-2xl">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">{error || "Blog no encontrado"}</h2>
        <a
          href="/blog"
          class="inline-flex items-center gap-2 px-6 py-3 bg-[#012928] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
        >
          <ArrowLeft class="w-4 h-4" />
          Volver al blog
        </a>
      </div>
    </div>
  </div>
{:else}
  <Articulo {blog} {html} />
{/if}
