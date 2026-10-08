"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, MapPin, MessageCircle } from "lucide-react";
import { ICONOS } from "./EscenaCasa";
import { TarjetaFantasma, TarjetaKit, TarjetaProducto } from "./Tarjetas";
import { ZONAS, ZONAS_POR_ID, kitsDeZona, productosDeZona, type Zona, type ZonaId } from "./zonas";
import type { ArticuloTienda, ProvinciaOferta } from "@/types/tienda";
import type { OfertaSimplificada } from "@/types/ofertas";
import t from "./tienda.module.css";

const CURVA = "cubic-bezier(0.32, 0.72, 0, 1)";
const DURACION_SALIDA = 380;

interface CatalogoZonaProps {
  zonaId: ZonaId;
  productos: ArticuloTienda[];
  kits: OfertaSimplificada[];
  cargando: boolean;
  error: string | null;
  onReintentar: () => void;
  provincia: string;
  provincias: ProvinciaOferta[];
  onProvincia: (codigo: string) => void;
  onCambiar: (zona: ZonaId) => void;
  onCerrar: () => void;
  onAgregar: (producto: ArticuloTienda) => void;
  onVer: (producto: ArticuloTienda) => void;
}

/**
 * Catálogo de una zona a pantalla completa. Sube como una hoja en el móvil;
 * las píldoras de arriba cambian de zona sin volver a la casa.
 */
