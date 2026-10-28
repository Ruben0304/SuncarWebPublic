import type { EtiquetaOferta, Oferta, OfertaSimplificada } from "@/types/ofertas";
import { extraerConfigKit, type PotenciasCatalogo } from "./configurador";
import { construirInstalacion, type MaterialCatalogo } from "./instalacion";

// Mapeo de los kits publicados, compartido por el render en servidor y la
// recarga desde el navegador para que ambos produzcan exactamente lo mismo.

export const OFERTAS_PUBLICAS_QUERY =
  "tipo_oferta=generica&estado=aprobada_para_enviar";

/**
 * Id con el que el backend sirve el detalle público de un kit.
 *
 * Desde que se cerraron los datos públicos (backend 57b51992) el detalle solo
 * se entrega por el id de Mongo, pero las URLs de la web usan el número de
 * oferta (OF-20260902-002), que es el que se comparte. Si llega un número, se
 * busca su id en la lista pública de kits.
 */
export function idDeDetalle(
  ofertaId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listaPublica: any[] | null | undefined,
): string | null {
  if (/^[0-9a-f]{24}$/i.test(ofertaId)) return ofertaId;
  const kit = listaPublica?.find((o) => o?.numero_oferta === ofertaId);
  return kit?.id ?? kit?._id ?? null;
}

const PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

interface ItemBackend {
  categoria?: string;
  seccion?: string | null;
  descripcion?: string;
  foto?: string | null;
  cantidad?: number | null;
  material_codigo?: string | null;
}

// Suma la potencia (kW) de todos los inversores de la oferta, multiplicada por su
// cantidad. Ej: 2x "Inversor 5kW Felicity Solar" -> 10.
function extraerPotenciaInversorTotal(items?: ItemBackend[] | null): number | null {
  if (!items || items.length === 0) return null;

  let total = 0;
  let found = false;

  for (const item of items) {
    if (item.categoria?.toUpperCase() !== "INVERSORES" || !item.descripcion) {
      continue;
    }

    const match = item.descripcion.match(/(\d+(?:[.,]\d+)?)\s*kw/i);
    if (!match) continue;

    const potencia = parseFloat(match[1].replace(",", "."));
    if (Number.isNaN(potencia)) continue;

    const cantidad = item.cantidad && item.cantidad > 0 ? item.cantidad : 1;
    total += potencia * cantidad;
    found = true;
  }

  return found ? total : null;
}

// Formatea la potencia total como "5KW" / "10KW" para el badge de la tarjeta.
function formatearPotenciaInversor(total: number | null): string | null {
  if (total === null) return null;
  const rounded = Math.round(total * 100) / 100;
  return `${rounded}KW`;
}

export function extraerMarca(items?: ItemBackend[] | null): string | null {
  if (!items || items.length === 0) return null;
  const inv = items.find((i) => i.categoria?.toUpperCase() === "INVERSORES");
  if (!inv?.descripcion) return null;
  const words = inv.descripcion.split(" ");
  const marca = words.filter((w, idx) => {
    if (idx === 0 && /^inversores?$/i.test(w)) return false;
    if (/^\d+/.test(w) || /^(kw|w|v|a|kwh)$/i.test(w)) return false;
    return /^[A-Z]/.test(w);
  });
  return marca.length > 0 ? marca.join(" ") : null;
}

