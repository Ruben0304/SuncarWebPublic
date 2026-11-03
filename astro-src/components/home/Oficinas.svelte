<script lang="ts">
  import { optimizedImage, imageSrcset } from "@/lib/image";
  import Bookmark from "lucide-svelte/icons/bookmark";
  import Heart from "lucide-svelte/icons/heart";
  import MapPin from "lucide-svelte/icons/map-pin";
  import Maximize2 from "lucide-svelte/icons/maximize-2";
  import MessageCircle from "lucide-svelte/icons/message-circle";
  import MoreHorizontal from "lucide-svelte/icons/ellipsis";
  import Send from "lucide-svelte/icons/send";
  import X from "lucide-svelte/icons/x";
  import { useContacto } from "~/lib/contacto.svelte";
  import { portal } from "~/lib/portal";

  const FOTO_OFICINA = "https://s3.suncarsrl.com/photos/web/oficina-3ra-y-2-1600.webp";
  const FOTO_OFICINA_BLUR =
    "data:image/webp;base64,UklGRpYAAABXRUJQVlA4IIoAAAAQBACdASoYAA0APu1iqk2ppaQiMAgBMB2JZgCsACFw49q7bc63VG5HwAD+n8WaeINYGD7UHNVhHgqIfcSP6rp681Izfj9Oz7IBYulJScF+QkjR0pNfIjj7NhSf7N6SLWrR1GsYhu8ZASqcP21yP+94Ol5kwedu/sfZp6dIJIAH375iiUhwbZ2eQAA=";
  const COMO_LLEGAR = "https://maps.app.goo.gl/73N6ZAft7J7c33tq9";
  const INSTAGRAM = "https://www.instagram.com/suncar.srl";
  const USUARIO = "suncar.srl";
  const ALT = "Oficinas de SUNCAR en Ave. 3ra y Calle 2, Miramar, con paneles solares en la azotea";

  const datos = useContacto();
  const contacto = $derived(datos.contacto);
  let meGusta = $state(false);
  let ampliada = $state(false);


  $effect(() => {
    if (!ampliada) return;
    const teclado = (e: KeyboardEvent) => {
      if (e.key === "Escape") ampliada = false;
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", teclado);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", teclado);
    };
  });
</script>