export default function CatalogoZona({
  zonaId,
  productos,
  kits,
  cargando,
  error,
  onReintentar,
  provincia,
  provincias,
  onProvincia,
  onCambiar,
  onCerrar,
  onAgregar,
  onVer,
}: CatalogoZonaProps) {
  const zona = ZONAS_POR_ID[zonaId];
  const [abierto, setAbierto] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pildorasRef = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Doble frame: el primero pinta la hoja abajo, el segundo ya la sube.
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => setAbierto(true));
    });
    cerrarRef.current?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = overflow;
    };
  }, []);

  const cerrar = useCallback(() => {
    setAbierto(false);
    setTimeout(onCerrar, DURACION_SALIDA);
  }, [onCerrar]);

  useEffect(() => {
    const teclado = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    window.addEventListener("keydown", teclado);
    return () => window.removeEventListener("keydown", teclado);
  }, [cerrar]);

  // Al cambiar de zona: arriba del todo y la píldora activa a la vista.
  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    pildorasRef.current
      ?.querySelector<HTMLElement>(`[data-zona="${zonaId}"]`)
      ?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [zonaId]);

  const propios = useMemo(() => productosDeZona(zona, productos), [zona, productos]);
  const suyos = useMemo(() => kitsDeZona(zona, kits), [zona, kits]);
  const total = propios.length + suyos.length;

  return (
    <div
      ref={scrollRef}
      role="dialog"
      aria-modal="true"
      aria-label={zona.nombre}
      className={`${t.sinBarra} fixed inset-0 z-[55] overflow-y-auto overscroll-contain bg-[#F2F2EF]`}
      style={{
        transform: abierto ? "translateY(0)" : "translateY(100%)",
        transition: `transform .5s ${CURVA}`,
      }}
    >
      <header className="sticky top-0 z-10 bg-[#F2F2EF]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <button
            ref={cerrarRef}
            type="button"
            onClick={cerrar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#012928] ring-1 ring-[#012928]/[0.08] transition-transform active:scale-90"
            aria-label="Volver a la casa"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div key={zonaId} className={`${t.entrar} min-w-0 flex-1`}>
            <h2 className="truncate text-lg font-bold leading-tight text-[#012928]">
              {zona.nombre}
            </h2>
            <p className="text-xs text-slate-500">
              {cargando && zona.categorias.length > 0
                ? "Cargando…"
                : `${total} ${total === 1 ? "opción" : "opciones"}`}
            </p>
          </div>
          {provincias.length > 0 && (
            <label className="flex shrink-0 items-center gap-1 rounded-full bg-white py-1 pl-2.5 pr-1 ring-1 ring-[#012928]/[0.08]">
              <MapPin className="h-3.5 w-3.5 text-[#012928]" />
              <span className="sr-only">Provincia</span>
              <select
                value={provincia}
                onChange={(e) => onProvincia(e.target.value)}
                className="max-w-[7.5rem] cursor-pointer truncate bg-transparent py-1 pr-1 text-[13px] font-semibold text-[#012928] outline-none"
              >
                {provincias.map((p) => (
                  <option key={p.codigo} value={p.codigo}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div
          ref={pildorasRef}
          className={`${t.sinBarra} mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3`}
        >
          {ZONAS.map((z) => {
            const I = ICONOS[z.id];
            const activa = z.id === zonaId;
            return (
              <button
                key={z.id}
                type="button"
                data-zona={z.id}
                onClick={() => onCambiar(z.id)}
                aria-current={activa}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors duration-300 ${
                  activa
                    ? "bg-[#012928] text-white"
                    : "bg-white text-[#012928]/75 ring-1 ring-[#012928]/[0.08] hover:text-[#012928]"
                }`}
              >
                <I className={`h-3.5 w-3.5 ${activa ? "text-[#AFEB17]" : ""}`} />
                {z.nombre}
              </button>
            );
          })}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28">
        <p key={zonaId} className={`${t.entrar} mt-1 text-sm text-slate-500`}>
          {zona.frase}
        </p>

        <div key={`l-${zonaId}`}>
          {error && zona.categorias.length > 0 ? (
            <div className="mt-6 rounded-[22px] bg-white p-6 text-center ring-1 ring-[#012928]/[0.06]">
              <p className="font-semibold text-[#012928]">No pudimos cargar los productos</p>
              <button
                type="button"
                onClick={onReintentar}
                className="mt-3 rounded-full bg-[#012928] px-5 py-2 text-sm font-semibold text-white"
              >
                Reintentar
              </button>
            </div>
          ) : cargando && zona.categorias.length > 0 ? (
            <Rejilla>
              {Array.from({ length: 4 }, (_, i) => (
                <TarjetaFantasma key={i} />
              ))}
            </Rejilla>
          ) : propios.length > 0 ? (
            <Rejilla titulo={suyos.length > 0 ? "Por separado" : undefined}>
              {propios.map((p, i) => (
                <TarjetaProducto
                  key={p.id}
                  producto={p}
                  onAgregar={onAgregar}
                  onVer={onVer}
                  compacta
                  prioritaria={i < 4}
                  className={t.entrar}
                  style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
                />
              ))}
            </Rejilla>
          ) : zona.categorias.length > 0 ? (
            <SinProductos zona={zona} hayKits={suyos.length > 0} />
          ) : null}

          {suyos.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Incluido en estos kits con instalación
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {suyos.map((k, i) => (
                  <TarjetaKit
                    key={k.id ?? i}
                    kit={k}
                    className={t.entrar}
                    style={{
                      animationDelay: `${(Math.min(i, 8) + (propios.length ? 3 : 0)) * 45}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Rejilla({ titulo, children }: { titulo?: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      {titulo && (
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {titulo}
        </h3>
      )}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{children}</div>
    </div>
  );
}

function SinProductos({ zona, hayKits }: { zona: Zona; hayKits: boolean }) {
  return (
    <div className={`${t.entrar} mt-6 rounded-[22px] bg-white p-5 ring-1 ring-[#012928]/[0.06]`}>
      <p className="text-[15px] font-semibold text-[#012928]">
        {hayKits
          ? `Las ${zona.nombre.toLowerCase()} van dentro de nuestros kits`
          : "Pronto tendremos productos aquí"}
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
        {hayKits
          ? "Así te las instalamos con garantía y dimensionadas para tu consumo."
          : "Escríbenos y te decimos qué tenemos disponible ahora mismo."}
      </p>
      {!hayKits && (
        <Link
          href="/contacto"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#012928] px-4 py-2 text-sm font-semibold text-white"
        >
          <MessageCircle className="h-4 w-4" />
          Contáctanos
        </Link>
      )}
    </div>
  );
}
