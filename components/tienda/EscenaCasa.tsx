"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  BatteryCharging,
  Boxes,
  Cable,
  Refrigerator,
  ShieldCheck,
  Sun,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { abrirCarrito } from "@/components/ShoppingCart";
import { useCart } from "@/hooks/useCart";
import CasaSolar from "./CasaSolar";
import { DISENO_ESCRITORIO, DISENO_MOVIL, type Diseno } from "./disenos";
import { ZONAS_POR_ID, type ZonaId } from "./zonas";
import s from "./casa-solar.module.css";

export const ICONOS: Record<ZonaId, LucideIcon> = {
  paneles: Sun,
  inversor: Zap,
  baterias: BatteryCharging,
  protecciones: ShieldCheck,
  cableado: Cable,
  electrodomesticos: Refrigerator,
  material: Boxes,
};

// Por debajo (px por unidad del dibujo) los nombres completos no caben y el
// botón usa el corto.
const ESCALA_NOMBRE_COMPLETO = 0.7;
// Con la casa más pequeña que esto el letrero tapa demasiado dibujo.
const ESCALA_CON_LETRERO = 0.4;
// El letrero se dibuja a 160 × 64 px.
const ANCHO_LETRERO = 160;
// En el diseño vertical el letrero se encoge con la casa hasta este mínimo
// en pantallas pequeñas.
const ESCALA_REFERENCIA_VERTICAL = 0.7;
const AJUSTE_MINIMO_VERTICAL = 0.75;
// En la intro el letrero ocupa este ancho (px), sin pasar del 80 % de la pantalla.
const ANCHO_LETRERO_INTRO = 520;
// Cuándo entra la casa: tras el viaje del letrero y su flecha (ver el CSS).
const DEMORA_CASA = "3.2s";

interface EscenaCasaProps {
  onElegir: (zona: ZonaId) => void;
}

/**
 * La casa a toda la pantalla, con un diseño para pantallas verticales y otro
 * para horizontales. Las dos llegan en el HTML y el CSS muestra la que toca
 * según la orientación, así no hay salto al cargar.
 */
export default function EscenaCasa({ onElegir }: EscenaCasaProps) {
  return (
    <>
      <Escena
        diseno={DISENO_MOVIL}
        prefijo="vertical"
        className={`${s.soloVertical} absolute inset-x-1 bottom-[2svh] top-20`}
        onElegir={onElegir}
      />
      <Escena
        diseno={DISENO_ESCRITORIO}
        prefijo="horizontal"
        className={`${s.soloHorizontal} absolute inset-x-6 bottom-6 top-20 lg:top-24`}
        onElegir={onElegir}
      />
    </>
  );
}

/** Teclado: Enter o espacio activan los elementos con role="button"/"link". */
const alPulsar = (accion: () => void) => (e: React.KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    accion();
  }
};

interface EscenaProps {
  diseno: Diseno;
  prefijo: string;
  className: string;
  onElegir: (zona: ZonaId) => void;
}

interface Medida {
  /** Píxeles por unidad del dibujo. */
  k: number;
  /** Del sitio del letrero al centro de la pantalla, en unidades del letrero. */
  dx: number;
  dy: number;
  /** Tamaño del letrero en la intro respecto al final. */
  s: number;
  /** Tamaño final del letrero (px por unidad base). */
  letrero: number;
  /** Si la casa se ve lo bastante grande para dibujar el letrero. */
  conLetrero: boolean;
}

