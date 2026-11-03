<script lang="ts">
  // Casa en corte dibujada a mano, sin imágenes: unos pocos KB que llegan en el
  // HTML y escalan nítidos en cualquier pantalla. Solo lleva lo que se vende:
  // paneles, cableado, inversor, baterías, protecciones, electrodomésticos y
  // material. El realismo sale de la luz (cielo claro, lámparas cálidas dentro),
  // no de añadir objetos.
  //
  // La composición (bloques, plantas, dónde va cada equipo) llega en `diseno`:
  // hay una vertical para móvil y otra apaisada para escritorio (disenos.ts).
  import type { Snippet } from "svelte";
  import type { Equipo, Escenario } from "@/components/tienda/disenos";
  import type { ZonaId } from "@/components/tienda/zonas";
  import s from "./casa-solar.module.css";
  import DibujoEquipo from "./DibujoEquipo.svelte";
  import { ZONA_DE, geometria, linea } from "./casaGeometria";

  interface Props {
    diseno: Escenario;
    /** Zona resaltada; el resto de componentes se atenúa. */
    activa?: ZonaId | null;
    /** Evita ids repetidos si hay más de una casa en la página. */
    prefijo: string;
    class?: string;
    /** Clase del dibujo (cielo, terreno y casa), sin lo que va en children. */
    dibujoClass?: string;
    preserveAspectRatio?: string;
    /** Lo que se dibuja encima, en el mismo sistema de coordenadas. */
    children?: Snippet;
  }
  let {
    diseno,
    activa = null,
    prefijo,
    class: className = "",
    dibujoClass,
    preserveAspectRatio,
    children,
  }: Props = $props();

  const id = (n: string) => `${prefijo}-${n}`;
  const url = (n: string) => `url(#${id(n)})`;
  const claseZona = (z: ZonaId | undefined) =>
    z && activa ? (activa === z ? s.resaltada : s.atenuada) : undefined;
  const filtroZona = (z: ZonaId | undefined) => (z && activa === z ? url("brillo") : undefined);

  const suelo = $derived(diseno.suelo);
  const caja = $derived(diseno.caja);
  const bloques = $derived(diseno.bloques);
  const geos = $derived(
    bloques.map((b) => geometria(b, bloques.some((o) => o !== b && o.x1 + 16 === b.x0 - 16), suelo)),
  );
  const cablesDc = $derived([...diseno.cablesSolar, ...diseno.cablesBateria]);
  const minX = $derived(Math.min(...bloques.map((b) => b.x0 - 16)));
  const maxX = $derived(Math.max(...bloques.map((b) => b.x1 + 16)));

  /** Juntas del suelo en perspectiva. */
  const juntas = (x0: number, x1: number, abajo: number) =>
    Array.from({ length: 9 }, (_, i) => {
      const t = (i + 1) / 10;
      return linea([x0 + (x1 - x0) * t, abajo], [x0 + 16 + (x1 - x0 - 32) * t, abajo - 16]);
    }).join("");

  // Orden de dibujo: los de pared van detrás de la casa, el resto delante.
  const DELANTE: Equipo[] = ["estante", "ventilador", "nevera", "breaker", "baterias", "inversor"];
</script>

