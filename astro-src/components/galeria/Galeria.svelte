<script module lang="ts">
  type Categoria = "exterior" | "interior" | "nosotros";

  interface FotoGaleria {
    nombre_archivo: string;
    url: string;
    carpeta: string;
    tamano: number;
    fecha_subida: string;
  }

  type Fotos = Record<Categoria, string[]>;

  const CATEGORIAS: Categoria[] = ["exterior", "interior", "nosotros"];

  const CACHE_KEY = "suncar_galeria_cache_v1";
  const CACHE_TTL_MS = 10 * 60 * 1000;

  type EntradaCache = { data: Fotos; timestamp: number };

  // Caché en memoria + sessionStorage: volver a la galería no repite 3 peticiones.
  let cacheMemoria: EntradaCache | null = null;

  function leerCache(): EntradaCache | null {
    if (cacheMemoria) return cacheMemoria;
    if (typeof window === "undefined") return null;
    try {
      const raw = window.sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as EntradaCache;
      if (
        !parsed ||
        typeof parsed.timestamp !== "number" ||
        !parsed.data ||
        !Array.isArray(parsed.data.exterior) ||
        !Array.isArray(parsed.data.interior) ||
        !Array.isArray(parsed.data.nosotros)
      ) {
        return null;
      }
      cacheMemoria = parsed;
      return parsed;
    } catch {
      return null;
    }
  }

  function guardarCache(data: Fotos): void {
    const entrada: EntradaCache = { data, timestamp: Date.now() };
    cacheMemoria = entrada;
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(entrada));
    } catch {
      // Sin storage no pasa nada: solo se pierde la caché.
    }
  }

  function datosEnCache(permitirViejos = false): Fotos | null {
    const cache = leerCache();
    if (!cache) return null;
    const vigente = Date.now() - cache.timestamp <= CACHE_TTL_MS;
    return vigente || permitirViejos ? cache.data : null;
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import ChevronLeft from "lucide-svelte/icons/chevron-left";
  import ChevronRight from "lucide-svelte/icons/chevron-right";
  import Play from "lucide-svelte/icons/play";
  import Pause from "lucide-svelte/icons/pause";
  import X from "lucide-svelte/icons/x";
  import ZoomIn from "lucide-svelte/icons/zoom-in";
  import { imagenResponsive } from "~/lib/imagenes";

  const titulos: Record<Categoria, string> = {
    exterior: "Instalaciones de Exterior",
    interior: "Instalaciones de Interior",
    nosotros: "Nosotros",
  };

  const descripciones: Record<Categoria, string> = {
    exterior: "Nuestras instalaciones solares residenciales y comerciales en exteriores",
    interior: "Sistemas de energía solar y equipos instalados en interiores",
    nosotros: "Conoce a nuestro equipo de profesionales",
  };

  // Anchos y `sizes` de cada uso. Son los que decide el navegador según la
  // pantalla: con internet lenta y pantalla chica baja la versión de 640px.
  const ANCHOS_PRINCIPAL = [640, 828, 1080, 1200, 1920];
  const SIZES_PRINCIPAL = "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw";
  const ANCHOS_MINIATURA = [128, 256, 384];
  const SIZES_MINIATURA = "(max-width: 768px) 33vw, (max-width: 1280px) 12vw, 8vw";
  const ANCHOS_VISOR = [1080, 1920];

  let categoria = $state<Categoria>("exterior");
  let indice = $state(0);
  let autoplay = $state(true);
  let ampliada = $state(false);
  let fotos = $state<Fotos>({ exterior: [], interior: [], nosotros: [] });
  let cargando = $state(true);
  let hayError = $state(false);

  const actuales = $derived(fotos[categoria]);
  const principal = $derived(actuales[indice]);

  async function cargarFotos({ silencioso = false }: { silencioso?: boolean } = {}) {
    try {
      if (!silencioso) {
        cargando = true;
        hayError = false;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const [exteriorRes, interiorRes, nosotrosRes] = await Promise.all([
        fetch(`${backendUrl}/api/galeriaweb/instalaciones_exterior`),
        fetch(`${backendUrl}/api/galeriaweb/instalaciones_interior`),
        fetch(`${backendUrl}/api/galeriaweb/nosotros`),
      ]);

      if (!exteriorRes.ok || !interiorRes.ok || !nosotrosRes.ok) {
        console.error("Error fetching gallery images:", {
          exterior: exteriorRes.status,
          interior: interiorRes.status,
          nosotros: nosotrosRes.status,
        });
        throw new Error("Respuesta inválida del servidor");
      }

      const exteriorData = await exteriorRes.json();
      const interiorData = await interiorRes.json();
      const nosotrosData = await nosotrosRes.json();

      const urls = (r: { success?: boolean; data?: FotoGaleria[] }) =>
        r.success && r.data ? r.data.map((foto) => foto.url) : [];

      const mapeadas: Fotos = {
        exterior: urls(exteriorData),
        interior: urls(interiorData),
        nosotros: urls(nosotrosData),
      };

      fotos = mapeadas;
      guardarCache(mapeadas);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      if (!silencioso) hayError = true;
    } finally {
      if (!silencioso) cargando = false;
    }
  }

  onMount(() => {
    // Con ahorro de datos o conexión 2G el avance automático descargaría fotos
    // grandes sin que nadie las pida: arranca pausado (se puede reactivar).
    const conexion = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    if (conexion?.saveData || conexion?.effectiveType === "2g" || conexion?.effectiveType === "slow-2g") {
      autoplay = false;
    }

    const vigente = datosEnCache();
    if (vigente) {
      fotos = vigente;
      cargando = false;
      return;
    }

    const viejo = datosEnCache(true);
    if (viejo) {
      fotos = viejo;
      cargando = false;
      void cargarFotos({ silencioso: true });
      return;
    }

    void cargarFotos();
  });

  function elegirCategoria(c: Categoria) {
    categoria = c;
    indice = 0;
  }

  function siguiente() {
    indice = indice === actuales.length - 1 ? 0 : indice + 1;
  }

  function anterior() {
    indice = indice === 0 ? actuales.length - 1 : indice - 1;
  }

  $effect(() => {
    if (!autoplay || cargando || actuales.length === 0) return;
    const intervalo = setInterval(siguiente, 4000);
    return () => clearInterval(intervalo);
  });

  // Mientras corre el avance automático, baja la siguiente foto con la misma
  // variante (srcset/sizes) que va a pedir el <img>, para que no aparezca en blanco.
  $effect(() => {
    if (!autoplay || cargando || ampliada || actuales.length < 2) return;
    const url = actuales[(indice + 1) % actuales.length];
    const r = imagenResponsive(url, ANCHOS_PRINCIPAL, { quality: 75 });
    const img = new Image();
    if (r.srcset) {
      img.sizes = SIZES_PRINCIPAL;
      img.srcset = r.srcset;
    }
    img.src = r.src;
  });

  $effect(() => {
    if (!ampliada) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") ampliada = false;
    };
    document.addEventListener("keydown", alTeclear);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = "unset";
    };
  });
