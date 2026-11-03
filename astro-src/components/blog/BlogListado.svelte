<script lang="ts">
  import { onMount } from "svelte";
  import BlogCard from "./BlogCard.svelte";
  import { backendDelNavegador, CATEGORIAS_INFO, type BlogListadoItem, type Categoria } from "~/lib/blog";

  interface Props {
    /** Artículos que el servidor ya pidió. null: se piden desde el navegador. */
    inicial: BlogListadoItem[] | null;
    categoria?: Categoria | null;
  }
  let { inicial, categoria = null }: Props = $props();

  let blogs = $state<BlogListadoItem[]>(inicial ?? []);
  let cargando = $state(inicial === null);
  let error = $state<string | null>(null);

  async function cargar() {
    try {
      cargando = true;
      error = null;
      const respuesta = await fetch(`${backendDelNavegador()}/api/blog/`);
      const resultado = await respuesta.json();
      if (resultado.success) blogs = resultado.data;
      else error = resultado.message || "Error al cargar los blogs";
    } catch (err) {
      error = "Error de conexión al cargar los blogs";
      console.error("Error fetching blogs:", err);
    } finally {
      cargando = false;
    }
  }

  // Solo si el servidor no trajo los artículos (backend lento o caído).
  onMount(() => {
    if (inicial === null) cargar();
  });

  const info = $derived(categoria ? CATEGORIAS_INFO[categoria] : null);
  const visibles = $derived(categoria ? blogs.filter((b) => b.categoria === categoria) : blogs);
</script>

<section class="py-16 lg:py-24">
  <div class="container mx-auto px-4 md:px-6 lg:px-8">
    {#if cargando}
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each [1, 2, 3, 4, 5, 6] as i (i)}
          <div class="animate-pulse">
            <div class="bg-gray-200 h-64 rounded-2xl mb-4"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        {/each}
      </div>
    {:else if error}
      <div class="text-center py-16">
        <div class="inline-block p-8 bg-red-50 rounded-2xl">
          <p class="text-red-600 text-lg font-medium">{error}</p>
          <button
            type="button"
            onclick={cargar}
            class="mt-4 px-6 py-2 bg-[#012928] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
          >
            Reintentar
          </button>
        </div>
      </div>
    {:else if visibles.length === 0}
      <div class="text-center py-16">
        <div class="inline-block p-8 bg-gray-50 rounded-2xl">
          <p class="text-gray-600 text-lg">
            {info ? `No hay artículos disponibles en la categoría ${info.label}` : "No hay artículos disponibles"}
          </p>
          {#if info}
            <a
              href="/blog"
              class="mt-4 inline-block px-6 py-2 bg-[#012928] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Ver todos los artículos
            </a>
          {/if}
        </div>
      </div>
    {:else}
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each visibles as blog, index (blog.id)}
          <BlogCard {...blog} {index} />
        {/each}
      </div>
    {/if}
  </div>
</section>