{#snippet colocar(equipo: Equipo)}
  {#each diseno.equipos.filter((e) => e.equipo === equipo) as e, i (`${equipo}-${i}`)}
    {@const z = ZONA_DE[equipo]}
    <g
      transform={`translate(${e.x} ${e.y})`}
      data-zona={z}
      class={claseZona(z)}
      filter={filtroZona(z)}
    >
      <DibujoEquipo {equipo} {prefijo} />
    </g>
  {/each}
{/snippet}

<svg
  viewBox={`${caja.x} ${caja.y} ${caja.w} ${caja.h}`}
  {preserveAspectRatio}
  class={`${s.casa} ${className}`}
  role="img"
  aria-label="Casa con sistema solar: paneles, inversor, baterías, protecciones, electrodomésticos y material"
>
  <defs>
    <linearGradient id={id("cielo")} x1="0" y1={suelo - 1300} x2="0" y2={suelo + 14} gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#B9D7EA" />
      <stop offset=".75" stop-color="#E3EEF2" />
      <stop offset="1" stop-color="#F4F1EA" />
    </linearGradient>
    <linearGradient id={id("tierra")} x1="0" y1={suelo + 14} x2="0" y2={suelo + 700} gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#6F533D" />
      <stop offset=".08" stop-color="#866750" />
      <stop offset="1" stop-color="#4F3B2D" />
    </linearGradient>
    <linearGradient id={id("acera")} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#CFC9BE" />
      <stop offset="1" stop-color="#A49D91" />
    </linearGradient>
    <linearGradient id={id("concreto")} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#E2DDD3" />
      <stop offset="1" stop-color="#C3BDB1" />
    </linearGradient>
    <linearGradient id={id("muro")} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#CFC9BE" />
      <stop offset=".5" stop-color="#DED9CF" />
      <stop offset="1" stop-color="#C9C3B7" />
    </linearGradient>
    <linearGradient id={id("azotea")} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#A9A398" />
      <stop offset="1" stop-color="#CCC6BB" />
    </linearGradient>
    <linearGradient id={id("pared")} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#EFEAE1" />
      <stop offset=".35" stop-color="#F8F5EF" />
      <stop offset="1" stop-color="#EDE8DF" />
    </linearGradient>
    <linearGradient id={id("rincon-arriba")} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3A3024" stop-opacity=".22" />
      <stop offset="1" stop-color="#3A3024" stop-opacity="0" />
    </linearGradient>
    <linearGradient id={id("rincon-izq")} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3A3024" stop-opacity=".16" />
      <stop offset="1" stop-color="#3A3024" stop-opacity="0" />
    </linearGradient>
    <linearGradient id={id("rincon-der")} x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#3A3024" stop-opacity=".16" />
      <stop offset="1" stop-color="#3A3024" stop-opacity="0" />
    </linearGradient>
    <linearGradient id={id("madera")} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#A9865F" />
      <stop offset="1" stop-color="#C7A57E" />
    </linearGradient>
    <linearGradient id={id("losa")} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#CFCAC1" />
      <stop offset="1" stop-color="#E4E0D8" />
    </linearGradient>
    <linearGradient id={id("cono")} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFE7A0" stop-opacity=".5" />
      <stop offset="1" stop-color="#FFE7A0" stop-opacity="0" />
    </linearGradient>
    <linearGradient id={id("pantalla")} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3D4A4A" />
      <stop offset="1" stop-color="#1E2727" />
    </linearGradient>
    <linearGradient id={id("panel")} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3A5078" />
      <stop offset=".55" stop-color="#1D2B46" />
      <stop offset="1" stop-color="#111A2C" />
    </linearGradient>
    <linearGradient id={id("reflejo")} x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".28" />
      <stop offset=".4" stop-color="#fff" stop-opacity="0" />
    </linearGradient>
    <linearGradient id={id("aluminio")} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#9AA1A8" />
      <stop offset=".5" stop-color="#D6DBE0" />
      <stop offset="1" stop-color="#8E959C" />
    </linearGradient>
    <linearGradient id={id("equipo")} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FDFDFD" />
      <stop offset=".75" stop-color="#ECEFF2" />
      <stop offset="1" stop-color="#D2D8DE" />
    </linearGradient>
    <linearGradient id={id("tapa")} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFFFFF" />
      <stop offset="1" stop-color="#E6E9EC" />
    </linearGradient>
    <linearGradient id={id("vista")} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9EC6E2" />
      <stop offset="1" stop-color="#DCEBF3" />
    </linearGradient>
    <linearGradient id={id("vidrio")} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".55" />
      <stop offset=".35" stop-color="#fff" stop-opacity="0" />
      <stop offset=".55" stop-color="#fff" stop-opacity=".18" />
      <stop offset=".7" stop-color="#fff" stop-opacity="0" />
    </linearGradient>
    <radialGradient id={id("contacto")}>
      <stop offset="0" stop-color="#2B2218" stop-opacity=".38" />
      <stop offset="1" stop-color="#2B2218" stop-opacity="0" />
    </radialGradient>
    <filter id={id("difuso")} x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3.5" />
    </filter>
    <filter id={id("brillo")} x="-30%" y="-30%" width="160%" height="160%">
      <feFlood flood-color="#F2C300" flood-opacity=".95" />
      <feComposite operator="in" in2="SourceAlpha" />
      <feGaussianBlur stdDeviation="5" />
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <g class={dibujoClass}>
    <!-- Cielo -->
    <rect x="-4000" y="-4000" width="9000" height={4000 + suelo + 14} fill={url("cielo")} />

    <!-- Terreno en corte y acera -->
    <rect x="-4000" y={suelo + 14} width="9000" height="4000" fill={url("tierra")} />
    <rect x="-4000" y={suelo + 4} width="9000" height="12" fill={url("acera")} />
    <rect x="-4000" y={suelo + 4} width="9000" height="1.5" fill="#E4DFD6" />
    <!-- Sombra de la casa sobre la acera, con la luz desde la derecha -->
    <polygon
      points={`${minX - 12},${suelo + 5} ${minX - 96},${suelo + 5} ${minX - 66},${suelo + 15} ${minX - 12},${suelo + 15}`}
      fill="#2B2218"
      opacity=".18"
      filter={url("difuso")}
    />
    <ellipse cx={(minX + maxX) / 2} cy={suelo + 16} rx={(maxX - minX) / 2 + 20} ry="7" fill={url("contacto")} />

    <!-- Interiores -->
    {#each bloques as b, bi (bi)}
      {#each b.cuartos as c, ci (ci)}
        {@const fondo = c.abajo - 16}
        {@const alto = c.abajo - c.arriba}
        <g>
          <rect x={b.x0} y={c.arriba} width={b.x1 - b.x0} height={alto} fill={url("pared")} />
          <polygon
            points={`${b.x0},${c.abajo} ${b.x1},${c.abajo} ${b.x1 - 16},${fondo} ${b.x0 + 16},${fondo}`}
            fill={url(c.suelo)}
          />
          <path
            d={juntas(b.x0, b.x1, c.abajo)}
            stroke="#000"
            stroke-opacity={c.suelo === "madera" ? 0.1 : 0.06}
            stroke-width="1"
          />
          <rect x={b.x0} y={c.arriba} width={b.x1 - b.x0} height="46" fill={url("rincon-arriba")} />
          <rect x={b.x0} y={c.arriba} width="34" height={alto} fill={url("rincon-izq")} />
          <rect x={b.x1 - 34} y={c.arriba} width="34" height={alto} fill={url("rincon-der")} />
        </g>
      {/each}
    {/each}

    {@render colocar("ventana")}

    <!-- Lámparas: luz cálida en cono -->
    {#each diseno.lamparas as [x, y], i (i)}
      <g>
        <polygon
          points={`${x - 10},${y + 42} ${x + 10},${y + 42} ${x + 62},${y + 170} ${x - 62},${y + 170}`}
          fill={url("cono")}
        />
        <path d={`M${x} ${y}V${y + 30}`} stroke="#2F3A3A" stroke-width="1.5" />
        <path d={`M${x - 13} ${y + 42}l5-12h16l5 12z`} fill={url("pantalla")} />
        <ellipse cx={x} cy={y + 42} rx="7" ry="2.5" fill="#FFF3C4" />
      </g>
    {/each}

    <!-- Muros, losas, cimientos y azoteas en corte -->
    {#each geos as g, i (i)}
      <g>
        {#each g.muros as m, j (j)}
          <rect x={m.x} y={m.y} width={m.w} height={m.h} fill={url("muro")} />
        {/each}
        {#each g.losas as l, j (j)}
          <g>
            <rect x={l.x} y={l.y} width={l.w} height={l.h} fill={url("concreto")} />
            <path d={`M${l.x} ${l.y + 0.5}h${l.w}`} stroke="#F2EFE9" stroke-width="1.5" />
          </g>
        {/each}
        <rect x={g.cubierta.x} y={g.techo - 20} width={g.cubierta.w} height="20" fill={url("concreto")} />
        <path d={`M${g.cubierta.x} ${g.techo - 19.5}h${g.cubierta.w}`} stroke="#F2EFE9" stroke-width="1.5" />
        <polygon points={g.azotea} fill={url("azotea")} />
      </g>
    {/each}
    <rect x={minX - 12} y={suelo} width={maxX - minX + 24} height="14" fill={url("concreto")} />
    <path d={`M${minX - 12} ${suelo + 0.5}H${maxX + 12}`} stroke="#F2EFE9" stroke-width="1.5" />

    <!-- Cableado -->
    <g
      data-zona="cableado"
      class={claseZona("cableado")}
      filter={filtroZona("cableado")}
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <g stroke="#262A2E" stroke-opacity=".55" stroke-width="3.5">
        {#each cablesDc.concat(diseno.cablesAc) as d, i (i)}
          <path {d} />
        {/each}
      </g>
      <g stroke="#F2B200" stroke-width="1.8" class={s.flujo}>
        {#each cablesDc as d, i (i)}
          <path {d} />
        {/each}
      </g>
      <g stroke="#8BCB12" stroke-width="1.8" class={`${s.flujo} ${s.flujoAc}`}>
        {#each diseno.cablesAc as d, i (i)}
          <path {d} />
        {/each}
      </g>
    </g>

    <!-- Paneles: estructura de aluminio, módulos, celdas y reflejo del cielo -->
    <g data-zona="paneles" class={claseZona("paneles")} filter={filtroZona("paneles")}>
      {#each geos as g, i (i)}
        <g>
          <path d={g.patas} stroke="#7C838A" stroke-width="3.5" stroke-linecap="round" fill="none" />
          <polygon points={g.sombraPaneles} fill="#000" opacity=".22" filter={url("difuso")} />
          {#each g.paneles.paneles as p, k (k)}
            <polygon
              points={p}
              fill={url("panel")}
              stroke={url("aluminio")}
              stroke-width="2.5"
              stroke-linejoin="round"
            />
          {/each}
          <path d={g.paneles.celdas} stroke="#8EA6D4" stroke-opacity=".16" stroke-width=".8" />
          <polygon points={g.paneles.contorno} fill={url("reflejo")} />
        </g>
      {/each}
    </g>

    {#each DELANTE as equipo (equipo)}
      {@render colocar(equipo)}
    {/each}
  </g>

  {@render children?.()}
</svg>