</script>

<div class="min-h-screen bg-[#F2F2EF] pt-36 pb-16 relative overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-100/30"></div>
  <div class="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
  <div class="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-tr from-blue-200/30 to-transparent rounded-full blur-2xl animate-pulse delay-1000"></div>

  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl md:text-5xl font-bold text-primary mb-4">Galería de Proyectos</h1>
      <p class="text-lg text-gray-600 max-w-3xl mx-auto">
        Descubre nuestros proyectos de energía solar, instalaciones y conoce a nuestro equipo profesional
      </p>
    </div>

    <div class="flex flex-wrap justify-center gap-4 mb-8">
      {#each CATEGORIAS as c (c)}
        <button
          type="button"
          onclick={() => elegirCategoria(c)}
          class={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
            categoria === c
              ? "bg-[#012928] text-white shadow-lg"
              : "bg-white text-gray-700 border border-gray-200 hover:border-primary hover:text-primary"
          }`}
        >
          {titulos[c]}
          <span class="ml-2 inline-flex items-center rounded-full border border-transparent bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {fotos[c].length}
          </span>
        </button>
      {/each}
    </div>

    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-primary mb-2">{titulos[categoria]}</h2>
      <p class="text-gray-600">{descripciones[categoria]}</p>
    </div>

    <div class="mb-8">
      <div class="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div class="relative h-96 md:h-[500px] lg:h-[600px] bg-gray-100 flex items-center justify-center">
          {#if cargando}
            <div class="flex flex-col items-center justify-center gap-4">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p class="text-gray-600">Cargando imágenes...</p>
            </div>
          {:else if hayError}
            <div class="flex flex-col items-center justify-center gap-4 px-6 text-center">
              <p class="text-gray-700 font-medium">No pudimos cargar las imágenes en este momento.</p>
              <button
                type="button"
                onclick={() => void cargarFotos()}
                class="px-6 py-3 bg-[#012928] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Reintentar
              </button>
            </div>
          {:else if actuales.length === 0}
            <div class="flex flex-col items-center justify-center gap-2 px-6 text-center">
              <p class="text-gray-700 font-medium">Aún no hay imágenes en esta categoría.</p>
              <p class="text-sm text-gray-500">Prueba con otra sección.</p>
            </div>
          {:else if principal}
            {@const r = imagenResponsive(principal, ANCHOS_PRINCIPAL, { quality: 75 })}
            <img
              src={r.src}
              srcset={r.srcset}
              sizes={r.srcset ? SIZES_PRINCIPAL : undefined}
              alt={`${titulos[categoria]} - Imagen ${indice + 1}`}
              loading={indice === 0 ? "eager" : "lazy"}
              fetchpriority={indice === 0 ? "high" : "auto"}
              decoding="async"
              class="absolute inset-0 h-full w-full object-contain transition-all duration-500"
            />
          {/if}

          {#if !cargando && actuales.length > 0}
            <button
              type="button"
              onclick={() => (ampliada = true)}
              aria-label="Ampliar imagen"
              class="absolute top-4 left-4 bg-white/80 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all duration-300 z-10"
            >
              <ZoomIn size={20} />
            </button>

            <button
              type="button"
              onclick={anterior}
              aria-label="Imagen anterior"
              class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onclick={siguiente}
              aria-label="Imagen siguiente"
              class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <ChevronRight size={24} />
            </button>

            <button
              type="button"
              onclick={() => (autoplay = !autoplay)}
              aria-label={autoplay ? "Pausar reproducción automática" : "Activar reproducción automática"}
              class="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all duration-300"
            >
              {#if autoplay}<Pause size={20} />{:else}<Play size={20} />{/if}
            </button>

            <div class="absolute bottom-4 left-4 bg-black/50 text-white px-4 py-2 rounded-full">
              {indice + 1} / {actuales.length}
            </div>
          {/if}
        </div>
      </div>
    </div>

    {#if !cargando && actuales.length > 0}
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 mb-8">
        {#each actuales as foto, i (i)}
          {@const m = imagenResponsive(foto, ANCHOS_MINIATURA, { quality: 55 })}
          <button
            type="button"
            onclick={() => (indice = i)}
            aria-label={`Ver imagen ${i + 1}`}
            class={`relative aspect-square rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105 ${
              i === indice ? "ring-4 ring-primary shadow-lg" : "hover:ring-2 hover:ring-primary/50"
            }`}
          >
            <img
              src={m.src}
              srcset={m.srcset}
              sizes={m.srcset ? SIZES_MINIATURA : undefined}
              alt={`Miniatura ${i + 1}`}
              loading="lazy"
              decoding="async"
              class="absolute inset-0 h-full w-full object-cover"
            />
            {#if i === indice}
              <div class="absolute inset-0 bg-primary/20"></div>
            {/if}
          </button>
        {/each}
      </div>

      <div class="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div
          class="bg-[#012928] h-2 rounded-full transition-all duration-300"
          style={`width: ${((indice + 1) / actuales.length) * 100}%`}
        ></div>
      </div>

      <div class="text-center">
        <div class="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
          {#if autoplay}
            <Play size={16} class="text-green-600" />
            <span class="text-sm text-gray-700">Reproducción automática activa</span>
          {:else}
            <Pause size={16} class="text-gray-600" />
            <span class="text-sm text-gray-700">Reproducción automática pausada</span>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

{#if ampliada && principal}
  {@const v = imagenResponsive(principal, ANCHOS_VISOR, { quality: 85 })}
  <div class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
    <div class="relative w-full h-full flex items-center justify-center">
      <img
        src={v.src}
        srcset={v.srcset}
        sizes={v.srcset ? "100vw" : undefined}
        alt={`${titulos[categoria]} - Imagen ${indice + 1}`}
        fetchpriority="high"
        decoding="async"
        class="absolute inset-0 h-full w-full object-contain"
      />

      <button
        type="button"
        onclick={() => (ampliada = false)}
        aria-label="Cerrar"
        class="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
      >
        <X size={24} />
      </button>

      <button
        type="button"
        onclick={anterior}
        aria-label="Imagen anterior"
        class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        type="button"
        onclick={siguiente}
        aria-label="Imagen siguiente"
        class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
      >
        <ChevronRight size={24} />
      </button>

      <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
        {indice + 1} / {actuales.length}
      </div>
    </div>
  </div>
{/if}
