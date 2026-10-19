import type { OfertaElemento } from "@/types/ofertas";

// "Ver qué trae el kit": arriba los equipos que definen el sistema, con su
// cantidad, en este orden; debajo, bajo "Además incluye", el resto del
// material, sin cantidad (varía con cada instalación).

/** Orden de los equipos principales. */
const PRINCIPALES = ["inversor", "mppt", "bateria", "caja-combinadora", "panel"] as const;
type Principal = (typeof PRINCIPALES)[number];

const sinTildes = (texto?: string | null) =>
  (texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .trim();

/**
 * La caja combinadora va por el nombre, como en el backend y el panel: en el
 * catálogo vive en BATERÍAS o en MATERIAL VARIO según sea de baterías o de
 * paneles. Un "Interruptor diferencial combinado" no lo es.
 */
const CAJA_COMBINADORA = /\bCAJA\s+COMBINADORA\b/i;
/** Un controlador MPPT suelto; un inversor "con 2 MPPT" ya cae antes como inversor. */
const MPPT_POR_NOMBRE = /^MPPT\b|\b(CONTROLADOR|REGULADOR)\b.*\bMPPT\b/i;

export function principalDe(elemento: OfertaElemento): Principal | null {
  const nombre = elemento.descripcion ?? "";
  if (CAJA_COMBINADORA.test(nombre)) return "caja-combinadora";
  const categoria = sinTildes(elemento.categoria);
  const seccion = sinTildes(elemento.seccion);
  if (categoria.startsWith("INVERSOR") || seccion === "INVERSORES") return "inversor";
  if (categoria.startsWith("MPPT") || seccion === "MPPT" || MPPT_POR_NOMBRE.test(nombre)) {
    return "mppt";
  }
  if (categoria.startsWith("BATERIA") || seccion === "BATERIAS") return "bateria";
  if (categoria.startsWith("PANEL") || seccion === "PANELES") return "panel";
  return null;
}

/** Dos líneas del mismo material se enseñan como una, con la cantidad sumada. */
function juntarRepetidos(elementos: OfertaElemento[]): OfertaElemento[] {
  const porClave = new Map<string, OfertaElemento>();
  for (const elemento of elementos) {
    const clave = elemento.codigo || sinTildes(elemento.descripcion) || null;
    const previo = clave ? porClave.get(clave) : undefined;
    if (previo) {
      previo.cantidad = (previo.cantidad ?? 0) + (elemento.cantidad ?? 0) || null;
      if (!previo.foto && elemento.foto) previo.foto = elemento.foto;
      continue;
    }
    porClave.set(clave ?? `sin-clave-${porClave.size}`, { ...elemento });
  }
  return Array.from(porClave.values());
}

export interface ElementosKit {
  /** Inversor, MPPT, baterías, cajas combinadoras y paneles, en ese orden. */
  principales: OfertaElemento[];
  /** El resto, agrupado por categoría en el orden en que aparece. */
  ademas: OfertaElemento[];
}

export function ordenarElementosKit(elementos: OfertaElemento[]): ElementosKit {
  const unicos = juntarRepetidos(elementos);
  const posicion = (e: OfertaElemento) => PRINCIPALES.indexOf(principalDe(e) as Principal);

  const principales = unicos
    .filter((e) => principalDe(e) !== null)
    .sort((a, b) => posicion(a) - posicion(b));

  const resto = unicos.filter((e) => principalDe(e) === null);
  const ordenCategoria = new Map<string, number>();
  for (const e of resto) {
    const categoria = sinTildes(e.categoria);
    if (!ordenCategoria.has(categoria)) ordenCategoria.set(categoria, ordenCategoria.size);
  }
  const ademas = resto.sort(
    (a, b) =>
      (ordenCategoria.get(sinTildes(a.categoria)) ?? 0) -
      (ordenCategoria.get(sinTildes(b.categoria)) ?? 0),
  );

  return { principales, ademas };
}
