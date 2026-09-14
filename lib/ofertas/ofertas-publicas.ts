import type { Oferta, OfertaSimplificada } from "@/types/ofertas";

// Mapeo de los kits publicados, compartido por el render en servidor y la
// recarga desde el navegador para que ambos produzcan exactamente lo mismo.

export const OFERTAS_PUBLICAS_QUERY =
  "tipo_oferta=generica&estado=aprobada_para_enviar";

const PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

interface ItemBackend {
  categoria?: string;
  descripcion?: string;
  foto?: string | null;
  cantidad?: number | null;
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

export function extraerSeccionGarantia(texto: string): string | null {
  const normalized = texto.replace(/\r\n/g, "\n").trim();
  const headerMatch = /(?:^|\n)\s*GARANT[ÍI]A\s*(?:\n+|:\s*)/i.exec(normalized);
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapOfertaSimplificada(o: any): OfertaSimplificada {
  return {
    id: o.numero_oferta || o.id || o._id || null,
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
  };
}

export function mapOfertaDetalle(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  o: any,
  garantiaTexto: string | null,
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
    garantias: garantiaTexto ? [garantiaTexto] : [],
    elementos: materiales.map((item) => ({
      categoria: item.categoria || null,
      foto: normalizarUrlImagen(item.foto),
      descripcion: item.descripcion || null,
      cantidad: item.cantidad || null,
    })),
    is_active:
      o.tipo_oferta === "generica" && o.estado === "aprobada_para_enviar",
  };
}
