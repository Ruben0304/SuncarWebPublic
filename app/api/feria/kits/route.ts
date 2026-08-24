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

interface OfertaConfeccion {
  id?: string;
  _id?: string;
  nombre_automatico?: string;
  nombre_completo?: string;
  nombre_oferta?: string;
  precio_final?: number;
  moneda_pago?: string;
  foto_portada?: string;
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
