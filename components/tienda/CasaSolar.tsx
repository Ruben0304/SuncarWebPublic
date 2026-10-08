import { memo, type ReactNode } from "react";
import type { ZonaId } from "./zonas";
import type { Bloque, Equipo, Escenario } from "./disenos";
import s from "./casa-solar.module.css";

// Casa en corte dibujada a mano, sin imágenes: unos pocos KB que llegan en el
// HTML y escalan nítidos en cualquier pantalla. Solo lleva lo que se vende:
// paneles, cableado, inversor, baterías, protecciones, electrodomésticos y
// material. El realismo sale de la luz (cielo claro, lámparas cálidas dentro),
// no de añadir objetos.
//
// La composición (bloques, plantas, dónde va cada equipo) llega en `diseno`:
// hay una vertical para móvil y otra apaisada para escritorio (disenos.ts).
// Cada equipo se dibuja aquí una vez, en coordenadas locales, y se coloca.

type P = [number, number];
type Cuad = [P, P, P, P]; // sup-izq, sup-der, inf-der, inf-izq

const r = (n: number) => Math.round(n * 10) / 10;
const mezcla = (a: P, b: P, t: number): P => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];
const en = (q: Cuad, u: number, v: number): P =>
  mezcla(mezcla(q[0], q[1], u), mezcla(q[3], q[2], u), v);
const pt = ([x, y]: P) => `${r(x)},${r(y)}`;
const linea = (a: P, b: P) => `M${pt(a)}L${pt(b)}`;

/**
 * Módulos sobre su estructura inclinada, en perspectiva y con las celdas.
 * Con `cantidad` se dibujan solo esos, centrados y de dos en dos; si no caben
 * en las columnas del techo, se estrechan.
 */
function generarPaneles(q: Cuad, cols: number, filas: number, cantidad = cols * filas) {
  const hueco = 0.014;
  const usadas = Math.ceil(cantidad / filas);
  const total = Math.max(cols, usadas);
  const margen = (total - usadas) / 2;
  const paneles: string[] = [];
  let celdas = "";
  for (let n = 0; n < cantidad; n++) {
    const c = margen + Math.floor(n / filas);
    const f = n % filas;
    const u0 = c / total + hueco;
    const u1 = (c + 1) / total - hueco;
    const v0 = f / filas + hueco * 2;
    const v1 = (f + 1) / filas - hueco * 2;
    paneles.push(
      [en(q, u0, v0), en(q, u1, v0), en(q, u1, v1), en(q, u0, v1)].map(pt).join(" "),
    );
    for (let i = 1; i < 6; i++) {
      const u = u0 + ((u1 - u0) * i) / 6;
      celdas += linea(en(q, u, v0), en(q, u, v1));
    }
    for (let i = 1; i < 8; i++) {
      const v = v0 + ((v1 - v0) * i) / 8;
      celdas += linea(en(q, u0, v), en(q, u1, v));
    }
  }
  const desde = margen / total;
  const hasta = (margen + usadas) / total;
  return {
    paneles,
    celdas,
    contorno: [en(q, desde, 0), en(q, hasta, 0), en(q, hasta, 1), en(q, desde, 1)]
      .map(pt)
      .join(" "),
  };
}

/** Geometría de un bloque: paredes, losas, azotea y su campo de paneles. */
function geometria(b: Bloque, pegadoIzq: boolean, suelo: number) {
  const techo = b.cuartos[0].arriba;
  const izq = pegadoIzq ? b.x0 - 16 : b.x0 - 24;
  const der = b.x1 + 24;
  const campo: Cuad = [
    [b.x0 + 26, techo - 102],
    [b.x1 - 28, techo - 102],
    [b.x1 - 10, techo - 26],
    [b.x0 + 6, techo - 26],
  ];
  return {
    techo,
    muros: [
      { x: b.x0 - 16, y: techo - 20, w: 16, h: suelo - techo + 20 },
      { x: b.x1, y: techo - 20, w: 16, h: suelo - techo + 20 },
    ],
    losas: b.cuartos.slice(1).map((c, i) => ({
      x: b.x0 - 16,
      y: b.cuartos[i].abajo,
      w: b.x1 - b.x0 + 32,
      h: c.arriba - b.cuartos[i].abajo,
    })),
    cubierta: { x: izq, y: techo - 20, w: der - izq },
    azotea: `${izq},${techo - 20} ${der},${techo - 20} ${b.x1 + 6},${techo - 48} ${pegadoIzq ? izq + 14 : b.x0 - 6},${techo - 48}`,
    paneles: generarPaneles(campo, b.paneles, 2),
    patas: `M${pt(campo[1])}L${b.x1 - 16} ${techo - 42}L${pt(campo[2])}M${pt(campo[0])}L${b.x0 + 18} ${techo - 42}L${pt(campo[3])}`,
    sombraPaneles: `${b.x0 + 8},${techo - 24} ${b.x1 - 10},${techo - 24} ${b.x1 - 2},${techo - 18} ${b.x0},${techo - 18}`,
  };
}

