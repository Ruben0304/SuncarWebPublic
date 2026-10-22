"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import dynamic from "next/dynamic";
import { Loader2, X } from "lucide-react";
import { recomendadorService } from "@/services/api/recomendadorService";
import {
  etiquetaPaneles,
  etiquetaPotenciaBateria,
  etiquetaPotenciaInversor,
  type KitConfigurable,
} from "@/lib/ofertas/configurador";
import { formatearPrecio } from "@/lib/ofertas/ofertas-publicas";
import { etiquetaVoltaje } from "@/components/ofertas/ChipVoltaje";
import type { OfertaSimplificada, RecomendadorData } from "@/types/ofertas";

// "Elegir con IA": el cliente cuenta qué necesita y el recomendador (el mismo
// del listado de kits) sugiere entre los kits publicados. Cada sugerencia que
// también está en el configurador se puede aplicar con un toque, y deja el
// kit elegido paso a paso.

// Solo se necesita cuando llega una respuesta: fuera de la carga inicial.
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

const EJEMPLOS = [
  "Que no se apague la nevera ni la TV por la noche",
  "Una casa con aire acondicionado",
  "Lo más económico para empezar",
];

const FILA =
  "flex w-full items-center justify-between gap-4 rounded-[12px] border border-[#86868b] bg-white p-[15px] text-left transition-colors hover:border-[#012928] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#012928]";

function resumenDe(kit: KitConfigurable): string {
  const c = kit.config;
  return (
    [
      etiquetaPotenciaInversor(c),
      etiquetaPotenciaBateria(c),
      c.paneles > 0 ? etiquetaPaneles(c) : "sin paneles",
    ].join(" + ") + (kit.voltaje ? ` · ${etiquetaVoltaje(kit.voltaje)}` : "")
  );
}

interface Props {
  kits: KitConfigurable[];
  moneda: string;
  /** Aplica el kit al configurador. */
  onElegir: (kit: KitConfigurable) => void;
  onCerrar: () => void;
}

export default function ElegirConIA({ kits, moneda, onElegir, onCerrar }: Props) {
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<RecomendadorData | null>(null);
  const campo = useRef<HTMLTextAreaElement>(null);

  const consultar = async (consulta: string) => {
    const limpia = consulta.trim();
    if (!limpia || cargando) return;
    setCargando(true);
    setError(null);
    const respuesta = await recomendadorService.recomendarOfertas(limpia);
    if (respuesta.success && respuesta.data) {
      setResultado(respuesta.data);
    } else {
      setResultado(null);
      setError(respuesta.message || "No pudimos obtener recomendaciones.");
    }
    setCargando(false);
  };

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    void consultar(texto);
  };

  const teclado = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void consultar(texto);
    }
  };

  // El recomendador responde con el id de Mongo; el configurador usa el número.
  const aplicables = (resultado?.ofertas ?? []).flatMap((oferta: OfertaSimplificada) => {
    const kit = kits.find(
      (k) => (k.idInterno && k.idInterno === oferta.id) || k.id === oferta.id,
    );
    return kit ? [kit] : [];
  });

  return (
    <section
      aria-label="Elegir con IA"
      className="mb-8 rounded-[18px] bg-[#F5F5F7] p-5 sm:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-[24px] font-semibold leading-[1.17] tracking-[-0.003em] text-[#012928]">
          Cuéntanos qué necesitas.{" "}
          <span className="text-[#86868b]">Te sugerimos los kits que mejor encajan.</span>
        </h2>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#e8e8ed] text-[#1d1d1f] transition-colors hover:bg-[#d2d2d7]"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={enviar} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="armar-ia-texto" className="sr-only">
          Qué necesitas
        </label>
        <textarea
          id="armar-ia-texto"
          ref={campo}
          rows={2}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={teclado}
          disabled={cargando}
          placeholder="Ej: quiero que no se apague la nevera ni la TV por la noche"
          className="min-h-[56px] w-full flex-1 resize-none rounded-[12px] border border-[#86868b] bg-white p-[15px] text-[17px] leading-[1.3] tracking-[-0.022em] text-[#012928] placeholder:text-[#86868b] focus:border-2 focus:border-[#012928] focus:p-[14px] focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!texto.trim() || cargando}
          className="rounded-full bg-[#012928] px-6 py-3 text-[17px] tracking-[-0.022em] text-white transition-opacity hover:opacity-90 disabled:opacity-40 sm:self-end"
        >
          Sugerir kits
        </button>
      </form>

      {!resultado && !cargando && (
        <div className="mt-3 flex flex-wrap gap-2">
          {EJEMPLOS.map((ejemplo) => (
            <button
              key={ejemplo}
              type="button"
              onClick={() => {
                setTexto(ejemplo);
                campo.current?.focus();
              }}
              className="rounded-full border border-[#d2d2d7] bg-white px-4 py-2 text-left text-sm tracking-[-0.016em] text-[#1d1d1f] transition-colors hover:border-[#012928]"
            >
              {ejemplo}
            </button>
          ))}
        </div>
      )}

      {cargando && (
        <p
          role="status"
          className="mt-5 flex items-center gap-2 text-sm tracking-[-0.016em] text-[#6e6e73]"
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Buscando los kits que mejor encajan…
        </p>
      )}

      {error && (
        <p role="alert" className="mt-5 text-sm leading-[1.43] tracking-[-0.016em] text-[#1d1d1f]">
          {error}{" "}
          <button
            type="button"
            onClick={() => void consultar(texto)}
            className="text-[#012928] underline underline-offset-2 hover:no-underline"
          >
            Intentar de nuevo
          </button>
        </p>
      )}

      {resultado && !cargando && (
        <div className="mt-6">
          {resultado.texto && (
            <div className="prose prose-sm max-w-none text-[#1d1d1f]">
              <ReactMarkdown>{resultado.texto}</ReactMarkdown>
            </div>
          )}

          {aplicables.length > 0 ? (
            <div className="mt-5 flex flex-col gap-[14px]">
              {aplicables.map((kit) => (
                <button
                  key={kit.id}
                  type="button"
                  onClick={() => onElegir(kit)}
                  className={FILA}
                >
                  <span className="block min-w-0">
                    <span className="block text-[17px] leading-[1.24] tracking-[-0.022em] text-[#012928]">
                      {resumenDe(kit)}
                    </span>
                    <span className="mt-1 hidden text-xs font-semibold leading-[1.33] tracking-[-0.01em] text-[#012928] sm:block">
                      {kit.descripcion}
                    </span>
                  </span>
                  <span className="block flex-shrink-0 text-right text-xs leading-[1.33] tracking-[-0.01em] text-[#012928]">
                    <span className="block text-sm font-semibold">
                      {formatearPrecio(kit.precio)} {moneda}
                    </span>
                    <span className="underline underline-offset-2">Usar este kit</span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            (resultado.ofertas ?? []).length > 0 && (
              <p className="mt-5 text-sm leading-[1.43] tracking-[-0.016em] text-[#6e6e73]">
                Ninguna de esas sugerencias se puede armar aquí. Elige las opciones de
                abajo o contáctanos y te preparamos una configuración.
              </p>
            )
          )}
        </div>
      )}
    </section>
  );
}
