<script lang="ts">
  import { onMount } from "svelte";
  import ArrowRight from "lucide-svelte/icons/arrow-right";
  import Sparkles from "lucide-svelte/icons/sparkles";
  import { imageSrcset, optimizedImage } from "@/lib/image";

  // Reescrito de kits-section.tsx: framer-motion (stagger, spring) se
  // reemplaza por transiciones CSS + un IntersectionObserver; el resultado
  // visual es el mismo (ecuación que aparece término a término, kit que
  // "se enciende", brillo que barre la silueta) sin librería de animación.
  const terminos = [
    { nombre: "Inversor", src: "/equipos/inversor-felicity-5kw.webp", width: 266, height: 360 },
    { nombre: "Batería", src: "/equipos/bateria-felicity-fla48100-5kwh.webp", width: 220, height: 360 },
    { nombre: "Paneles", src: "/equipos/panel.webp", width: 216, height: 360 },
    { nombre: "Elementos varios", src: "/equipos/gabinete.webp", width: 257, height: 240 },
  ];

  const chispas = [
    { x: "8%", y: "70%", d: 5.5, r: 0, c: "#AFEB17" },
    { x: "18%", y: "30%", d: 6.5, r: 1.8, c: "#F2C300" },
    { x: "30%", y: "85%", d: 5, r: 3.1, c: "#AFEB17" },
    { x: "52%", y: "15%", d: 7, r: 0.9, c: "#F2C300" },
    { x: "68%", y: "78%", d: 6, r: 2.4, c: "#AFEB17" },
    { x: "82%", y: "40%", d: 5.8, r: 4, c: "#F2C300" },
    { x: "92%", y: "65%", d: 6.8, r: 1.2, c: "#AFEB17" },
    { x: "44%", y: "55%", d: 7.5, r: 3.6, c: "#F2C300" },
  ];

  const KIT = "/images/home/kit-solar.webp";
  // La máscara del destello se pide siempre a 480px: el navegador la descarga aparte
  // de la <img> (las máscaras CSS van por CORS), así que mejor una pequeña. Solo
  // recorta el brillo, no hace falta resolución.
  const MASCARA = `url(${optimizedImage(KIT, 480)})`;
  const ENCENDIDO = 1.55;

  let seccion: HTMLElement | null = $state(null);
  let enVista = $state(false);
  let sinMovimiento = $state(false);
  const visible = $derived(enVista || sinMovimiento);
  const animar = $derived(enVista && !sinMovimiento);

  onMount(() => {
    sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!seccion) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          enVista = true;
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(seccion);
    return () => io.disconnect();
  });
</script>

