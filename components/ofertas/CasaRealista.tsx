"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import casa from "@/components/tienda/casa-solar.module.css";
import { PRETIL, componer, type Caja, type ContenidoKit, type Variante } from "./escena-realista";

// Casa realista de "Ver cómo quedaría": cielo y cuarto fotografiados (CC0),
// muros y losa de hormigón con textura de estuco, los paneles reales en la
// azotea y los equipos del kit a escala, con su sombra y los tubos de PVC por
// la pared. Cada equipo lleva una etiqueta que no se sale de la pantalla.

export interface TextoEtiqueta {
  titulo: string;
  detalle: string;
  /** Versión de una línea para pantallas donde la de dos no cabe. */
  corta: string;
}

export interface Etiquetas {
  paneles?: TextoEtiqueta;
  proteccion?: TextoEtiqueta;
  inversor: TextoEtiqueta;
  baterias?: TextoEtiqueta;
  tablero?: TextoEtiqueta;
}

// Por debajo de esta escala (px por unidad) las etiquetas van en una línea, y
// por debajo de la segunda (móviles bajos, como un iPhone SE) un 15 % menores.
const ESCALA_ETIQUETA_COMPLETA = 0.85;
const ESCALA_ETIQUETA_PEQUENA = 0.62;

interface CasaRealistaProps {
  kit: ContenidoKit;
  etiquetas: Etiquetas;
  variante: Variante;
  prefijo: string;
  className?: string;
}

