import type { OfertaSimplificada } from "@/types/ofertas";

/** "Oferta de 1x 5kW Inversor…" → "1x 5kW Inversor…" */
export function nombreKit(kit: OfertaSimplificada): string {
  return kit.descripcion.replace(/^oferta de\s*/i, "");
}