<section class="py-16 lg:py-20 bg-[#F2F2EF]">
  <div class="container mx-auto px-4 md:px-6 lg:px-8">
    <div class="text-center mb-8">
      <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
        Visita nuestras{" "}
        <span class="bg-gradient-to-r from-[#AFEB17] to-[#F2C300] text-[#012928] px-2 rounded-lg box-decoration-clone">
          oficinas
        </span>
      </h2>
    </div>

    <article class="mx-auto max-w-4xl overflow-hidden rounded-xl border border-[#dbdbdb] bg-white text-[#0f1419] shadow-lg">
      <header class="flex items-center gap-3 px-3.5 py-3">
        <a
          href={INSTAGRAM}
          target="_blank"
          rel="noopener noreferrer"
          class="shrink-0 rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] p-[2px]"
          aria-label={`Instagram de ${USUARIO}`}
        >
          <span class="block rounded-full bg-white p-[2px]">
            <img src={optimizedImage("/images/logo-icon.webp", 64)} alt="" width="32" height="32" decoding="async" class="h-8 w-8 rounded-full object-contain" />
          </span>
        </a>
        <div class="min-w-0 flex-1 leading-tight">
          <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" class="text-sm font-semibold hover:opacity-60">
            {USUARIO}
          </a>
          <a href={COMO_LLEGAR} target="_blank" rel="noopener noreferrer" class="block truncate text-xs hover:opacity-60">
            3ra y 2, Miramar, Playa
          </a>
        </div>
        <MoreHorizontal class="h-5 w-5 shrink-0" aria-hidden="true" />
      </header>

      <button
        type="button"
        onclick={() => (ampliada = true)}
        aria-label="Ver la foto a pantalla completa"
        class="group relative block aspect-[16/9] w-full cursor-zoom-in bg-[#efefef]"
      >
        <img
          src={optimizedImage(FOTO_OFICINA, 1080)}
          srcset={imageSrcset(FOTO_OFICINA, [640, 1080, 1600])}
          sizes="(min-width: 896px) 896px, 100vw"
          alt={ALT}
          loading="lazy"
          decoding="async"
          class="absolute inset-0 h-full w-full object-cover"
          style={`background-image: url(${FOTO_OFICINA_BLUR}); background-size: cover;`}
        />
        <span class="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-transform group-hover:scale-110">
          <Maximize2 class="h-4 w-4" />
        </span>
      </button>

      <div class="flex items-center gap-4 px-3.5 pt-3">
        <button
          type="button"
          onclick={() => (meGusta = !meGusta)}
          aria-pressed={meGusta}
          aria-label="Me gusta"
          class="transition-transform active:scale-125 hover:opacity-60"
        >
          <Heart class={`h-6 w-6 transition-colors ${meGusta ? "fill-[#ff3040] text-[#ff3040]" : ""}`} />
        </button>
        <a
          href={`https://wa.me/${contacto.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escríbenos por WhatsApp"
          class="hover:opacity-60"
        >
          <MessageCircle class="h-6 w-6 -scale-x-100" />
        </a>
        <a href={COMO_LLEGAR} target="_blank" rel="noopener noreferrer" aria-label="Cómo llegar" class="hover:opacity-60">
          <Send class="h-6 w-6" />
        </a>
        <Bookmark class="ml-auto h-6 w-6" aria-hidden="true" />
      </div>

      <div class="space-y-1.5 px-3.5 pb-4 pt-2.5 text-sm">
        <p class="font-semibold">
          {meGusta ? "A ti y a muchos clientes les gusta esto" : "Les gusta a muchos clientes"}
        </p>
        <p class="leading-relaxed">
          <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" class="mr-1.5 font-semibold">{USUARIO}</a>
          ☀️ Nuestra oficina también funciona con el sol. Pasa por 3ra y 2 en Playa, conoce los inversores, baterías
          y paneles en funcionamiento y llévate tu propuesta personalizada.{" "}
          <span class="text-[#00376b]">#EnergíaSolar #Cuba #Miramar #SUNCAR</span>
        </p>
        <p class="text-[#737373]">📍 {contacto.direccion}</p>
        <div class="flex flex-wrap gap-x-4 gap-y-1 pt-1">
          <a href={COMO_LLEGAR} target="_blank" rel="noopener noreferrer" class="font-semibold text-[#0095f6] hover:text-[#00376b]">
            <MapPin class="mr-1 inline h-4 w-4 align-[-3px]" />
            Cómo llegar
          </a>
          <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" class="text-[#737373] hover:text-[#0f1419]">
            Ver más en Instagram
          </a>
        </div>
      </div>
    </article>
  </div>
</section>

{#if ampliada}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div
    use:portal
    role="dialog"
    aria-modal="true"
    aria-label="Foto de nuestras oficinas"
    onclick={() => (ampliada = false)}
    class="fixed inset-0 z-[80] flex cursor-zoom-out items-center justify-center bg-[rgba(0,0,0,0.94)] p-2 sm:p-6"
  >
    <div class="relative aspect-[16/9] max-h-full w-full max-w-[min(100%,calc((100vh-3rem)*16/9))]">
      <img src={optimizedImage(FOTO_OFICINA, 1920)} srcset={imageSrcset(FOTO_OFICINA, [1080, 1600])} sizes="100vw" alt={ALT} decoding="async" class="absolute inset-0 h-full w-full object-contain" />
    </div>
    <button
      type="button"
      onclick={() => (ampliada = false)}
      aria-label="Cerrar"
      class="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
    >
      <X class="h-6 w-6" />
    </button>
  </div>
{/if}