export default function CasaRealista({ kit, etiquetas, variante: v, prefijo, className }: CasaRealistaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [k, setK] = useState<number | null>(null);
  const e = useMemo(() => componer(v, kit), [v, kit]);
  const { caja, casa: c } = v;
  const { interior: i } = e;
  const id = (n: string) => `${prefijo}-${n}`;
  const url = (n: string) => `url(#${id(n)})`;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = (w: number, h: number) =>
      setK(w > 0 && h > 0 ? Math.min(w / caja.w, h / caja.h) : null);
    const r = el.getBoundingClientRect();
    medir(r.width, r.height);
    const ro = new ResizeObserver(([en]) => medir(en.contentRect.width, en.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, [caja]);

  // Etiquetas: debajo de cada equipo (o encima, si debajo no cabe).
  const colocadas: { texto: TextoEtiqueta; x: number; y: number; arriba: boolean }[] = [];
  if (etiquetas.paneles && e.paneles.length) {
    const top = Math.min(...e.paneles.map((p) => p.y));
    colocadas.push({ texto: etiquetas.paneles, x: (v.paneles.x0 + v.paneles.x1) / 2, y: top - 12, arriba: true });
  }
  if (etiquetas.proteccion && e.proteccion) {
    const p = e.proteccion;
    colocadas.push({ texto: etiquetas.proteccion, x: p.x + p.w / 2, y: p.y + p.h + 10, arriba: false });
  }
  const inv = e.cajas.inversor;
  colocadas.push({ texto: etiquetas.inversor, x: inv.x + inv.w / 2, y: inv.y + inv.h + 10, arriba: false });
  if (etiquetas.baterias && e.cajas.baterias) {
    const b = e.cajas.baterias;
    colocadas.push({ texto: etiquetas.baterias, x: b.x + b.w / 2, y: e.base + 12, arriba: false });
  }
  if (etiquetas.tablero && e.cajas.tablero) {
    const t = e.cajas.tablero;
    const arriba = v.etiquetaTablero === "arriba";
    colocadas.push({ texto: etiquetas.tablero, x: t.x + t.w / 2, y: arriba ? t.y - 10 : t.y + t.h + 10, arriba });
  }

  const sombraPared = (b: Caja) => (
    <rect x={b.x + 4} y={b.y + 8} width={b.w - 2} height={b.h - 4} rx="6" fill="#1E1810" opacity=".28" filter={url("difuso")} />
  );
  const sombraSuelo = (b: Caja) => (
    <ellipse cx={b.x + b.w / 2} cy={b.y + b.h + 1} rx={b.w / 2 + 10} ry="6" fill={url("contacto")} />
  );
  const tubo = (d: string, color: string) => (
    <g key={d} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke="#1E1810" strokeOpacity=".18" strokeWidth="9" transform="translate(2 3)" filter={url("difuso-leve")} />
      <path d={d} stroke="#B9BEC3" strokeWidth="8" />
      <path d={d} stroke="#E9ECEE" strokeWidth="3" transform="translate(-1.2 -1.2)" />
      <path d={d} stroke={color} strokeWidth="2" strokeOpacity=".85" className={casa.flujo} />
    </g>
  );

  return (
    <div ref={ref} className={className}>
      <svg
        viewBox={`${caja.x} ${caja.y} ${caja.w} ${caja.h}`}
        className="h-full w-full"
        style={{ overflow: "visible" }}
        role="img"
        aria-label="Así quedaría la instalación del kit en tu casa"
      >
        <defs>
          <clipPath id={id("interior")}>
            <rect x={i.x0} y={i.y0} width={i.x1 - i.x0} height={i.y1 - i.y0} />
          </clipPath>
          <filter id={id("ruido")} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="7" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 .16" />
            </feComponentTransfer>
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
          <filter id={id("difuso")} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id={id("difuso-leve")} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <radialGradient id={id("contacto")}>
            <stop offset="0" stopColor="#1E1810" stopOpacity=".45" />
            <stop offset="1" stopColor="#1E1810" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={id("bruma")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#F4F1EA" stopOpacity=".75" />
          </linearGradient>
          <linearGradient id={id("acera")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#CEC8BD" />
            <stop offset="1" stopColor="#B3AC9F" />
          </linearGradient>
          <linearGradient id={id("asfalto")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4A4E53" />
            <stop offset=".25" stopColor="#3A3E43" />
            <stop offset="1" stopColor="#24272B" />
          </linearGradient>
          <linearGradient id={id("hormigon")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E4DFD6" />
            <stop offset="1" stopColor="#C9C2B6" />
          </linearGradient>
          <linearGradient id={id("muro")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#D9D2C6" />
            <stop offset=".5" stopColor="#ECE7DE" />
            <stop offset="1" stopColor="#D5CEC2" />
          </linearGradient>
          <linearGradient id={id("techo-sombra")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1E1810" stopOpacity=".32" />
            <stop offset="1" stopColor="#1E1810" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={id("rincon-izq")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1E1810" stopOpacity=".2" />
            <stop offset="1" stopColor="#1E1810" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={id("rincon-der")} x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="#1E1810" stopOpacity=".2" />
            <stop offset="1" stopColor="#1E1810" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={id("pretil")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E9E3D8" />
            <stop offset="1" stopColor="#D6CFC2" />
          </linearGradient>
          <linearGradient id={id("galvanizado")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8A9198" />
            <stop offset=".45" stopColor="#E3E7EA" />
            <stop offset="1" stopColor="#7D848B" />
          </linearGradient>
          <radialGradient id={id("plato")} cx=".35" cy=".35">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#D5DADF" />
          </radialGradient>
          <linearGradient id={id("reflejo")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".32" />
            <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Cielo fotografiado, con bruma hacia el horizonte */}
        <image
          href="/equipos/cielo.webp"
          x={caja.x - 1400}
          y={caja.y - 1000}
          width={caja.w + 2800}
          height={c.suelo - caja.y + 1010}
          preserveAspectRatio="xMidYMax slice"
        />
        <rect x={caja.x - 1400} y={c.losaArriba - 200} width={caja.w + 2800} height={c.suelo - c.losaArriba + 210} fill={url("bruma")} />

        {/* Acera con sus juntas, bordillo y la calle de asfalto delante */}
        <rect x={caja.x - 1400} y={c.suelo + 2} width={caja.w + 2800} height="26" fill={url("acera")} />
        <rect x={caja.x - 1400} y={c.suelo + 2} width={caja.w + 2800} height="26" filter={url("ruido")} />
        <path
          d={Array.from({ length: 40 }, (_, n) => `M${caja.x - 1400 + n * 110 + ((c.x0 - caja.x) % 110)} ${c.suelo + 4}v22`).join("")}
          stroke="#8F887C"
          strokeOpacity=".5"
          strokeWidth="1.2"
        />
        <rect x={caja.x - 1400} y={c.suelo + 28} width={caja.w + 2800} height="7" fill="#E2DDD3" />
        <rect x={caja.x - 1400} y={c.suelo + 35} width={caja.w + 2800} height="4" fill="#1E1810" opacity=".3" />
        <rect x={caja.x - 1400} y={c.suelo + 35} width={caja.w + 2800} height="1200" fill={url("asfalto")} />
        <rect x={caja.x - 1400} y={c.suelo + 35} width={caja.w + 2800} height="1200" filter={url("ruido")} />
        <ellipse cx={(c.x0 + c.x1) / 2} cy={c.suelo + 18} rx={(c.x1 - c.x0) / 2 + 30} ry="9" fill={url("contacto")} />

        {/* El cuarto, fotografiado de frente */}
        <g clipPath={url("interior")}>
          <image href={v.fondo.src} x={e.foto.x} y={e.foto.y} width={e.foto.w} height={e.foto.h} preserveAspectRatio="none" />
          <rect x={i.x0} y={i.y0} width={i.x1 - i.x0} height="60" fill={url("techo-sombra")} />
          <rect x={i.x0} y={i.y0} width="46" height={i.y1 - i.y0} fill={url("rincon-izq")} />
          <rect x={i.x1 - 46} y={i.y0} width="46" height={i.y1 - i.y0} fill={url("rincon-der")} />

          {/* Tubos de PVC por la pared, con la energía corriendo */}
          {e.tubosSolar.map((d) => tubo(d, "#F2B200"))}
          {e.tubosBateria.map((d) => tubo(d, "#AFEB17"))}
          {e.tubosCasa.map((d) => tubo(d, "#7DB80B"))}

          {/* Equipos reales a escala, con su sombra */}
          {e.proteccion && (
            <g>
              {sombraPared(e.proteccion)}
              <image href={e.proteccion.src} x={e.proteccion.x} y={e.proteccion.y} width={e.proteccion.w} height={e.proteccion.h} />
            </g>
          )}
          {e.tablero.map((t) => (
            <g key={t.src}>
              {sombraPared(t)}
              <image href={t.src} x={t.x} y={t.y} width={t.w} height={t.h} />
            </g>
          ))}
          {e.inversores.map((p, n) => (
            <g key={n}>
              {sombraPared(p)}
              {p.src ? (
                <image href={p.src} x={p.x} y={p.y} width={p.w} height={p.h} />
              ) : (
                <rect x={p.x} y={p.y} width={p.w} height={p.h} rx="6" fill="#F4F5F6" stroke="#B9C0C7" />
              )}
            </g>
          ))}
          {e.baterias.map((p, n) => (
            <g key={n}>
              {sombraSuelo(p)}
              <rect x={p.x + 6} y={p.y + 10} width={p.w - 4} height={p.h - 10} rx="6" fill="#1E1810" opacity=".22" filter={url("difuso")} />
              {p.src ? (
                <image href={p.src} x={p.x} y={p.y} width={p.w} height={p.h} />
              ) : (
                <rect x={p.x} y={p.y} width={p.w} height={p.h} rx="5" fill="#F4F5F6" stroke="#B9C0C7" />
              )}
            </g>
          ))}
        </g>

        {/* Muros en corte, con zócalo y textura de estuco */}
        {[c.x0, c.x1 - c.muro].map((x) => (
          <g key={x}>
            <rect x={x} y={c.losaArriba} width={c.muro} height={c.suelo - c.losaArriba} fill={url("muro")} />
            <rect x={x} y={c.suelo - 34} width={c.muro} height="34" fill="#BCB3A5" />
            <rect x={x} y={c.losaArriba} width={c.muro} height={c.suelo - c.losaArriba} filter={url("ruido")} />
          </g>
        ))}
        <rect x={i.x0} y={i.y0} width={i.x1 - i.x0} height="10" fill="#1E1810" opacity=".18" filter={url("difuso-leve")} />

        {/* Losa con vuelo a los lados y su sombra sobre los muros */}
        {[c.x0 - 6, c.x1 - 4].map((x) => (
          <rect key={x} x={x} y={c.losaArriba + c.losaGrosor} width="10" height="12" fill="#1E1810" opacity=".2" filter={url("difuso-leve")} />
        ))}
        <rect x={c.x0 - 10} y={c.losaArriba} width={c.x1 - c.x0 + 20} height={c.losaGrosor} fill={url("hormigon")} />
        <rect x={c.x0 - 10} y={c.losaArriba} width={c.x1 - c.x0 + 20} height={c.losaGrosor} filter={url("ruido")} />
        <path d={`M${c.x0 - 10} ${c.losaArriba + c.losaGrosor - 1}H${c.x1 + 10}`} stroke="#8F877B" strokeWidth="2" strokeOpacity=".6" />

        {/* Antena de internet: mástil galvanizado con su plato apuntando a la torre */}
        <g>
          <rect x={v.antena.x - 2.5} y={c.losaArriba - v.antena.alto} width="5" height={v.antena.alto} fill={url("galvanizado")} />
          <rect x={v.antena.x - 7} y={c.losaArriba - 26} width="14" height="5" rx="1.5" fill="#8E959C" />
          <rect x={v.antena.x - 7} y={c.losaArriba - v.antena.alto * 0.45} width="14" height="4" rx="1.5" fill="#8E959C" />
          <path
            d={`M${v.antena.x} ${c.losaArriba - v.antena.alto + 18}h-10`}
            stroke="#8E959C"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <ellipse cx={v.antena.x - 14} cy={c.losaArriba - v.antena.alto + 18} rx="7" ry="20" fill={url("plato")} stroke="#C9CED3" strokeWidth="1" />
          <path
            d={`M${v.antena.x - 12} ${c.losaArriba - v.antena.alto + 2}L${v.antena.x - 30} ${c.losaArriba - v.antena.alto + 18}L${v.antena.x - 12} ${c.losaArriba - v.antena.alto + 34}`}
            stroke="#B9BEC3"
            strokeWidth="1.6"
            fill="none"
          />
          <rect x={v.antena.x - 34} y={c.losaArriba - v.antena.alto + 14} width="7" height="8" rx="1.5" fill="#F4F5F6" stroke="#B9BEC3" strokeWidth=".8" />
          <circle cx={v.antena.x - 30.5} cy={c.losaArriba - v.antena.alto + 18} r="1.4" fill="#AFEB17" className={casa.led} />
          <path d={`M${v.antena.x + 2.5} ${c.losaArriba - 30}q6 8 0 30`} stroke="#2A2E33" strokeWidth="1.5" fill="none" />
        </g>

        {/* Paneles reales sobre su estructura, la fila de atrás primero */}
        {e.paneles.map((p, n) => (
          <g key={n}>
            <path
              d={`M${p.x + 4} ${p.y + p.h}V${c.losaArriba}M${p.x + p.w - 4} ${p.y + p.h}V${c.losaArriba}M${p.x + p.w * 0.25} ${p.y}V${c.losaArriba}M${p.x + p.w * 0.75} ${p.y}V${c.losaArriba}`}
              stroke="#8E959C"
              strokeWidth="2.5"
            />
            <rect x={p.x + 2} y={p.y + p.h - 1} width={p.w - 4} height="8" fill="#1E1810" opacity=".25" filter={url("difuso-leve")} />
            <image href="/equipos/panel.webp" x={p.x} y={p.y} width={p.w} height={p.h} preserveAspectRatio="none" />
            <rect x={p.x} y={p.y} width={p.w} height={p.h} fill={url("reflejo")} />
          </g>
        ))}

        {/* Pretil corrido con su albardilla, delante de las patas de los paneles */}
        <rect x={c.x0 - 10} y={c.losaArriba - PRETIL} width={c.x1 - c.x0 + 20} height={PRETIL} fill={url("pretil")} />
        <rect x={c.x0 - 10} y={c.losaArriba - PRETIL} width={c.x1 - c.x0 + 20} height={PRETIL} filter={url("ruido")} />
        <rect x={c.x0 - 14} y={c.losaArriba - PRETIL - 6} width={c.x1 - c.x0 + 28} height="7" rx="1.5" fill="#F3EFE8" />
        <rect x={c.x0 - 10} y={c.losaArriba - PRETIL + 1} width={c.x1 - c.x0 + 20} height="4" fill="#1E1810" opacity=".14" />

        {/* Bajante pluvial por fuera del muro derecho */}
        <g>
          <path
            d={`M${c.x1 + 9} ${c.losaArriba + c.losaGrosor - 4}V${c.suelo - 8}q0 8 9 8h6`}
            stroke="#C9CED3"
            strokeWidth="8"
            fill="none"
          />
          <path
            d={`M${c.x1 + 7.5} ${c.losaArriba + c.losaGrosor - 4}V${c.suelo - 10}`}
            stroke="#F2F4F6"
            strokeWidth="2"
          />
          {[0.3, 0.65].map((f) => (
            <rect
              key={f}
              x={c.x1 + 3}
              y={c.losaArriba + c.losaGrosor + (c.suelo - c.losaArriba - c.losaGrosor) * f}
              width="12"
              height="4"
              rx="1"
              fill="#9AA1A8"
            />
          ))}
        </g>

        {/* Cimiento */}
        <rect x={c.x0 - 14} y={c.suelo} width={c.x1 - c.x0 + 28} height="18" fill={url("hormigon")} />
        <rect x={c.x0 - 14} y={c.suelo} width={c.x1 - c.x0 + 28} height="18" filter={url("ruido")} />
        <path d={`M${c.x0 - 10} ${c.losaArriba + 0.5}H${c.x1 + 10}M${c.x0 - 14} ${c.suelo + 0.5}H${c.x1 + 14}`} stroke="#F7F4EE" strokeWidth="1.5" />

        {/* Etiquetas, en px de pantalla y sin salirse del encuadre */}
        {k !== null &&
          colocadas.map(({ texto, x, y, arriba }, n) => {
            const completa = k >= ESCALA_ETIQUETA_COMPLETA;
            const ancho = completa
              ? Math.max(texto.titulo.length * 7.1, texto.detalle.length * 6.2) + 24
              : texto.corta.length * 7.1 + 24;
            const alto = completa ? 38 : 26;
            const f = k < ESCALA_ETIQUETA_PEQUENA ? 0.85 : 1;
            const margen = ((ancho / 2 + 6) * f) / k;
            const cx = Math.max(caja.x + margen, Math.min(x, caja.x + caja.w - margen));
            const flecha = Math.max(-ancho / 2 + 14, Math.min(((x - cx) * k) / f, ancho / 2 - 14));
            return (
              <g key={texto.titulo} transform={`translate(${cx} ${y}) scale(${f / k})`} pointerEvents="none">
                <g className={casa.aparecer} style={{ animationDelay: `${400 + n * 120}ms` }}>
                  <g transform={arriba ? `translate(0 ${-alto})` : undefined}>
                    <rect x={-ancho / 2} y="0" width={ancho} height={alto} rx="12" fill="#012928" />
                    <path
                      d={arriba ? `M${flecha - 6} ${alto}L${flecha} ${alto + 6}L${flecha + 6} ${alto}Z` : `M${flecha - 6} 0L${flecha} -6L${flecha + 6} 0Z`}
                      fill="#012928"
                    />
                    {completa ? (
                      <>
                        <text y="16" textAnchor="middle" fontSize="12.5" fontWeight={700} fill="#fff">
                          {texto.titulo}
                        </text>
                        <text y="30" textAnchor="middle" fontSize="11" fontWeight={600} fill="#AFEB17">
                          {texto.detalle}
                        </text>
                      </>
                    ) : (
                      <text y="17.5" textAnchor="middle" fontSize="12.5" fontWeight={700} fill="#fff">
                        {texto.corta}
                      </text>
                    )}
                  </g>
                </g>
              </g>
            );
          })}
      </svg>
    </div>
  );
}
