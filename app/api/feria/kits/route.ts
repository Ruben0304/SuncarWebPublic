import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

/**
 * Catálogo de kits para el stand de feria, en versión mínima.
 *
 * El endpoint del backend (`/api/ofertas/confeccion/`) devuelve ~350 KB porque
 * arrastra el desglose de materiales de cada oferta. El stand corre en una
 * tablet, en la playa y sin red: lo que se precachea tiene que ser chico. Acá
 * se recortan los campos a los seis que consume `lib/feria/kits.ts` y la
 * respuesta baja a unos pocos KB.
 *
 * Los nombres de campo se conservan tal cual los manda el backend para que
 * `aKitFeria()` siga funcionando con la oferta cruda si algún día se prefiere
 * pegarle directo al backend.
 */

const CATALOGO =
  "/api/ofertas/confeccion/?tipo_oferta=generica&estado=aprobada_para_enviar";

interface ItemOferta {
  categoria?: string;
  cantidad?: number;
  precio?: number;
  margen_asignado?: number;
}

interface OfertaConfeccion {
  id?: string;
  _id?: string;
  nombre_automatico?: string;
  nombre_completo?: string;
  nombre_oferta?: string;
  precio_final?: number;
  moneda_pago?: string;
  foto_portada?: string;
  items?: ItemOferta[];
}

/** "BATERÍAS" y "baterias" son la misma categoría. */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

/**
 * Precio de venta de una unidad de batería y de panel dentro del kit.
 *
 * De dónde sale: cada renglón de materiales trae `precio` (costo unitario) y
 * `margen_asignado` (el margen de ese renglón completo), así que el precio de
 * venta del renglón es `precio × cantidad + margen`. La suma de todos los
 * renglones no da exactamente el `precio_final` de la oferta —queda un 6-7% por
 * debajo, que es lo que la oferta agrega por encima de los materiales—, así que
 * se reparte esa diferencia proporcionalmente. El resultado es "qué parte del
 * precio que el cliente paga corresponde a una batería".
 *
 * Es una **estimación** y así se muestra en pantalla: sirve para que el
 * comercial dé un orden de magnitud de la ampliación en el stand, no para
 * cotizar.
 */
function preciosUnitarios(oferta: OfertaConfeccion): {
  precio_bateria: number | null;
  precio_panel: number | null;
} {
  const items = Array.isArray(oferta.items) ? oferta.items : [];
  const precioFinal = Number(oferta.precio_final) || 0;

  let totalRenglones = 0;
  const porCategoria = new Map<string, { venta: number; cantidad: number }>();

  for (const item of items) {
    const cantidad = Number(item.cantidad) || 0;
    const venta = (Number(item.precio) || 0) * cantidad + (Number(item.margen_asignado) || 0);
    totalRenglones += venta;

    const categoria = normalizar(item.categoria || "");
    if (categoria !== "BATERIAS" && categoria !== "PANELES") continue;

    const acumulado = porCategoria.get(categoria) || { venta: 0, cantidad: 0 };
    porCategoria.set(categoria, {
      venta: acumulado.venta + venta,
      cantidad: acumulado.cantidad + cantidad,
    });
  }

  // Sin renglones o sin precio final no hay nada que repartir.
  const factor = totalRenglones > 0 && precioFinal > 0 ? precioFinal / totalRenglones : 0;

  const unidad = (categoria: string): number | null => {
    const linea = porCategoria.get(categoria);
    if (!factor || !linea || linea.cantidad <= 0) return null;
    return Math.round((linea.venta / linea.cantidad) * factor);
  };

  return { precio_bateria: unidad("BATERIAS"), precio_panel: unidad("PANELES") };
}

export async function GET() {
  try {
    const respuesta = await fetch(`${getBackendUrl()}${CATALOGO}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!respuesta.ok) {
      console.error(
        `Error del backend al pedir el catálogo de feria: ${respuesta.status}`,
      );
      return NextResponse.json(
        { success: false, message: "No se pudo obtener el catálogo de kits" },
        { status: respuesta.status },
      );
    }

    const datos = await respuesta.json();
    const ofertas: OfertaConfeccion[] = Array.isArray(datos?.data)
      ? datos.data
      : [];

    const kits = ofertas
      // Sin especificaciones no hay kit que dimensionar: el parser no tiene de dónde leer.
      .filter((oferta) => Boolean(oferta.nombre_automatico))
      .map((oferta) => ({
        id: oferta.id || oferta._id,
        nombre_automatico: oferta.nombre_automatico,
        nombre_completo: oferta.nombre_completo || oferta.nombre_oferta || null,
        precio_final: oferta.precio_final ?? 0,
        moneda_pago: oferta.moneda_pago || "USD",
        foto_portada: oferta.foto_portada || null,
        // Se calculan acá y no en el cliente: es la única forma de aprovechar
        // el desglose de materiales sin mandarle los 350 KB a la tablet.
        ...preciosUnitarios(oferta),
      }));

    return NextResponse.json({
      success: true,
      message: "Kits obtenidos",
      data: kits,
    });
  } catch (error) {
    console.error("Error al obtener los kits de feria:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
