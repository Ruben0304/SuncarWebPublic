"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { fotoDeEquipo } from "@/lib/ofertas/fotos-equipos";
import type { InstalacionKit, PiezaInstalacion } from "@/types/ofertas";
import CasaRealista, { type Etiquetas } from "./CasaRealista";
import { HORIZONTAL, VERTICAL, type ContenidoKit } from "./escena-realista";

// "Ver cómo quedaría": el kit montado en una casa realista de una planta, con
// el número exacto de paneles en la azotea y, dentro, las fotos reales de sus
// equipos a escala. Cada pieza lleva una etiqueta con lo que es y cuánto rinde.

const cuantos = (piezas: PiezaInstalacion[]) => piezas.reduce((n, p) => n + p.cantidad, 0);

/** Suma de potencias × cantidad; null si alguna pieza no la declara. */
const potenciaTotal = (piezas: PiezaInstalacion[]) =>
  piezas.length > 0 && piezas.every((p) => p.potencia !== null)
    ? piezas.reduce((n, p) => n + (p.potencia ?? 0) * p.cantidad, 0)
    : null;

const cifra = (n: number) => n.toLocaleString("es-ES", { maximumFractionDigits: 2 });

/** "Transferencial · 2 breakers" a partir de lo que trae el kit. */
function resumenTablero(piezas: PiezaInstalacion[]) {
  const partes: string[] = [];
  if (piezas.some((p) => /TRANSFERENCIAL/i.test(p.nombre))) partes.push("Transferencial");
  const breakers = cuantos(piezas.filter((p) => /BREAKER/i.test(p.nombre)));
  if (breakers) partes.push(`${breakers} ${breakers === 1 ? "breaker" : "breakers"}`);
  if (!partes.length && piezas.some((p) => /GABINETE|CUADRO/i.test(p.nombre))) partes.push("Gabinete");
  return partes.join(" · ");
}

/** Lo que la escena necesita saber del kit para dibujarlo. */
function contenido(kit: InstalacionKit): ContenidoKit {
  const inversor = kit.inversores[0];
  const bateria = kit.baterias[0];
  const hayPaneles = kit.paneles.length > 0;
  return {
    paneles: cuantos(kit.paneles),
    inversor: {
      cantidad: cuantos(kit.inversores),
      foto: fotoDeEquipo(inversor.codigo, inversor.foto, 0.55),
    },
    baterias: bateria
      ? { cantidad: cuantos(kit.baterias), foto: fotoDeEquipo(bateria.codigo, bateria.foto, 1) }
      : null,
    proteccionDc: hayPaneles && kit.proteccionDc.length > 0,
    tablero: kit.tablero.length
      ? {
          gabinete: kit.tablero.some((p) => /GABINETE|CUADRO/i.test(p.nombre)),
          transferencial: kit.tablero.some((p) => /TRANSFERENCIAL/i.test(p.nombre)),
        }
      : null,
  };
}

