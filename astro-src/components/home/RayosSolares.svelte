<script lang="ts">
  interface Props {
    contenedor: HTMLElement | null;
  }
  let { contenedor }: Props = $props();

  type Punto = { x: number; y: number };

  const SOL = "hotspot-sol";
  const PANELES = ["hotspot-paneles-1", "hotspot-paneles-2"];
  const DURACION_MS = 900;
  const PAUSA_MIN_MS = 600;
  const PAUSA_EXTRA_MS = 1100;
  const ANCHO_SOL = 3;
  const ANCHO_PANEL = 24;

  let gradientes: (SVGLinearGradientElement | null)[] = [null, null];
  let haces: (SVGPolygonElement | null)[] = [null, null];
  let nucleos: (SVGLineElement | null)[] = [null, null];
  let impactos: (SVGCircleElement | null)[] = [null, null];

  // $effect y no onMount: este componente monta antes de que el padre asigne
  // `contenedor` (bind:this), así que hay que esperar a que deje de ser null.
  $effect(() => {
    const cont = contenedor;
    if (!cont) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(cont);

    const viewer = cont.querySelector("model-viewer") as
      | (HTMLElement & { queryHotspot?: (n: string) => { canvasPosition: Punto } | null })
      | null;
    const punto = (nombre: string): Punto | null => {
      const h = viewer?.queryHotspot?.(nombre);
      if (!viewer || !h) return null;
      const v = viewer.getBoundingClientRect();
      const c = cont.getBoundingClientRect();
      return { x: v.left - c.left + h.canvasPosition.x, y: v.top - c.top + h.canvasPosition.y };
    };
    const ocultar = (i: number) => {
      haces[i]?.setAttribute("opacity", "0");
      nucleos[i]?.setAttribute("opacity", "0");
      impactos[i]?.setAttribute("opacity", "0");
    };

    const siguiente = PANELES.map((_, i) => performance.now() + 900 + i * 600);
    const inicio = PANELES.map(() => -1);
    let raf = 0;

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const sol = punto(SOL);
      PANELES.forEach((nombre, i) => {
        if (inicio[i] < 0) {
          if (t < siguiente[i]) return ocultar(i);
          inicio[i] = t;
        }
        const p = (t - inicio[i]) / DURACION_MS;
        if (p >= 1) {
          inicio[i] = -1;
          siguiente[i] = t + PAUSA_MIN_MS + Math.random() * PAUSA_EXTRA_MS;
          return ocultar(i);
        }
        const panel = punto(nombre);
        if (!sol || !panel) return ocultar(i);
        const dx = panel.x - sol.x;
        const dy = panel.y - sol.y;
        const largo = Math.hypot(dx, dy);
        if (largo < 30) return ocultar(i);
        const envolvente = Math.pow(Math.sin(Math.PI * p), 0.8);
        const brillo = envolvente * (0.92 + Math.random() * 0.08);
        const nx = -dy / largo;
        const ny = dx / largo;
        const a = ANCHO_SOL / 2;
        const b = (ANCHO_PANEL / 2) * (0.7 + 0.3 * envolvente);
        haces[i]?.setAttribute(
          "points",
          `${sol.x + nx * a},${sol.y + ny * a} ${panel.x + nx * b},${panel.y + ny * b} ${panel.x - nx * b},${panel.y - ny * b} ${sol.x - nx * a},${sol.y - ny * a}`,
        );
        const g = gradientes[i];
        g?.setAttribute("x1", String(sol.x));
        g?.setAttribute("y1", String(sol.y));
        g?.setAttribute("x2", String(panel.x));
        g?.setAttribute("y2", String(panel.y));
        const n = nucleos[i];
        n?.setAttribute("x1", String(sol.x));
        n?.setAttribute("y1", String(sol.y));
        n?.setAttribute("x2", String(panel.x));
        n?.setAttribute("y2", String(panel.y));
        const c = impactos[i];
        c?.setAttribute("cx", String(panel.x));
        c?.setAttribute("cy", String(panel.y));
        c?.setAttribute("r", String(10 + 22 * envolvente));
        haces[i]?.setAttribute("opacity", String(brillo * 0.85));
        n?.setAttribute("opacity", String(brillo * 0.6));
        c?.setAttribute("opacity", String(brillo));
      });
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  });
</script>

<svg class="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible" aria-hidden="true">
  <defs>
    <filter id="haz-difuso" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.2" />
    </filter>
    <radialGradient id="haz-impacto">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.95" />
      <stop offset="0.35" stop-color="#FFE08A" stop-opacity="0.7" />
      <stop offset="0.75" stop-color="#B07CFF" stop-opacity="0.3" />
      <stop offset="1" stop-color="#B07CFF" stop-opacity="0" />
    </radialGradient>
    {#each PANELES as nombre, i (nombre)}
      <linearGradient id={`haz-color-${i}`} bind:this={gradientes[i]} gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FFF4C2" stop-opacity="0.95" />
        <stop offset="0.55" stop-color="#FFD84A" stop-opacity="0.6" />
        <stop offset="1" stop-color="#B07CFF" stop-opacity="0.45" />
      </linearGradient>
    {/each}
  </defs>
  {#each PANELES as nombre, i (nombre)}
    <g>
      <polygon bind:this={haces[i]} opacity="0" fill={`url(#haz-color-${i})`} filter="url(#haz-difuso)" />
      <line bind:this={nucleos[i]} opacity="0" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round" />
      <circle bind:this={impactos[i]} opacity="0" r="10" fill="url(#haz-impacto)" />
    </g>
  {/each}
</svg>
