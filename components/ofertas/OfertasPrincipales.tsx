"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { OfertaSimplificada } from "@/types/ofertas";
import { formatearPrecio } from "@/lib/ofertas/ofertas-publicas";
import { ESTILOS } from "./EtiquetasOferta";

/**
 * Fila horizontal, con scroll, de los kits que tienen etiqueta («Más vendida»…). Va encima de
 * «Comprar un kit»: ahí las etiquetas no se ven en las tarjetas del listado, que solo se abre
 * desde el pie del configurador. Elegir uno deja el configurador en ese kit.
 */
export function OfertasPrincipales({
  ofertas,
  onElegir,
  className,
}: {
  ofertas: OfertaSimplificada[];
  onElegir: (id: string) => void;
  className?: string;
}) {
  const principales = ofertas
    .filter((o) => o.id && o.is_active !== false && o.etiquetas?.length)
    .sort((a, b) => (b.etiquetas?.[0]?.prioridad ?? 0) - (a.etiquetas?.[0]?.prioridad ?? 0));
  if (!principales.length) return null;

  return (
    <section aria-label="Ofertas principales" className={cn("mb-4", className)}>
      <h2 className="mb-2 px-1 text-sm font-semibold text-[#012928]">Ofertas principales</h2>
      <ul className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] sm:mx-0 sm:px-0">
        {principales.map((o) => {
          const etiqueta = o.etiquetas![0];
          const estilo = ESTILOS[etiqueta.color];
          return (
            <li key={o.id} className="w-36 shrink-0 snap-start sm:w-40">
              <button
                type="button"
                onClick={() => onElegir(o.id as string)}
                className="group block w-full overflow-hidden rounded-xl bg-white text-left shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#012928]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#F5F5F7]">
                  <Image
                    src={o.imagen || "/placeholder.svg"}
                    alt={o.descripcion}
                    fill
                    sizes="160px"
                    quality={60}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span
                    className="absolute left-1.5 top-1.5 rounded-full px-2 py-[3px] text-[9px] font-extrabold uppercase leading-none tracking-[0.06em]"
                    style={{ background: estilo.fondo, color: estilo.texto }}
                  >
                    {etiqueta.texto}
                  </span>
                </div>
                <div className="p-2">
                  <p className="line-clamp-2 text-[11px] font-medium leading-snug text-[#012928]">
                    {o.descripcion}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#012928]">
                    {formatearPrecio(o.precio)} {o.moneda?.toUpperCase()}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
