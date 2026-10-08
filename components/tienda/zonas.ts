import type { ArticuloTienda } from "@/types/tienda";
import type { OfertaSimplificada } from "@/types/ofertas";

// Cada zona de la casa ilustrada agrupa categorías del catálogo. Dónde va su
// botón en cada diseño de la casa está en disenos.ts.

export type ZonaId =
  | "paneles"
  | "inversor"
  | "baterias"
  | "protecciones"
  | "cableado"
  | "electrodomesticos"
  | "material";

export interface Zona {
  id: ZonaId;
  nombre: string;
  /** Para el botón en pantallas estrechas. */
  corto: string;
  frase: string;
  /** Categorías del catálogo, ya normalizadas (sin tildes, en mayúsculas). */
  categorias: string[];
  /** Artículos de otras categorías que también pertenecen a esta zona. */
  extras?: RegExp;
  /** Recoge además toda categoría que no tenga zona propia. */
  resto?: boolean;
  /** Qué kits mostrar: todos, los que traen esa categoría, o ninguno. */
  kits?: "todos" | string;
}

export const ZONAS: Zona[] = [
  {
    id: "paneles",
    nombre: "Paneles solares",
    corto: "Paneles",
    frase: "Capturan el sol y lo convierten en electricidad.",
    categorias: ["PANELES"],
    extras: /MC4|COMBINADORA DE PANELES/,
    kits: "PANELES",
  },
  {
    id: "inversor",
    nombre: "Inversor",
    corto: "Inversor",
    frase: "El cerebro del sistema: alimenta tu casa con la energía del sol.",
    categorias: ["INVERSORES"],
    kits: "todos",
  },
  {
    id: "baterias",
    nombre: "Baterías",
    corto: "Baterías",
    frase: "Guardan la energía para la noche y los apagones.",
    categorias: ["BATERIAS"],
    kits: "BATERIAS",
  },
  {
    id: "protecciones",
    nombre: "Protecciones",
    corto: "Breakers",
    frase: "Breakers, transferenciales y gabinetes que cuidan la instalación.",
    categorias: ["PROTECCIONES", "GABINETES"],
  },
  {
    id: "cableado",
    nombre: "Cableado",
    corto: "Cables",
    frase: "Cable solar y cable eléctrico para unir todo el sistema.",
    categorias: ["CABLE SOLAR", "CABLES LHA"],
  },
  {
    id: "electrodomesticos",
    nombre: "Electrodomésticos",
    corto: "Electro",
    frase: "Equipa tu hogar y úsalo con tu propia energía.",
    categorias: ["ELECTRODOMESTICOS"],
  },
  {
    id: "material",
    nombre: "Material vario",
    corto: "Material",
    frase: "Conectores, accesorios y todo lo demás para tu instalación.",
    categorias: ["MATERIAL VARIO"],
    resto: true,
  },
];

export const ZONAS_POR_ID = Object.fromEntries(
  ZONAS.map((z) => [z.id, z]),
) as Record<ZonaId, Zona>;

export function normalizar(texto: string | null | undefined): string {
  return (texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .trim();
}

// Lo que ya tiene zona propia; el resto cae en la zona `resto`, así un
// artículo publicado en una categoría nueva nunca se queda sin mostrar.
const CON_ZONA = new Set(ZONAS.filter((z) => !z.resto).flatMap((z) => z.categorias));

export function productosDeZona(
  zona: Zona,
  productos: ArticuloTienda[],
): ArticuloTienda[] {
  return productos.filter((p) => {
    const categoria = normalizar(p.categoria);
    return (
      zona.categorias.includes(categoria) ||
      (zona.resto === true && !CON_ZONA.has(categoria)) ||
      (zona.extras?.test(normalizar(p.modelo)) ?? false)
    );
  });
}

export function kitsDeZona(
  zona: Zona,
  kits: OfertaSimplificada[],
): OfertaSimplificada[] {
  if (!zona.kits) return [];
  if (zona.kits === "todos") return kits;
  return kits.filter((k) => k.categorias?.includes(zona.kits as string));
}
