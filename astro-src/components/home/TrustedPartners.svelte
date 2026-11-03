<script lang="ts">
  import { onMount } from "svelte";
  import ArrowRight from "lucide-svelte/icons/arrow-right";
  import X from "lucide-svelte/icons/x";
  import { portal } from "~/lib/portal";
  import { imageSrcset, optimizedImage } from "@/lib/image";

  // GIF transparente de 1x1: el <img> de respaldo de los <picture> de abajo. Así la
  // variante que no corresponde al tamaño de pantalla (carrusel móvil vs. marquesina
  // de escritorio) no descarga ningún logo, aunque quede oculta con CSS.
  const VACIA = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  const partners = [
    { src: "https://s3.suncarsrl.com/partners/babelidiomas%20(1).png", alt: "Babel Idiomas - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/dorian.png", alt: "Donde Dorian - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/fadiar.png", alt: "Fadiar - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/fournier.png", alt: "Fournier - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/humidores.png", alt: "Humidores - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/kingbar%20(1).png", alt: "King Bar - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/marea%20(1).png", alt: "Marea - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/mercazon.png", alt: "Mercazon - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/milexus.png", alt: "Milexus - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/mioytuyo%20(1).png", alt: "Mío y Tuyo - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/nacional.png", alt: "Hotel Nacional - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/online-tools.svg", alt: "Online Tools - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/onu.png", alt: "ONU - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/rbmarmol%20(1).png", alt: "RB Mármol - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/supermarket23.png", alt: "Supermarket 23 - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/voyacafe%20(1).png", alt: "Voya Café - Cliente de Suncar" },
  ];
  const partnersRow1 = partners.filter((_, i) => i % 2 === 0);
  const partnersRow2 = partners.filter((_, i) => i % 2 !== 0);
  const GRID_SIZE = 9;

  let sectionEl: HTMLElement | null = $state(null);
  let row1: HTMLDivElement | null = $state(null);
  let row2: HTMLDivElement | null = $state(null);
  let slots: number[] = $state(Array.from({ length: GRID_SIZE }, (_, i) => i));
  let fadingSlot: number | null = $state(null);
  let verTodos = $state(false);

  // Rotación de logos del grid móvil
  onMount(() => {
    if (partners.length <= GRID_SIZE) return;
    const interval = setInterval(() => {
      const slotIndex = Math.floor(Math.random() * GRID_SIZE);
      const visibleSet = new Set(slots);
      const hidden = partners.map((_, i) => i).filter((i) => !visibleSet.has(i));
      if (hidden.length === 0) return;
      const nextLogo = hidden[Math.floor(Math.random() * hidden.length)];
      fadingSlot = slotIndex;
      setTimeout(() => {
        const updated = [...slots];
        updated[slotIndex] = nextLogo;
        slots = updated;
        setTimeout(() => (fadingSlot = null), 50);
      }, 800);
    }, 1800);
    return () => clearInterval(interval);
  });

  // Carrusel de dos filas en direcciones opuestas
  onMount(() => {
    if (!row1 || !row2 || !sectionEl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const filas = [
      { el: row1, dir: 1, pausa: false, abajo: false, startX: 0, scrollLeft: 0 },
      { el: row2, dir: -1, pausa: false, abajo: false, startX: 0, scrollLeft: 0 },
    ];
    let animar = true;
    let raf = 0;

    const io = new IntersectionObserver((e) => (animar = Boolean(e[0]?.isIntersecting)), { rootMargin: "150px" });
    io.observe(sectionEl);

    const scroll = () => {
      raf = requestAnimationFrame(scroll);
      if (!animar) return;
      for (const f of filas) {
        if (f.pausa || f.abajo) continue;
        f.el.scrollLeft += f.dir;
        const max = f.el.scrollWidth / 2;
        if (f.dir > 0 && f.el.scrollLeft >= max) f.el.scrollLeft = 0;
        if (f.dir < 0 && f.el.scrollLeft <= 0) f.el.scrollLeft = max;
      }
    };

    const limpiezas: Array<() => void> = [];
    for (const f of filas) {
      const enter = () => (f.pausa = true);
      const leave = () => {
        f.pausa = false;
        f.abajo = false;
      };
      const down = (e: MouseEvent) => {
        f.abajo = true;
        f.startX = e.pageX - f.el.offsetLeft;
        f.scrollLeft = f.el.scrollLeft;
      };
      const up = () => (f.abajo = false);
      const move = (e: MouseEvent) => {
        if (!f.abajo) return;
        e.preventDefault();
        f.el.scrollLeft = f.scrollLeft - (e.pageX - f.el.offsetLeft - f.startX) * 2;
      };
      f.el.addEventListener("mouseenter", enter);
      f.el.addEventListener("mouseleave", leave);
      f.el.addEventListener("mousedown", down);
      f.el.addEventListener("mouseup", up);
      f.el.addEventListener("mousemove", move);
      limpiezas.push(() => {
        f.el.removeEventListener("mouseenter", enter);
        f.el.removeEventListener("mouseleave", leave);
        f.el.removeEventListener("mousedown", down);
        f.el.removeEventListener("mouseup", up);
        f.el.removeEventListener("mousemove", move);
      });
    }

    row2.scrollLeft = row2.scrollWidth / 2;
    raf = requestAnimationFrame(scroll);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      limpiezas.forEach((l) => l());
    };
  });

  $effect(() => {
    if (!verTodos) return;
    const teclado = (e: KeyboardEvent) => {
      if (e.key === "Escape") verTodos = false;
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", teclado);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", teclado);
    };
  });

  function registrarFila(node: HTMLDivElement, n: number) {
    if (n === 1) row1 = node;
    else row2 = node;
  }

  const filaStyle ="scroll-behavior: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; -ms-overflow-style: none;";