<section bind:this={seccion} class="relative overflow-hidden bg-[#012928] text-white">
  <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_70%_50%,black,transparent_70%)]"></div>

  <div class="container relative mx-auto grid items-center gap-10 px-6 py-14 md:grid-cols-2 md:gap-8 md:px-8 lg:py-16">
    <div>
      <p class="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
        <span class="h-px w-10 bg-white/30"></span>
        Kits fotovoltaicos
      </p>

      <h2 class="mt-5 text-4xl font-bold leading-[0.95] tracking-tight lg:text-5xl xl:text-6xl">
        Un kit.
        <span class="block text-white/35">Cero apagones.</span>
      </h2>

      <div
        class="mt-8 max-w-md"
        aria-label="Inversor más batería más paneles más elementos varios es igual a tu próximo kit"
      >
        <div class="flex items-start justify-between gap-1" aria-hidden="true">
          {#each terminos as t, i (t.nombre)}
            {#if i > 0}
              <span
                class="flex h-14 items-center text-lg font-light text-white/40 transition-all duration-500 lg:h-16"
                style={`opacity: ${visible ? 1 : 0}; transform: ${visible ? "none" : "rotate(-90deg) scale(0.3)"}; transition-delay: ${i * 180}ms;`}
              >
                +
              </span>
            {/if}
            <div
              class="flex w-14 flex-col items-center gap-2 transition-all duration-700 lg:w-16"
              style={`opacity: ${visible ? 1 : 0}; transform: ${visible ? "none" : "translateY(14px) scale(0.9)"}; filter: ${visible ? "none" : "blur(8px)"}; transition-delay: ${100 + i * 180}ms;`}
            >
              <div
                class="flex h-14 w-14 items-center justify-center rounded-2xl border bg-white/[0.04] backdrop-blur-sm lg:h-16 lg:w-16"
                style={`border-color: rgba(255,255,255,0.1); ${animar ? `animation: kit-destello 1.1s ease-out ${100 + i * 180}ms 1;` : ""}`}
              >
                <img
                  src={optimizedImage(t.src, 128)}
                  srcset={imageSrcset(t.src, [64, 128, 256])}
                  sizes="64px"
                  alt=""
                  width={t.width}
                  height={t.height}
                  loading="lazy"
                  decoding="async"
                  class="h-[62%] w-auto object-contain"
                />
              </div>
              <span class="text-center text-[11px] font-semibold leading-tight text-white/70">{t.nombre}</span>
            </div>
          {/each}
        </div>

        <div class="mt-5 flex items-baseline gap-3" aria-hidden="true">
          <span
            class="text-3xl font-light text-white/40 transition-all duration-500"
            style={`opacity: ${visible ? 1 : 0}; transform: ${visible ? "none" : "rotate(-90deg) scale(0.3)"}; transition-delay: 800ms;`}
          >
            =
          </span>
          <span class="flex gap-[0.25em] text-3xl font-bold tracking-tight lg:text-4xl">
            {#each ["Tu", "próximo", "kit"] as palabra, i (palabra)}
              <span
                class={`inline-block transition-all duration-[600ms] ${palabra === "kit" ? "bg-gradient-to-r from-[#AFEB17] to-[#F2C300] bg-clip-text text-transparent" : ""}`}
                style={`opacity: ${visible ? 1 : 0}; transform: ${visible ? "none" : "translateY(70%)"}; filter: ${visible ? "none" : "blur(10px)"}; transition-delay: ${950 + i * 90}ms;`}
              >
                {palabra}
              </span>
            {/each}
          </span>
        </div>
      </div>

      <div class="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
        <a
          href="/ofertas"
          class="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-[#012928] transition-transform duration-300 hover:-translate-y-0.5"
        >
          Ver kits
          <ArrowRight class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
        <a href="/ofertas?modo=armar" class="group relative inline-flex overflow-hidden rounded-full p-px">
          <span
            aria-hidden="true"
            class="absolute left-1/2 top-1/2 aspect-square w-[160%] bg-[conic-gradient(from_0deg,#AFEB17,#F2C300,#ffffff,#AFEB17)]"
            style={`transform: translate(-50%, -50%); ${sinMovimiento ? "" : "animation: kit-giro 4s linear infinite;"}`}
          ></span>
          <span class="relative inline-flex items-center gap-2 rounded-full bg-[#012928] px-6 py-3.5 font-semibold text-white transition-colors duration-300 group-hover:bg-[#023b39]">
            <Sparkles class="h-4 w-4 text-[#F2C300]" />
            Kit sugerido para ti con IA
          </span>
        </a>
      </div>
    </div>

    <div class="relative mx-auto w-full max-w-[340px] md:max-w-[500px]">
      <div
        class="pointer-events-none absolute -inset-[10%] rounded-full bg-[radial-gradient(closest-side,rgba(242,195,0,0.22),rgba(175,235,23,0.08)_55%,transparent)]"
        style={animar ? `animation: kit-halo 6s ease-in-out ${ENCENDIDO}s infinite alternate;` : "opacity: 0.7;"}
      ></div>

      {#each chispas as c, i (i)}
        <span
          class="pointer-events-none absolute h-1 w-1 rounded-full"
          style={`left: ${c.x}; top: ${c.y}; background-color: ${c.c}; box-shadow: 0 0 8px ${c.c}; opacity: 0; ${animar ? `animation: kit-chispa ${c.d}s ease-out ${ENCENDIDO + c.r}s infinite;` : ""}`}
        ></span>
      {/each}

      <div class="relative" style={animar ? `animation: kit-flota 6s ease-in-out ${ENCENDIDO}s infinite;` : ""}>
        <img
          src={optimizedImage(KIT, 750)}
          srcset={imageSrcset(KIT, [480, 750, 1080])}
          sizes="(min-width: 1024px) 600px, 100vw"
          alt="Kit solar completo: paneles fotovoltaicos, inversor y batería Felicity Solar"
          loading="lazy"
          decoding="async"
          class="relative h-auto w-full"
        />

        <div
          class="pointer-events-none absolute inset-0 overflow-hidden"
          style={`-webkit-mask-image: ${MASCARA}; mask-image: ${MASCARA}; -webkit-mask-size: 100% 100%; mask-size: 100% 100%;`}
        >
          <div
            class="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent"
            style={animar ? `animation: kit-barrido 6.4s cubic-bezier(0.45, 0, 0.2, 1) ${ENCENDIDO}s infinite;` : ""}
          ></div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  @keyframes kit-destello {
    0% { box-shadow: 0 0 0 0 rgba(175, 235, 23, 0); border-color: rgba(255, 255, 255, 0.1); }
    35% { box-shadow: 0 0 28px 2px rgba(175, 235, 23, 0.45); border-color: rgba(175, 235, 23, 0.8); }
    100% { box-shadow: 0 0 0 0 rgba(175, 235, 23, 0); border-color: rgba(255, 255, 255, 0.1); }
  }
  @keyframes kit-giro {
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
  @keyframes kit-halo {
    0% { opacity: 0.45; transform: scale(0.85); }
    12% { opacity: 1; transform: scale(1.08); }
    40% { opacity: 0.7; transform: scale(1); }
    70% { opacity: 0.9; transform: scale(1.03); }
    100% { opacity: 0.7; transform: scale(1); }
  }
  @keyframes kit-chispa {
    0% { opacity: 0; transform: translateY(0); }
    50% { opacity: 0.9; }
    100% { opacity: 0; transform: translateY(-46px); }
  }
  @keyframes kit-flota {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  @keyframes kit-barrido {
    0% { transform: translateX(0) skewX(-12deg); }
    22% { transform: translateX(400%) skewX(-12deg); }
    100% { transform: translateX(400%) skewX(-12deg); }
  }
</style>
