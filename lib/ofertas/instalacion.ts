import type { InstalacionKit, PiezaInstalacion } from "@/types/ofertas";

// Agrupa los materiales de un kit por su papel en la instalación para
// dibujar "Ver cómo quedaría". Los items de la oferta no traen foto: la foto y
// el nombre comercial salen del catálogo, buscando por `material_codigo`.

export interface ItemKit {
  categoria?: string | null;
  descripcion?: string | null;
  cantidad?: number | null;
  material_codigo?: string | null;
  foto?: string | null;
}

export interface MaterialCatalogo {
  nombre: string | null;
  foto: string | null;
}

/** Categorías del catálogo de las que salen las piezas que se dibujan. */
export const CATEGORIAS_INSTALACION = [
  "PANELES",
  "INVERSORES",
  "BATERIAS",
  "PROTECCIONES",
  "GABINETES",
  "ESTRUCTURAS",
];

export const normalizarCategoria = (texto?: string | null) =>
  (texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .trim();

/** "Enengy: 14.3kWh\nVoltage…" → "Enengy: 14.3kWh" */
const primeraLinea = (texto?: string | null) =>
  (texto ?? "").split("\n")[0].replace(/\s+/g, " ").trim();

const numero = (texto: string, patron: RegExp) => {
  const m = texto.match(patron);
  return m ? parseFloat(m[1].replace(",", ".")) : null;
};

export function construirInstalacion(
  items: ItemKit[],
  catalogo?: Map<string, MaterialCatalogo>,
): InstalacionKit | null {
  const kit: InstalacionKit = {
    paneles: [],
    inversores: [],
    baterias: [],
    proteccionDc: [],
    tablero: [],
    estructuras: [],
  };

  for (const item of items) {
    const categoria = normalizarCategoria(item.categoria);
    if (!CATEGORIAS_INSTALACION.includes(categoria)) continue;

    const delCatalogo = item.material_codigo
      ? catalogo?.get(item.material_codigo)
      : undefined;
    const nombre = primeraLinea(delCatalogo?.nombre || item.descripcion);
    // El nombre del catálogo suele traer la potencia; la descripción a veces no.
    const texto = `${nombre} ${item.descripcion ?? ""}`;
    const pieza: PiezaInstalacion = {
      codigo: item.material_codigo ?? null,
      nombre,
      cantidad: item.cantidad && item.cantidad > 0 ? item.cantidad : 1,
      foto: delCatalogo?.foto ?? item.foto ?? null,
      potencia: null,
    };

    switch (categoria) {
      case "PANELES":
        pieza.potencia = numero(texto, /(\d{3,4})\s*W\b/i);
        kit.paneles.push(pieza);
        break;
      case "INVERSORES":
        if (/WIFI/i.test(texto)) break;
        pieza.potencia = numero(texto, /(\d+(?:[.,]\d+)?)\s*KW/i);
        kit.inversores.push(pieza);
        break;
      case "BATERIAS":
        if (/COMBINADORA/i.test(texto)) break;
        pieza.potencia = numero(texto, /(\d+(?:[.,]\d+)?)\s*KW/i);
        kit.baterias.push(pieza);
        break;
      case "PROTECCIONES":
        if (/VDC|FUSIBLE|PORTAFUSIBLE|GPV/i.test(texto)) kit.proteccionDc.push(pieza);
        else kit.tablero.push(pieza);
        break;
      case "GABINETES":
        kit.tablero.push(pieza);
        break;
      case "ESTRUCTURAS":
        kit.estructuras.push(pieza);
        break;
    }
  }

  return kit.inversores.length > 0 ? kit : null;
}