</script>

<section bind:this={sectionEl} class="py-12 sm:py-16 lg:py-20 bg-[#F2F2EF] relative overflow-hidden">
  <div class="absolute top-0 right-0 w-96 h-96 bg-[#012928]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>

  <div class="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
    <div class="text-center mb-8 lg:mb-12">
      <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#012928] mb-3 lg:mb-4">Confían en Nosotros</h2>
      <div class="h-1 w-20 bg-secondary-gradient rounded-full mx-auto mb-3"></div>
      <p class="text-sm lg:text-base text-[#012928]/70 max-w-2xl mx-auto leading-relaxed">
        Empresas líderes que han confiado en nuestra experiencia y tecnología solar de vanguardia
      </p>
    </div>

    <div class="block md:hidden max-w-4xl mx-auto">
      <div class="grid grid-cols-3 gap-2 px-2">
        {#each slots as partnerIndex, slotIndex (slotIndex)}
          <div class="flex items-center justify-center p-2">
            <div class="relative w-full h-20">
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcset={imageSrcset(partners[partnerIndex].src, [80, 160, 240]) || partners[partnerIndex].src}
                  sizes="30vw"
                />
                <img
                  src={VACIA}
                  alt={partners[partnerIndex].alt}
                  loading="lazy"
                  decoding="async"
                  class="absolute inset-0 w-full h-full object-contain grayscale-[20%]"
                  style={`opacity: ${fadingSlot !== slotIndex ? 0.85 : 0}; transition: opacity 0.8s ease-in-out;`}
                />
              </picture>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="hidden md:block relative left-1/2 w-screen -translate-x-1/2 space-y-2">
      <div class="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#F2F2EF] via-[#F2F2EF]/80 to-transparent z-10 pointer-events-none"></div>
      <div class="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#F2F2EF] via-[#F2F2EF]/80 to-transparent z-10 pointer-events-none"></div>

      {#each [{ fila: partnersRow1, n: 1 }, { fila: partnersRow2, n: 2 }] as grupo (grupo.n)}
        <div
          use:registrarFila={grupo.n}
          class="overflow-x-scroll scrollbar-hide cursor-grab active:cursor-grabbing"
          style={filaStyle}
        >
          <div class="flex gap-1 lg:gap-2 py-2" style="width: max-content;">
            {#each [0, 1] as copia (copia)}
              {#each grupo.fila as partner, index (`${copia}-${index}`)}
                <div class="flex items-center justify-center flex-shrink-0 w-[160px] lg:w-[200px]">
                  <div class="relative w-full h-28 lg:h-36 group">
                    <div class="absolute inset-0 bg-gradient-to-br from-[#012928]/5 to-[#AFEB17]/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
                    <picture>
                      <source
                        media="(min-width: 768px)"
                        srcset={imageSrcset(partner.src, [160, 200, 320]) || partner.src}
                        sizes="200px"
                      />
                      <img
                        src={VACIA}
                        alt={partner.alt}
                        loading="lazy"
                        decoding="async"
                        draggable="false"
                        class="absolute inset-0 relative w-full h-full object-contain transition-all duration-500 group-hover:scale-105 opacity-85 group-hover:opacity-100 grayscale-[20%] group-hover:grayscale-0"
                      />
                    </picture>
                  </div>
                </div>
              {/each}
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <div class="mt-6 lg:mt-8 flex justify-center">
      <button
        type="button"
        onclick={() => (verTodos = true)}
        class="inline-flex items-center gap-1.5 text-sm lg:text-base font-semibold text-[#012928] underline underline-offset-4 decoration-2 decoration-[#AFEB17] hover:decoration-[#012928] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#012928]/40 rounded-sm"
      >
        Ver más
        <ArrowRight class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>

    <div class="mt-8 lg:mt-12 flex items-center justify-center gap-2">
      <div class="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-gray-300"></div>
      <div class="flex gap-2">
        <div class="w-2 h-2 rounded-full bg-primary/30"></div>
        <div class="w-2 h-2 rounded-full bg-secondary-gradient"></div>
        <div class="w-2 h-2 rounded-full bg-primary/30"></div>
      </div>
      <div class="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-gray-300"></div>
    </div>
  </div>
</section>

{#if verTodos}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div
    use:portal
    role="dialog"
    aria-modal="true"
    aria-label="Confían en Nosotros"
    onclick={(e) => e.target === e.currentTarget && (verTodos = false)}
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
  >
    <div class="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-lg bg-[#F2F2EF] p-6 shadow-lg">
      <button
        type="button"
        onclick={() => (verTodos = false)}
        aria-label="Cerrar"
        class="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
      >
        <X class="h-4 w-4" />
      </button>
      <h3 class="text-2xl font-bold text-[#012928]">Confían en Nosotros</h3>
      <p class="mb-4 text-sm text-[#012928]/70">
        Las empresas que han confiado en nuestra experiencia y tecnología solar
      </p>
      <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {#each partners as partner (partner.src)}
          <li class="flex flex-col items-center gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-[#012928]/5">
            <div class="relative h-20 w-full">
              <img
                src={optimizedImage(partner.src, 160)}
                srcset={imageSrcset(partner.src, [80, 160, 240])}
                sizes="160px"
                alt={partner.alt}
                loading="lazy"
                decoding="async"
                class="absolute inset-0 h-full w-full object-contain"
              />
            </div>
            <span class="text-center text-xs font-medium text-[#012928]/80">
              {partner.alt.replace(/ - Cliente de Suncar$/, "")}
            </span>
          </li>
        {/each}
      </ul>
    </div>
  </div>
{/if}