export function normalizarUrlImagen(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${PUBLIC_BACKEND_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Formato fijo en español (12.500 / 12.500,5). toLocaleString() sin locale
 * da "12,500" en el servidor y "12.500" en un navegador en español, y esa
 * diferencia rompe la hidratación de la página.
 */
export function formatearPrecio(valor: number): string {
  if (typeof valor !== "number" || !Number.isFinite(valor)) {
    return String(valor ?? "");
  }
  const signo = valor < 0 ? "-" : "";
  const [entero, decimales] = Math.abs(valor).toFixed(2).split(".");
  const agrupado = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decimalesUtiles = decimales.replace(/0+$/, "");
  return `${signo}${agrupado}${decimalesUtiles ? `,${decimalesUtiles}` : ""}`;
}

/**
 * Términos de cara al cliente final. El backend pide el tipo de negocio
 * (BTB o BTC) y sin él responde 422, así que las garantías no salían.
 */
export const RUTA_TERMINOS_PUBLICOS = "/api/terminos-condiciones/activo?tipo_negocio=BTC";

/** La garantía de la respuesta de términos: su campo propio, o la sección del texto. */
export function garantiaDeTerminos(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  respuesta: any,
): string | null {
  const datos = respuesta?.success ? respuesta.data : null;
  const propia = typeof datos?.garantia === "string" ? datos.garantia.trim() : "";
  if (propia) return propia.replace(/\s*\n\s*/g, " ");
  return typeof datos?.texto === "string" ? extraerSeccionGarantia(datos.texto) : null;
}

export function extraerSeccionGarantia(texto: string): string | null {
  const normalized = texto.replace(/\r\n/g, "\n").trim();
  // El título puede venir numerado: "4. GARANTÍA".
  const headerMatch = /(?:^|\n)\s*(?:\d+[.)]\s*)?GARANT[ÍI]A\s*(?:\n+|:\s*)/i.exec(normalized);
  if (!headerMatch) return null;
  const remaining = normalized.slice(headerMatch.index + headerMatch[0].length);
  const sectionLines: string[] = [];
  for (const rawLine of remaining.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const letters = line
      .replace(/[0-9.,:%()\-•]/g, "")
      .replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");
    if (letters.length >= 3 && letters === letters.toUpperCase()) break;
    sectionLines.push(line.replace(/^[•\-*]\s*/, ""));
  }
  const text = sectionLines.join(" ").replace(/\s+/g, " ").trim();
  return text.length > 0 ? text : null;
}

/** Categorías del catálogo de las que sale la potencia de cada kit. */
export const CATEGORIAS_POTENCIA = ["INVERSORES", "BATERÍAS", "PANELES"];

export const rutaCatalogoLite = (categoria: string) =>
  `/api/productos/lite?categoria=${encodeURIComponent(categoria)}`;

/** codigo → potenciaKW, a partir de las respuestas de /api/productos/lite. */
export function potenciasDeCatalogo(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  respuestas: any[],
): PotenciasCatalogo {
  const potencias: PotenciasCatalogo = new Map();
  for (const respuesta of respuestas) {
    if (!respuesta?.success || !Array.isArray(respuesta.data)) continue;
    for (const grupo of respuesta.data) {
      for (const m of grupo.materiales ?? []) {
        const kw = parseFloat(m?.potenciaKW);
        if (m?.codigo && Number.isFinite(kw) && kw > 0) {
          potencias.set(String(m.codigo), kw);
        }
      }
    }
  }
  return potencias;
}

/** Desde el navegador: pide el catálogo; si falla, se lee de las descripciones. */
export async function cargarPotencias(baseUrl: string): Promise<PotenciasCatalogo> {
  const respuestas = await Promise.all(
    CATEGORIAS_POTENCIA.map((c) =>
      fetch(`${baseUrl}${rutaCatalogoLite(c)}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ),
  );
  return potenciasDeCatalogo(respuestas);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapOfertaSimplificada(o: any): OfertaSimplificada {
  return mapOferta(o);
}

/**
 * Los kits publicados, con su configuración leída de la potencia del
 * catálogo. Aparte de `mapOfertaSimplificada` porque esa se usa directamente
 * en `.map(...)`, y un segundo parámetro recibiría el índice.
 */
export function mapOfertasPublicas(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lista: any[],
  potencias?: PotenciasCatalogo,
): OfertaSimplificada[] {
  return lista.map((o) => mapOferta(o, potencias));
}

function mapOferta(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  o: any,
  potencias?: PotenciasCatalogo,
): OfertaSimplificada {
  return {
    id: o.numero_oferta || o.id || o._id || null,
    idInterno: o.id || o._id || null,
    descripcion: o.nombre_completo || o.nombre_oferta || "Oferta sin nombre",
    descripcion_detallada: o.nombre_completo || null,
    marca: extraerMarca(o.items),
    potenciaInversor: formatearPotenciaInversor(
      extraerPotenciaInversorTotal(o.items),
    ),
    precio: o.precio_final,
    precio_cliente: null,
    imagen: o.foto_portada || null,
    moneda: o.moneda_pago,
    financiamiento: true,
    descuentos:
      o.descuento_porcentaje && o.descuento_porcentaje > 0
        ? `${o.descuento_porcentaje}% de descuento`
        : null,
    pdf: null,
    is_active:
      o.tipo_oferta === "generica" && o.estado === "aprobada_para_enviar",
    categorias: extraerCategorias(o.items),
    codigos: extraerCodigos(o.items),
    config: extraerConfigKit(o.items, o.nombre_completo, potencias),
    voltaje: voltajeDe(o.voltaje),
    etiquetas: etiquetasDe(o.etiquetas),
  };
}

const COLORES_ETIQUETA = ["volt", "solar", "esmeralda", "medianoche"] as const;

/** Un solo listón por kit, con texto; un color desconocido cae a «volt» en vez de ocultar la etiqueta. */
export function etiquetasDe(valor: unknown): EtiquetaOferta[] {
  if (!Array.isArray(valor)) return [];
  const salida: EtiquetaOferta[] = [];
  for (const e of valor) {
    const texto = String((e as { texto?: unknown })?.texto ?? "")
      .replace(/\s+/g, " ")
      .trim();
    if (!texto) continue;
    const color = (e as { color?: unknown })?.color;
    const prioridad = (e as { prioridad?: unknown })?.prioridad;
    salida.push({
      texto,
      color: (COLORES_ETIQUETA as readonly unknown[]).includes(color)
        ? (color as EtiquetaOferta["color"])
        : "volt",
      ...(typeof prioridad === "number" ? { prioridad } : {}),
    });
  }
  return salida.slice(0, 1);
}

/** 110 o 220; cualquier otra cosa (o nada, en los kits de antes) es null. */
function voltajeDe(valor: unknown): number | null {
  const numero = Number(valor);
  return numero === 110 || numero === 220 ? numero : null;
}

// Sin tildes: el inventario escribe "BATERÍAS" y a veces "BATERIAS".
function extraerCategorias(items?: ItemBackend[] | null): string[] {
  const categorias = new Set<string>();
  for (const item of items ?? []) {
    if (!item.categoria) continue;
    categorias.add(
      item.categoria
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toUpperCase()
        .trim(),
    );
  }
  return Array.from(categorias);
}

function extraerCodigos(items?: ItemBackend[] | null): string[] {
  const codigos = new Set<string>();
  for (const item of items ?? []) {
    const codigo = item.material_codigo?.toString().trim();
    if (codigo) codigos.add(codigo);
  }
  return Array.from(codigos);
}

export function mapOfertaDetalle(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  o: any,
  garantiaTexto: string | null,
  /** Fotos y nombres por código de material; sin él se dibuja sin fotos. */
  catalogo?: Map<string, MaterialCatalogo>,
): Oferta {
  const materiales: ItemBackend[] = o.materiales || o.items || [];
  return {
    id: o.id || o._id || null,
    descripcion: o.nombre_completo || o.nombre_oferta || "Oferta sin nombre",
    descripcion_detallada: o.nombre_completo || null,
    marca: extraerMarca(materiales),
    precio: o.precio_final,
    precio_cliente: null,
    imagen: normalizarUrlImagen(o.foto_portada),
    moneda: o.moneda_pago,
    financiamiento: true,
    descuentos: null,
    pdf: null,
    terminos_condiciones_texto: garantiaTexto,
    voltaje: voltajeDe(o.voltaje),
    garantias: garantiaTexto ? [garantiaTexto] : [],
    elementos: materiales.map((item) => ({
      codigo: item.material_codigo?.toString().trim() || null,
      categoria: item.categoria || null,
      seccion: item.seccion || null,
      foto: normalizarUrlImagen(item.foto),
      descripcion: item.descripcion || null,
      cantidad: item.cantidad || null,
    })),
    is_active:
      o.tipo_oferta === "generica" && o.estado === "aprobada_para_enviar",
    instalacion: construirInstalacion(
      materiales.map((item) => ({ ...item, foto: normalizarUrlImagen(item.foto) })),
      catalogo,
    ),
  };
}