function Escena({ diseno, prefijo, className, onElegir }: EscenaProps) {
  const ref = useRef<HTMLDivElement>(null);
  // null mientras no se ha medido o si esta escena está oculta.
  const [medida, setMedida] = useState<Medida | null>(null);
  // Se decide en la primera medida y no cambia: si la casa ya entró, un giro
  // de pantalla no debe volver a ocultarla.
  const [conIntro, setConIntro] = useState<boolean | null>(null);
  const [resaltada, setResaltada] = useState<ZonaId | null>(null);
  const enCarrito = useCart((st) =>
    st.items.reduce((n, i) => n + i.cantidad, 0),
  );

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => {
      const caja = el.getBoundingClientRect();
      if (caja.width <= 0 || caja.height <= 0) return setMedida(null);
      const k = Math.min(
        caja.width / diseno.caja.w,
        caja.height / diseno.caja.h,
      );
      // El dibujo va centrado en horizontal y pegado abajo (xMidYMax meet).
      const x =
        caja.left +
        (caja.width - diseno.caja.w * k) / 2 +
        (diseno.letrero.x - diseno.caja.x) * k;
      const y =
        caja.bottom -
        diseno.caja.h * k +
        (diseno.letrero.y - diseno.caja.y) * k;
      const ajuste = vertical
        ? Math.min(
            1,
            Math.max(AJUSTE_MINIMO_VERTICAL, k / ESCALA_REFERENCIA_VERTICAL),
          )
        : 1;
      const letrero = diseno.escalas.letrero * ajuste;
      const conLetrero = k >= ESCALA_CON_LETRERO;
      const pantalla = (el.parentElement ?? el).getBoundingClientRect();
      const anchoIntro = Math.min(pantalla.width * 0.8, ANCHO_LETRERO_INTRO);
      setMedida({
        k,
        dx: (pantalla.left + pantalla.width / 2 - x) / letrero,
        dy: (pantalla.top + pantalla.height / 2 - y) / letrero,
        s: Math.max(1, anchoIntro / (ANCHO_LETRERO * letrero)),
        letrero,
        conLetrero,
      });
      setConIntro((antes) => antes ?? conLetrero);
    };
    medir();
    const ro = new ResizeObserver(() => medir());
    ro.observe(el);
    return () => ro.disconnect();
  }, [diseno]);

  const k = medida?.k ?? null;
  const u = (px: number) => px / (k ?? 1);
  const completo = k !== null && k >= ESCALA_NOMBRE_COMPLETO;
  // En el diseño vertical (móvil de pie) los nombres van siempre completos,
  // en dos líneas si hace falta.
  const vertical = diseno === DISENO_MOVIL;

  /** Pastilla blanca con el nombre, centrada bajo un botón (en px). Con
   * `partir`, los nombres de varias palabras van en dos líneas. */
  const nombreBajo = (nombre: string, y: number, partir = false) => {
    const lineas = partir ? nombre.split(" ") : [nombre];
    const ancho = 16 + Math.max(...lineas.map((l) => l.length)) * 6.6;
    const alto = 6 + lineas.length * 14;
    return (
      <g transform={`translate(${-ancho / 2} ${y})`} pointerEvents="none">
        <rect
          width={ancho}
          height={alto}
          rx={Math.min(10, alto / 2)}
          fill="#fff"
          fillOpacity=".92"
        />
        {lineas.map((linea, i) => (
          <text
            key={i}
            x={ancho / 2}
            y={14 + i * 14}
            textAnchor="middle"
            fontSize="11.5"
            fontWeight={700}
            fill="#012928"
          >
            {linea}
          </text>
        ))}
      </g>
    );
  };

  return (
    <div
      ref={ref}
      className={className}
      style={
        { "--demora": conIntro ? DEMORA_CASA : "0s" } as React.CSSProperties
      }
    >
      <CasaSolar
        diseno={diseno}
        prefijo={prefijo}
        activa={resaltada}
        dibujoClassName={k === null ? s.casaOculta : s.casaEntrar}
        // Pegada abajo: lo que sobre de pantalla es cielo, no tierra.
        preserveAspectRatio="xMidYMax meet"
        className="h-full w-full"
      >
        {k !== null && (
          // Todo lo de aquí dentro se dibuja en px de pantalla: escala 1/k.
          <>
            {/* Letrero: sale solo y grande en el centro, viaja a su sitio
                y señala la casa */}
            {medida && medida.conLetrero && (
              <g
                transform={`translate(${diseno.letrero.x} ${diseno.letrero.y}) scale(${u(medida.letrero)})`}
                pointerEvents="none"
              >
                <g
                  className={conIntro ? s.viajar : undefined}
                  style={
                    {
                      "--dx": `${medida.dx}px`,
                      "--dy": `${medida.dy}px`,
                      "--s": medida.s,
                    } as React.CSSProperties
                  }
                >
                  <g className={conIntro ? s.brotar : s.aparecer}>
                    <rect
                      x="-77"
                      y="-29"
                      width={ANCHO_LETRERO}
                      height="64"
                      rx="18"
                      fill="#012928"
                      opacity=".16"
                    />
                    <rect
                      x="-80"
                      y="-32"
                      width={ANCHO_LETRERO}
                      height="64"
                      rx="18"
                      fill="#012928"
                    />
                    <text
                      y="-4"
                      textAnchor="middle"
                      fontSize="17"
                      fontWeight={700}
                      fill="#fff"
                    >
                      Selecciona
                    </text>
                    <text
                      y="17"
                      textAnchor="middle"
                      fontSize="14.5"
                      fontWeight={600}
                      fill="#AFEB17"
                    >
                      qué necesitas
                    </text>
                    <g className={conIntro ? s.flecha : undefined}>
                      <g
                        className={s.senalar}
                        stroke="#012928"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      >
                        <path d="M-66 34C-78 54 -90 64 -100 78" />
                        <path d="M-110 70L-101 80L-90 74" />
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            )}

            {/* Carrito de compras en la acera */}
            <g
              transform={`translate(${diseno.carrito.x} ${diseno.carrito.y}) scale(${u(1)})`}
            >
              <g
                role="button"
                tabIndex={0}
                aria-label={`Abrir carrito${enCarrito ? `, ${enCarrito} productos` : ""}`}
                className={`${s.pin} ${s.aparecer}`}
                onClick={abrirCarrito}
                onKeyDown={alPulsar(abrirCarrito)}
              >
                <circle cy="-22" r="30" fill="transparent" />
                <g className={s.boton}>
                  <g transform={`scale(${diseno.escalas.carrito})`}>
                    <ellipse rx="34" ry="3.5" fill="#2B2218" opacity=".25" />
                    {/* Panel solar asomando del carrito */}
                    <polygon
                      points="-18,-52 6,-60 14,-30 -10,-24"
                      fill="#1D2B46"
                      stroke="#CBD2DA"
                      strokeWidth="1.5"
                    />
                    <path d="M-30 -36H26L19 -14H-23Z" fill="#012928" />
                    <path
                      d="M-21 -32V-17M-11 -32V-15M-1 -32V-14M9 -32V-14M18 -32V-16"
                      stroke="#AFEB17"
                      strokeWidth="1.2"
                      opacity=".55"
                    />
                    <path
                      d="M26 -36L33 -50H42"
                      stroke="#012928"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <path
                      d="M-23 -14L-26 -8H21"
                      stroke="#012928"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <circle cx="-20" cy="-4" r="4" fill="#2A2E33" />
                    <circle cx="16" cy="-4" r="4" fill="#2A2E33" />
                  </g>
                  {enCarrito > 0 && (
                    <g transform={`translate(${22.5 * diseno.escalas.carrito} ${-50 * diseno.escalas.carrito})`}>
                      <circle
                        r="10"
                        fill="#AFEB17"
                        stroke="#012928"
                        strokeWidth="1.5"
                      />
                      <text
                        textAnchor="middle"
                        y="4"
                        fontSize="11"
                        fontWeight={800}
                        fill="#012928"
                      >
                        {enCarrito}
                      </text>
                    </g>
                  )}
                </g>
                {nombreBajo("Carrito", 10)}
              </g>
            </g>

            {diseno.pines.map((pin, i) => {
              const zona = ZONAS_POR_ID[pin.zona];
              const Icono = ICONOS[pin.zona];
              return (
                <g
                  key={pin.zona}
                  transform={`translate(${pin.x} ${pin.y}) scale(${u(1)})`}
                >
                  <g
                    role="button"
                    tabIndex={0}
                    aria-label={`Ver ${zona.nombre}`}
                    className={`${s.pin} ${s.aparecer}`}
                    style={{
                      animationDelay: `calc(var(--demora, 0s) + ${300 + i * 70}ms)`,
                    }}
                    onClick={() => onElegir(pin.zona)}
                    onKeyDown={alPulsar(() => onElegir(pin.zona))}
                    onMouseEnter={() => setResaltada(pin.zona)}
                    onMouseLeave={() => setResaltada(null)}
                    onFocus={() => setResaltada(pin.zona)}
                    onBlur={() => setResaltada(null)}
                  >
                    {/* Zona tocable generosa, invisible */}
                    <circle r="28" fill="transparent" />
                    <circle className={s.halo} r="18" fill="#AFEB17" />
                    <g className={s.boton}>
                      <circle
                        className={s.anillo}
                        r="18"
                        fill="#012928"
                        stroke="#fff"
                        strokeWidth="2.5"
                      />
                      <Icono
                        x={-9}
                        y={-9}
                        size={18}
                        color="#fff"
                        strokeWidth={2.2}
                      />
                    </g>
                    {nombreBajo(
                      completo || vertical ? zona.nombre : zona.corto,
                      23,
                      vertical,
                    )}
                  </g>
                </g>
              );
            })}
          </>
        )}
      </CasaSolar>
    </div>
  );
}
