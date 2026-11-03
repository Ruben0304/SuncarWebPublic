import { cn } from "@/lib/utils";
import type { EtiquetaOferta } from "@/types/ofertas";

// Fondo del listón, color del texto y la sombra del pliegue, todos de la paleta de la marca.
const ESTILOS: Record<
  EtiquetaOferta["color"],
  { fondo: string; texto: string; pliegue: string }
> = {
  volt: { fondo: "#AFEB17", texto: "#012928", pliegue: "#6E8F0E" },
  solar: { fondo: "#F2C300", texto: "#012928", pliegue: "#9A7C00" },
  esmeralda: { fondo: "#012928", texto: "#AFEB17", pliegue: "#000F0F" },
  medianoche: { fondo: "#0A052D", texto: "#F2C300", pliegue: "#030114" },
};

/**
 * Listones de la esquina de una tarjeta de kit («Más vendida», «Recomendada»…): cintas finas
 * que cuelgan del borde derecho, con la punta en V, una debajo de otra. Va dentro de un
 * contenedor `relative`; `className` fija la altura (`top-4` por defecto) para esquivar otros
 * elementos de la esquina.
 */
export function EtiquetasOferta({
  etiquetas,
  className,
}: {
  etiquetas?: EtiquetaOferta[] | null;
  className?: string;
}) {
  if (!etiquetas?.length) return null;
  return (
    <ul
      aria-label="Etiquetas de la oferta"
      className={cn(
        "pointer-events-none absolute right-0 top-4 z-10 flex flex-col items-end gap-2.5",
        className,
      )}
    >
      {etiquetas.map((e, i) => {
        const estilo = ESTILOS[e.color];
        return (
          <li
            key={`${e.texto}-${i}`}
            className="relative animate-in fade-in slide-in-from-right-3 duration-500 drop-shadow-[0_2px_3px_rgba(1,41,40,0.35)]"
            style={{ animationDelay: `${i * 90}ms`, animationFillMode: "backwards" }}
          >
            <span
              className="block whitespace-nowrap py-[5px] pl-5 pr-3.5 text-[11px] font-extrabold uppercase leading-none tracking-[0.09em] sm:text-xs"
              style={{
                background: estilo.fondo,
                color: estilo.texto,
                // La punta en V del listón.
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 11px 50%)",
              }}
            >
              {e.texto}
            </span>
            {/* El pliegue: de donde "cuelga" la cinta. */}
            <span
              aria-hidden
              className="absolute right-0 top-full h-[5px] w-[7px]"
              style={{
                background: estilo.pliegue,
                clipPath: "polygon(0 0, 100% 0, 100% 100%)",
              }}
            />
          </li>
        );
      })}
    </ul>
  );
}