function etiquetas(kit: InstalacionKit): Etiquetas {
  const nPaneles = cuantos(kit.paneles);
  const kwp = potenciaTotal(kit.paneles);
  const nInv = cuantos(kit.inversores);
  const kw = kit.inversores[0].potencia;
  const nBat = cuantos(kit.baterias);
  const kwh = potenciaTotal(kit.baterias);
  const fusibles = cuantos(
    kit.proteccionDc.filter((p) => /FUSIBLE/i.test(p.nombre) && !/PORTA/i.test(p.nombre)),
  );

  return {
    paneles: nPaneles
      ? {
          titulo: `${nPaneles} paneles solares`,
          detalle: kwp ? `${cifra(kwp / 1000)} kWp en total` : kit.paneles[0].nombre,
          corta: `${nPaneles} paneles${kwp ? ` · ${cifra(kwp / 1000)} kWp` : ""}`,
        }
      : undefined,
    proteccion:
      nPaneles && kit.proteccionDc.length
        ? {
            titulo: "Protección de paneles",
            detalle: fusibles ? `${fusibles} fusibles de continua` : "Fusibles de continua",
            corta: fusibles ? `${fusibles} fusibles DC` : "Fusibles DC",
          }
        : undefined,
    inversor: {
      titulo: nInv > 1 ? `${nInv} inversores Felicity` : "Inversor Felicity",
      detalle: kw ? `${nInv > 1 ? `${nInv} × ` : ""}${cifra(kw)} kW` : kit.inversores[0].nombre,
      corta: `${nInv > 1 ? `${nInv} inversores` : "Inversor"}${kw ? ` · ${cifra(kw)} kW` : ""}`,
    },
    baterias: nBat
      ? {
          titulo: nBat > 1 ? `${nBat} baterías Felicity` : "Batería Felicity",
          detalle: kwh ? `${cifra(kwh)} kWh de reserva` : kit.baterias[0].nombre,
          corta: `${nBat > 1 ? `${nBat} baterías` : "Batería"}${kwh ? ` · ${cifra(kwh)} kWh` : ""}`,
        }
      : undefined,
    tablero: kit.tablero.length
      ? {
          titulo: "Tablero eléctrico",
          detalle: resumenTablero(kit.tablero) || "Protecciones de la casa",
          corta: "Tablero eléctrico",
        }
      : undefined,
  };
}

interface ComoQuedariaProps {
  kit: InstalacionKit;
  nombre: string;
  onCerrar: () => void;
  /** Botón para pedir el kit, al pie. */
  accion?: ReactNode;
}

export default function ComoQuedaria({ kit, nombre, onCerrar, accion }: ComoQuedariaProps) {
  const [abierto, setAbierto] = useState(false);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const datos = useMemo(() => contenido(kit), [kit]);
  const textos = useMemo(() => etiquetas(kit), [kit]);
  // Esta vista solo existe en el navegador: se monta la composición de la
  // orientación actual y no se descargan las fotos de la otra.
  const [vertical, setVertical] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const actualizar = () => setVertical(mq.matches);
    actualizar();
    mq.addEventListener("change", actualizar);
    return () => mq.removeEventListener("change", actualizar);
  }, []);

  useEffect(() => {
    // Doble frame: el primero pinta la hoja abajo, el segundo ya la sube.
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => setAbierto(true));
    });
    cerrarRef.current?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const teclado = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", teclado);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", teclado);
    };
  }, [onCerrar]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cómo quedaría la instalación"
      className="fixed inset-0 z-[60] overflow-hidden bg-[#9FC3DE]"
      style={{
        transform: abierto ? "translateY(0)" : "translateY(100%)",
        transition: "transform .5s cubic-bezier(0.32, 0.72, 0, 1)",
      }}
    >
      {/* La casa ocupa toda la pantalla: el cielo queda bajo la cabecera y la
          calle bajo el botón. Se encaja entre los dos. */}
      <CasaRealista
        key={vertical ? "vertical" : "horizontal"}
        kit={datos}
        etiquetas={textos}
        variante={vertical ? VERTICAL : HORIZONTAL}
        prefijo={vertical ? "real-vertical" : "real-horizontal"}
        className="absolute inset-x-4 bottom-[118px] top-[72px] md:inset-x-16 md:bottom-[100px] md:top-[80px]"
      />

      <header className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <button
            ref={cerrarRef}
            type="button"
            onClick={onCerrar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/90 text-[#012928] shadow-sm ring-1 ring-[#012928]/[0.08] backdrop-blur transition-transform active:scale-90"
            aria-label="Volver a la oferta"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 rounded-2xl bg-white/85 px-3 py-1.5 shadow-sm backdrop-blur">
            <h2 className="text-[15px] font-bold leading-tight text-[#012928]">Así quedaría en tu casa</h2>
            <p className="truncate text-[11px] text-slate-500">{nombre}</p>
          </div>
        </div>
      </header>

      <footer className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto max-w-6xl px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {accion}
          <p className="mt-2 text-center text-[11px] leading-snug text-white/75">
            Imagen orientativa con los equipos reales de este kit. La ubicación final la define
            nuestro técnico en la visita.
          </p>
        </div>
      </footer>
    </div>
  );
}
