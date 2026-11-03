<script lang="ts">
  import { onMount } from "svelte";
  import Phone from "lucide-svelte/icons/phone";
  import Mail from "lucide-svelte/icons/mail";
  import MessageCircle from "lucide-svelte/icons/message-circle";
  import Globe from "lucide-svelte/icons/globe";
  import MapPin from "lucide-svelte/icons/map-pin";
  import UserPlus from "lucide-svelte/icons/user-plus";
  import QrCode from "lucide-svelte/icons/qr-code";
  import Share2 from "lucide-svelte/icons/share-2";
  import Check from "lucide-svelte/icons/check";
  import { imagenResponsive } from "~/lib/imagenes";
  import { optimizedImage } from "@/lib/image";

  interface Redes {
    linkedin?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    web?: string | null;
  }

  interface TarjetaPublica {
    slug: string;
    nombre: string;
    titulo?: string | null;
    empresa: string;
    foto_url?: string | null;
    bio?: string | null;
    telefono?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    sede?: string | null;
    redes: Redes;
    url_publica?: string | null;
    qr_url?: string | null;
    vcard_url?: string | null;
  }

  let { slug }: { slug: string } = $props();

  let tarjeta = $state<TarjetaPublica | null>(null);
  let cargando = $state(true);
  let error = $state<string | null>(null);
  let verQr = $state(false);
  let copiado = $state(false);

  // Deja solo dígitos para el enlace wa.me
  const soloDigitos = (v?: string | null) => (v || "").replace(/[^\d]/g, "");

  const iniciales = (nombre: string) =>
    nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join("");

  // `getBackendUrl()` lee process.env.BACKEND_URL, que no existe en el
  // navegador; aquí solo hace falta la variable que Vite sí inlinea.
  const backendUrl = () =>
    (process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.suncarsrl.com").trim().replace(/\/+$/, "");

  async function cargarTarjeta() {
    try {
      cargando = true;
      const response = await fetch(`${backendUrl()}/api/tarjetas/${slug}`);
      const result = await response.json();
      if (result.success && result.data) {
        tarjeta = result.data;
      } else {
        error = result.message || "Tarjeta no encontrada";
      }
    } catch (err) {
      console.error("Error fetching tarjeta:", err);
      error = "Error de conexión al cargar la tarjeta";
    } finally {
      cargando = false;
    }
  }

  onMount(() => {
    if (slug) void cargarTarjeta();
  });

  async function compartir() {
    const url = tarjeta?.url_publica || window.location.href;
    // Solo title + url (SIN `text`): al pasar text y url juntos, WhatsApp los
    // concatena y el enlace aparece duplicado en el mensaje. Con solo url va una vez.
    const datos = {
      title: tarjeta ? `${tarjeta.nombre} — ${tarjeta.empresa}` : "Tarjeta SunCar",
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(datos);
      } catch {
        /* usuario canceló */
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      copiado = true;
      setTimeout(() => (copiado = false), 2000);
    }
  }

  const whatsappDigits = $derived(soloDigitos(tarjeta?.whatsapp));
  const hayRedes = $derived(
    !!tarjeta?.redes && !!(tarjeta.redes.linkedin || tarjeta.redes.instagram || tarjeta.redes.facebook || tarjeta.redes.web),
  );
  const foto = $derived(tarjeta?.foto_url ? imagenResponsive(tarjeta.foto_url, [256, 384], { quality: 80 }) : null);

  const claseRed =
    "flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-primary hover:text-white";
  const claseUtil =
    "inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200";
</script>

{#if cargando}
  <div class="min-h-screen bg-primary flex items-center justify-center p-4">
    <div class="w-full max-w-md rounded-3xl bg-white/5 border border-white/10 p-8 animate-pulse">
      <div class="mx-auto h-28 w-28 rounded-full bg-white/10"></div>
      <div class="mt-6 mx-auto h-6 w-1/2 rounded bg-white/10"></div>
      <div class="mt-3 mx-auto h-4 w-2/3 rounded bg-white/10"></div>
      <div class="mt-8 space-y-3">
        <div class="h-12 rounded-xl bg-white/10"></div>
        <div class="h-12 rounded-xl bg-white/10"></div>
      </div>
    </div>
  </div>
{:else if error || !tarjeta}
  <div class="min-h-screen bg-primary flex items-center justify-center p-4 text-center">
    <div>
      <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
        <QrCode class="h-8 w-8 text-solar-radiance" />
      </div>
      <h1 class="text-2xl font-bold text-white mb-2">Tarjeta no disponible</h1>
      <p class="text-white/60 mb-8">{error || "No encontramos esta tarjeta de presentación."}</p>
      <a
        href="https://suncarsrl.com"
        class="inline-flex items-center gap-2 rounded-full bg-solar-radiance px-6 py-3 font-semibold text-primary hover:brightness-105 transition"
      >
        Ir a SunCar
      </a>
    </div>
  </div>
{:else}
  {@const t = tarjeta}
  <div class="min-h-screen bg-primary relative overflow-hidden">
    <!-- Glows de fondo con la marca -->
    <div class="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-solar-radiance/20 blur-3xl"></div>
    <div class="pointer-events-none absolute bottom-0 -left-24 h-72 w-72 rounded-full bg-volt-green/10 blur-3xl"></div>

    <div class="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-10">
      <a href="https://suncarsrl.com" class="mb-6">
        <img
          src={optimizedImage("/images/logo-horizontal-white.png", 256)}
          width="438"
          height="120"
          alt="SunCar"
          decoding="async"
          class="h-8 w-auto opacity-90"
        />
      </a>

      <!-- isolate + animación simple (solo opacidad/escala, sin blur): los filtros y
           transforms de la animación anterior rompían el recorte redondeado. -->
      <div class="isolate w-full overflow-hidden rounded-3xl bg-white shadow-2xl animate-fade-in">
        <!-- Portada: verde marca con los brillos pintados como gradientes del PROPIO fondo
             (cero capas con blur: eran las que rompían el recorte y asomaban picos). -->
        <div
          class="relative h-32 overflow-hidden rounded-t-3xl bg-primary"
          style="background-image: radial-gradient(circle at 85% -25%, rgba(242,195,0,0.30), transparent 55%), radial-gradient(circle at -10% 115%, rgba(175,235,23,0.16), transparent 50%);"
        >
          <img
            src={optimizedImage("/images/logo-icon-white.png", 96)}
            width="512"
            height="512"
            alt=""
            decoding="async"
            class="absolute right-4 top-4 h-6 w-auto opacity-60"
          />
          <div class="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-transparent via-solar-radiance to-transparent"></div>
        </div>

        <!-- relative z-10: la portada es position:relative y sin esto pinta por
             encima del avatar que la solapa (la foto se veía "cortada"). -->
        <div class="relative z-10 px-6 pb-6">
          <div class="-mt-16 mb-5 flex justify-center">
            {#if foto && t.foto_url}
              <img
                src={foto.src}
                srcset={foto.srcset}
                sizes={foto.srcset ? "128px" : undefined}
                width="128"
                height="128"
                alt={t.nombre}
                decoding="async"
                class="h-32 w-32 rounded-full border-4 border-white bg-white object-cover object-top shadow-xl ring-1 ring-black/5"
              />
            {:else}
              <div class="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-primary text-4xl font-bold text-white shadow-xl ring-1 ring-black/5">
                {iniciales(t.nombre)}
              </div>
            {/if}
          </div>

          <div class="text-center">
            <h1 class="text-balance text-[1.7rem] font-bold leading-tight tracking-tight text-gray-900">
              {t.nombre}
            </h1>
            {#if t.titulo}
              <p class="mt-1.5 text-[1.05rem] font-semibold text-primary">{t.titulo}</p>
            {/if}

            <div class="mt-4 flex justify-center">
              <span class="inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <img
                  src={optimizedImage("/images/logo-icon.png", 64)}
                  width="512"
                  height="512"
                  alt=""
                  decoding="async"
                  class="h-3.5 w-auto"
                />
                {t.empresa}
              </span>
            </div>

            <!-- Ubicación en su propia línea (soporta direcciones largas) -->
            {#if t.sede}
              <p class="mx-auto mt-3 flex max-w-[17rem] items-start justify-center gap-1.5 text-sm leading-relaxed text-gray-500">
                <MapPin class="mt-0.5 h-4 w-4 shrink-0 text-solar-radiance" />
                <span>{t.sede}</span>
              </p>
            {/if}
          </div>

          {#if t.bio}
            <div class="mx-auto mb-4 mt-5 h-px w-16 bg-gray-200"></div>
            <p class="text-center text-[15px] leading-relaxed text-gray-600">{t.bio}</p>
          {/if}

          <!-- CTA principal: Guardar contacto (vCard) -->
          {#if t.vcard_url}
            <a
              href={t.vcard_url}
              class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-semibold text-white shadow-lg transition hover:brightness-110"
            >
              <UserPlus class="h-5 w-5" />
              Guardar contacto
            </a>
          {/if}

          <!-- Acciones rápidas: se reparten el ancho según cuántas existan -->
          <div class="mt-3 flex gap-3">
            {#if t.telefono}
              <a
                href={`tel:${t.telefono}`}
                class="flex flex-1 flex-col items-center gap-1 rounded-xl border border-gray-200 py-3 text-gray-700 transition hover:border-primary hover:text-primary"
              >
                <Phone class="h-5 w-5" />
                <span class="text-xs font-medium">Llamar</span>
              </a>
            {/if}
            {#if whatsappDigits}
              <a
                href={`https://wa.me/${whatsappDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                class="flex flex-1 flex-col items-center gap-1 rounded-xl border border-gray-200 py-3 text-gray-700 transition hover:border-[#25D366] hover:text-[#25D366]"
              >
                <MessageCircle class="h-5 w-5" />
                <span class="text-xs font-medium">WhatsApp</span>
              </a>
            {/if}
            {#if t.email}
              <a
                href={`mailto:${t.email}`}
                class="flex flex-1 flex-col items-center gap-1 rounded-xl border border-gray-200 py-3 text-gray-700 transition hover:border-primary hover:text-primary"
              >
                <Mail class="h-5 w-5" />
                <span class="text-xs font-medium">Email</span>
              </a>
            {/if}
          </div>

          <!-- Redes sociales. lucide-svelte ya no trae los iconos de marca:
               son los mismos trazos de lucide-react, en línea. -->
          {#if hayRedes}
            <div class="mt-4 flex items-center justify-center gap-3">
              {#if t.redes.linkedin}
                <a href={t.redes.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class={claseRed}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              {/if}
              {#if t.redes.instagram}
                <a href={t.redes.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" class={claseRed}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
              {/if}
              {#if t.redes.facebook}
                <a href={t.redes.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" class={claseRed}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              {/if}
              {#if t.redes.web}
                <a href={t.redes.web} target="_blank" rel="noopener noreferrer" aria-label="Sitio web" class={claseRed}>
                  <Globe class="h-5 w-5" />
                </a>
              {/if}
            </div>
          {/if}

          <!-- Utilidades: QR + Compartir -->
          <div class="mt-6 flex items-center justify-center gap-2 border-t border-gray-100 pt-4">
            {#if t.qr_url}
              <button type="button" onclick={() => (verQr = !verQr)} class={claseUtil}>
                <QrCode class="h-4 w-4" />
                {verQr ? "Ocultar QR" : "Ver QR"}
              </button>
            {/if}
            <button type="button" onclick={compartir} class={claseUtil}>
              {#if copiado}
                <Check class="h-4 w-4 text-green-600" />
                Enlace copiado
              {:else}
                <Share2 class="h-4 w-4" />
                Compartir
              {/if}
            </button>
          </div>

          <!-- El QR lo genera el backend (imagen en qr_url): no hace falta librería. -->
          {#if verQr && t.qr_url}
            <div class="mt-4 flex flex-col items-center gap-2 animate-fade-in">
              <div class="rounded-2xl border border-gray-200 bg-white p-3">
                <img src={t.qr_url} alt={`QR de ${t.nombre}`} decoding="async" class="h-44 w-44" />
              </div>
              <p class="text-xs text-gray-400">Escanea para abrir esta tarjeta</p>
            </div>
          {/if}
        </div>
      </div>

      <a
        href="https://suncarsrl.com"
        class="mt-6 text-xs font-medium text-white/50 transition hover:text-white/80"
      >
        Tarjeta virtual · suncarsrl.com
      </a>
    </div>
  </div>
{/if}