const ZONA_DE: Partial<Record<Equipo, ZonaId>> = {
  estante: "material",
  ventilador: "electrodomesticos",
  nevera: "electrodomesticos",
  breaker: "protecciones",
  baterias: "baterias",
  inversor: "inversor",
};

interface CasaSolarProps {
  diseno: Escenario;
  /** Zona resaltada; el resto de componentes se atenúa. */
  activa?: ZonaId | null;
  /** Evita ids repetidos si hay más de una casa en la página. */
  prefijo: string;
  className?: string;
  /** Clase del dibujo (cielo, terreno y casa), sin lo que va en children. */
  dibujoClassName?: string;
  preserveAspectRatio?: string;
  children?: ReactNode;
}

function CasaSolar({
  diseno,
  activa = null,
  prefijo,
  className,
  dibujoClassName,
  preserveAspectRatio,
  children,
}: CasaSolarProps) {
  const id = (n: string) => `${prefijo}-${n}`;
  const url = (n: string) => `url(#${id(n)})`;
  const zona = (z: ZonaId) => ({
    "data-zona": z,
    className: activa ? (activa === z ? s.resaltada : s.atenuada) : undefined,
    filter: activa === z ? url("brillo") : undefined,
  });

  const { suelo, bloques } = diseno;
  const { caja } = diseno;
  const geos = bloques.map((b) =>
    geometria(b, bloques.some((o) => o !== b && o.x1 + 16 === b.x0 - 16), suelo),
  );
  const cablesDc = [...diseno.cablesSolar, ...diseno.cablesBateria];
  const minX = Math.min(...bloques.map((b) => b.x0 - 16));
  const maxX = Math.max(...bloques.map((b) => b.x1 + 16));

  /** Dibujo de cada equipo en coordenadas locales. */
  const dibujo: Record<Equipo, ReactNode> = {
    ventana: (
      <>
        <rect x="-36" y="-42" width="72" height="84" rx="3" fill="#D9D3C8" />
        <rect x="-30" y="-36" width="60" height="72" fill={url("vista")} />
        <path d="M0 -36V36M-30 0H30" stroke="#F7F4EE" strokeWidth="3" />
        <rect x="-30" y="-36" width="60" height="72" fill={url("vidrio")} />
        <rect x="-30" y="-36" width="60" height="5" fill="#000" opacity=".08" />
        <rect x="-42" y="41" width="84" height="6" rx="1.5" fill="#E9E4DB" />
        <rect x="-42" y="47" width="84" height="3" fill="#000" opacity=".08" />
      </>
    ),
    estante: (
      <>
        <ellipse cy="1" rx="40" ry="3.5" fill={url("contacto")} />
        <rect x="-35" y="-76" width="70" height="76" fill="#2B2218" opacity=".14" filter={url("difuso")} />
        <g fill="#9C7A55">
          <rect x="-33" y="-80" width="4" height="80" />
          <rect x="29" y="-80" width="4" height="80" />
          <rect x="-33" y="-56" width="66" height="4" />
          <rect x="-33" y="-28" width="66" height="4" />
          <rect x="-33" y="-4" width="66" height="4" />
        </g>
        <rect x="-25" y="-74" width="26" height="18" rx="1" fill="#C9A16C" />
        <path d="M-12 -74v18" stroke="#E8D3A8" strokeWidth="3" />
        <circle cx="17" cy="-65" r="9" fill="#2A2E33" />
        <circle cx="17" cy="-65" r="6" fill="#C0392B" />
        <circle cx="17" cy="-65" r="2.5" fill="#2A2E33" />
        <rect x="-25" y="-44" width="30" height="16" rx="2" fill="#012928" />
        <path d="M-17 -44v-4h14v4" stroke="#012928" strokeWidth="2.5" fill="none" />
        <rect x="-25" y="-38" width="30" height="2" fill="#AFEB17" />
        <rect x="9" y="-40" width="18" height="12" rx="1" fill="#E7E1D6" stroke="#CFC7B9" strokeWidth=".8" />
        <rect x="-25" y="-20" width="22" height="16" rx="1" fill="#B88F5B" />
        <rect x="-1" y="-16" width="28" height="12" rx="2" fill="#BDB6A8" />
        <path d="M-1 -10h28" stroke="#A39B8C" strokeWidth="1" />
      </>
    ),
    ventilador: (
      <>
        <ellipse cy="1" rx="24" ry="3.5" fill={url("contacto")} />
        <ellipse cy="-3" rx="16" ry="4" fill="#6F777F" />
        <ellipse cy="-4" rx="16" ry="3" fill="#959CA3" />
        <rect x="-2" y="-62" width="4" height="58" fill={url("aluminio")} />
        <circle cy="-70" r="21" fill="#E8EDF1" fillOpacity=".35" />
        <g className={s.aspas} fill="#9FB3C4" fillOpacity=".85">
          {/* Caja simétrica alrededor del cubo: así el giro se centra en él */}
          <circle cy="-70" r="22" fill="none" />
          <ellipse cy="-81" rx="5.5" ry="10" />
          <ellipse cy="-81" rx="5.5" ry="10" transform="rotate(120 0 -70)" />
          <ellipse cy="-81" rx="5.5" ry="10" transform="rotate(240 0 -70)" />
        </g>
        <circle cy="-70" r="21" fill="none" stroke="#8D959D" strokeWidth="2" />
        <path
          d="M0 -91V-49M-21 -70H21M-15 -85L15 -55M15 -85L-15 -55"
          stroke="#8D959D"
          strokeOpacity=".45"
          strokeWidth=".8"
        />
        <circle cy="-70" r="4.5" fill="#6F777F" />
      </>
    ),
    nevera: (
      <>
        <rect x="-32" y="-122" width="58" height="124" rx="6" fill="#2B2218" opacity=".18" filter={url("difuso")} />
        <ellipse cy="3" rx="38" ry="4" fill={url("contacto")} />
        <polygon points="-26,-126 28,-126 24,-131 -22,-131" fill={url("tapa")} />
        <rect x="-28" y="-126" width="56" height="126" rx="5" fill={url("equipo")} stroke="#B7BFC6" strokeWidth=".8" />
        <path d="M-27 -84H27" stroke="#B7BFC6" strokeWidth="1.2" />
        <rect x="-20" y="-122" width="5" height="118" rx="2.5" fill="#fff" opacity=".7" />
        <rect x="18" y="-116" width="3" height="22" rx="1.5" fill="#8C959E" />
        <rect x="18" y="-74" width="3" height="34" rx="1.5" fill="#8C959E" />
      </>
    ),
    breaker: (
      <>
        <rect x="-21" y="-21" width="40" height="49" rx="3" fill="#2B2218" opacity=".18" filter={url("difuso")} />
        <rect x="-18" y="-24" width="36" height="48" rx="3" fill={url("equipo")} stroke="#A3ACB4" strokeWidth=".8" />
        <rect x="-13" y="-14" width="26" height="22" rx="1.5" fill="#F4F6F7" stroke="#C9D0D6" strokeWidth=".8" />
        <path d="M-7 -9v12M0 -9v12M7 -9v12" stroke="#012928" strokeWidth="3" strokeLinecap="round" />
        <rect x="-13" y="-14" width="26" height="22" rx="1.5" fill={url("vidrio")} />
      </>
    ),
    baterias: (
      <>
        <ellipse cy="3" rx="62" ry="5" fill={url("contacto")} />
        {[-48, 4].map((x) => (
          <g key={x}>
            <rect x={x - 3} y="-72" width="48" height="74" rx="4" fill="#2B2218" opacity=".16" filter={url("difuso")} />
            <polygon points={`${x + 2},-76 ${x + 42},-76 ${x + 39},-81 ${x + 5},-81`} fill="#3A3F45" />
            <rect x={x} y="-76" width="44" height="76" rx="4" fill={url("equipo")} stroke="#B9C1C8" strokeWidth=".8" />
            <rect x={x} y="-76" width="44" height="12" rx="4" fill="#2A2E33" />
            <rect x={x + 10} y="-52" width="24" height="12" rx="2" fill="#0B1220" />
            <rect x={x + 13} y="-49" width="18" height="6" rx="1" fill="#AFEB17" className={s.carga} />
            <path d={`M${x + 8} -16h28M${x + 8} -11h28`} stroke="#D2D8DE" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        ))}
      </>
    ),
    inversor: (
      <>
        <rect x="-33" y="-36" width="64" height="80" rx="7" fill="#2B2218" opacity=".2" filter={url("difuso")} />
        <rect x="-30" y="-40" width="60" height="80" rx="6" fill={url("equipo")} stroke="#B3BAC1" strokeWidth=".8" />
        <rect x="-22" y="-31" width="44" height="28" rx="3" fill="#2A2E33" />
        <rect x="-17" y="-27" width="34" height="15" rx="2" fill="#0B1220" />
        <path d="M-13 -22h12M-13 -17h22" stroke="#AFEB17" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="-13" cy="5" r="2.3" fill="#AFEB17" className={s.led} />
        <circle cx="-5" cy="5" r="2.3" fill="#F2C300" />
        <path d="M-20 20h40M-20 25h40M-20 30h40" stroke="#D2D8DE" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="-26" y="-36" width="4" height="72" rx="2" fill="#fff" opacity=".7" />
      </>
    ),
  };

  const colocar = (equipo: Equipo) =>
    diseno.equipos
      .filter((e) => e.equipo === equipo)
      .map((e, i) => {
        const z = ZONA_DE[equipo];
        return (
          <g key={`${equipo}-${i}`} transform={`translate(${e.x} ${e.y})`} {...(z ? zona(z) : {})}>
            {dibujo[equipo]}
          </g>
        );
      });

  return (
    <svg
      viewBox={`${caja.x} ${caja.y} ${caja.w} ${caja.h}`}
      preserveAspectRatio={preserveAspectRatio}
      className={`${s.casa} ${className ?? ""}`}
      role="img"
      aria-label="Casa con sistema solar: paneles, inversor, baterías, protecciones, electrodomésticos y material"
    >
      <defs>
        <linearGradient id={id("cielo")} x1="0" y1={suelo - 1300} x2="0" y2={suelo + 14} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#B9D7EA" />
          <stop offset=".75" stopColor="#E3EEF2" />
          <stop offset="1" stopColor="#F4F1EA" />
        </linearGradient>
        <linearGradient id={id("tierra")} x1="0" y1={suelo + 14} x2="0" y2={suelo + 700} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6F533D" />
          <stop offset=".08" stopColor="#866750" />
          <stop offset="1" stopColor="#4F3B2D" />
        </linearGradient>
        <linearGradient id={id("acera")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CFC9BE" />
          <stop offset="1" stopColor="#A49D91" />
        </linearGradient>
        <linearGradient id={id("concreto")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E2DDD3" />
          <stop offset="1" stopColor="#C3BDB1" />
        </linearGradient>
        <linearGradient id={id("muro")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#CFC9BE" />
          <stop offset=".5" stopColor="#DED9CF" />
          <stop offset="1" stopColor="#C9C3B7" />
        </linearGradient>
        <linearGradient id={id("azotea")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A9A398" />
          <stop offset="1" stopColor="#CCC6BB" />
        </linearGradient>
        <linearGradient id={id("pared")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EFEAE1" />
          <stop offset=".35" stopColor="#F8F5EF" />
          <stop offset="1" stopColor="#EDE8DF" />
        </linearGradient>
        <linearGradient id={id("rincon-arriba")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A3024" stopOpacity=".22" />
          <stop offset="1" stopColor="#3A3024" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("rincon-izq")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3A3024" stopOpacity=".16" />
          <stop offset="1" stopColor="#3A3024" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("rincon-der")} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#3A3024" stopOpacity=".16" />
          <stop offset="1" stopColor="#3A3024" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("madera")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A9865F" />
          <stop offset="1" stopColor="#C7A57E" />
        </linearGradient>
        <linearGradient id={id("losa")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CFCAC1" />
          <stop offset="1" stopColor="#E4E0D8" />
        </linearGradient>
        <linearGradient id={id("cono")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE7A0" stopOpacity=".5" />
          <stop offset="1" stopColor="#FFE7A0" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("pantalla")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3D4A4A" />
          <stop offset="1" stopColor="#1E2727" />
        </linearGradient>
        <linearGradient id={id("panel")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A5078" />
          <stop offset=".55" stopColor="#1D2B46" />
          <stop offset="1" stopColor="#111A2C" />
        </linearGradient>
        <linearGradient id={id("reflejo")} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset=".4" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("aluminio")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9AA1A8" />
          <stop offset=".5" stopColor="#D6DBE0" />
          <stop offset="1" stopColor="#8E959C" />
        </linearGradient>
        <linearGradient id={id("equipo")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FDFDFD" />
          <stop offset=".75" stopColor="#ECEFF2" />
          <stop offset="1" stopColor="#D2D8DE" />
        </linearGradient>
        <linearGradient id={id("tapa")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E6E9EC" />
        </linearGradient>
        <linearGradient id={id("vista")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9EC6E2" />
          <stop offset="1" stopColor="#DCEBF3" />
        </linearGradient>
        <linearGradient id={id("vidrio")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".35" stopColor="#fff" stopOpacity="0" />
          <stop offset=".55" stopColor="#fff" stopOpacity=".18" />
          <stop offset=".7" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id("contacto")}>
          <stop offset="0" stopColor="#2B2218" stopOpacity=".38" />
          <stop offset="1" stopColor="#2B2218" stopOpacity="0" />
        </radialGradient>
        <filter id={id("difuso")} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <filter id={id("brillo")} x="-30%" y="-30%" width="160%" height="160%">
          <feFlood floodColor="#F2C300" floodOpacity=".95" />
          <feComposite operator="in" in2="SourceAlpha" />
          <feGaussianBlur stdDeviation="5" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g className={dibujoClassName}>
        {/* Cielo */}
        <rect x="-4000" y="-4000" width="9000" height={4000 + suelo + 14} fill={url("cielo")} />

        {/* Terreno en corte y acera */}
        <rect x="-4000" y={suelo + 14} width="9000" height="4000" fill={url("tierra")} />
        <rect x="-4000" y={suelo + 4} width="9000" height="12" fill={url("acera")} />
        <rect x="-4000" y={suelo + 4} width="9000" height="1.5" fill="#E4DFD6" />
        {/* Sombra de la casa sobre la acera, con la luz desde la derecha */}
        <polygon
          points={`${minX - 12},${suelo + 5} ${minX - 96},${suelo + 5} ${minX - 66},${suelo + 15} ${minX - 12},${suelo + 15}`}
          fill="#2B2218"
          opacity=".18"
          filter={url("difuso")}
        />
        <ellipse cx={(minX + maxX) / 2} cy={suelo + 16} rx={(maxX - minX) / 2 + 20} ry="7" fill={url("contacto")} />

        {/* Interiores */}
        {bloques.flatMap((b, bi) =>
          b.cuartos.map((c, ci) => {
            const fondo = c.abajo - 16;
            const juntas = Array.from({ length: 9 }, (_, i) => {
              const t = (i + 1) / 10;
              return linea(
                [b.x0 + (b.x1 - b.x0) * t, c.abajo],
                [b.x0 + 16 + (b.x1 - b.x0 - 32) * t, fondo],
              );
            }).join("");
            const alto = c.abajo - c.arriba;
            return (
              <g key={`${bi}-${ci}`}>
                <rect x={b.x0} y={c.arriba} width={b.x1 - b.x0} height={alto} fill={url("pared")} />
                <polygon
                  points={`${b.x0},${c.abajo} ${b.x1},${c.abajo} ${b.x1 - 16},${fondo} ${b.x0 + 16},${fondo}`}
                  fill={url(c.suelo)}
                />
                <path d={juntas} stroke="#000" strokeOpacity={c.suelo === "madera" ? 0.1 : 0.06} strokeWidth="1" />
                <rect x={b.x0} y={c.arriba} width={b.x1 - b.x0} height="46" fill={url("rincon-arriba")} />
                <rect x={b.x0} y={c.arriba} width="34" height={alto} fill={url("rincon-izq")} />
                <rect x={b.x1 - 34} y={c.arriba} width="34" height={alto} fill={url("rincon-der")} />
              </g>
            );
          }),
        )}

        {colocar("ventana")}

        {/* Lámparas: luz cálida en cono */}
        {diseno.lamparas.map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <polygon
              points={`${x - 10},${y + 42} ${x + 10},${y + 42} ${x + 62},${y + 170} ${x - 62},${y + 170}`}
              fill={url("cono")}
            />
            <path d={`M${x} ${y}V${y + 30}`} stroke="#2F3A3A" strokeWidth="1.5" />
            <path d={`M${x - 13} ${y + 42}l5-12h16l5 12z`} fill={url("pantalla")} />
            <ellipse cx={x} cy={y + 42} rx="7" ry="2.5" fill="#FFF3C4" />
          </g>
        ))}

        {/* Muros, losas, cimientos y azoteas en corte */}
        {geos.map((g, i) => (
          <g key={i}>
            {g.muros.map((m, j) => (
              <rect key={j} x={m.x} y={m.y} width={m.w} height={m.h} fill={url("muro")} />
            ))}
            {g.losas.map((l, j) => (
              <g key={j}>
                <rect x={l.x} y={l.y} width={l.w} height={l.h} fill={url("concreto")} />
                <path d={`M${l.x} ${l.y + 0.5}h${l.w}`} stroke="#F2EFE9" strokeWidth="1.5" />
              </g>
            ))}
            <rect x={g.cubierta.x} y={g.techo - 20} width={g.cubierta.w} height="20" fill={url("concreto")} />
            <path d={`M${g.cubierta.x} ${g.techo - 19.5}h${g.cubierta.w}`} stroke="#F2EFE9" strokeWidth="1.5" />
            <polygon points={g.azotea} fill={url("azotea")} />
          </g>
        ))}
        <rect x={minX - 12} y={suelo} width={maxX - minX + 24} height="14" fill={url("concreto")} />
        <path d={`M${minX - 12} ${suelo + 0.5}H${maxX + 12}`} stroke="#F2EFE9" strokeWidth="1.5" />

        {/* Cableado */}
        <g {...zona("cableado")} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <g stroke="#262A2E" strokeOpacity=".55" strokeWidth="3.5">
            {cablesDc.concat(diseno.cablesAc).map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
          <g stroke="#F2B200" strokeWidth="1.8" className={s.flujo}>
            {cablesDc.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
          <g stroke="#8BCB12" strokeWidth="1.8" className={`${s.flujo} ${s.flujoAc}`}>
            {diseno.cablesAc.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        </g>

        {/* Paneles: estructura de aluminio, módulos, celdas y reflejo del cielo */}
        <g {...zona("paneles")}>
          {geos.map((g, i) => (
            <g key={i}>
              <path d={g.patas} stroke="#7C838A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <polygon points={g.sombraPaneles} fill="#000" opacity=".22" filter={url("difuso")} />
              {g.paneles.paneles.map((p) => (
                <polygon key={p} points={p} fill={url("panel")} stroke={url("aluminio")} strokeWidth="2.5" strokeLinejoin="round" />
              ))}
              <path d={g.paneles.celdas} stroke="#8EA6D4" strokeOpacity=".16" strokeWidth=".8" />
              <polygon points={g.paneles.contorno} fill={url("reflejo")} />
            </g>
          ))}
        </g>

        {colocar("estante")}
        {colocar("ventilador")}
        {colocar("nevera")}
        {colocar("breaker")}
        {colocar("baterias")}
        {colocar("inversor")}
      </g>

      {children}
    </svg>
  );
}

export default memo(CasaSolar);
