import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

/**
 * Catálogo de equipos para el stand de feria.
 *
 * Es el mismo `/api/calculo-energetico/` que alimenta la calculadora pública,
 * pero servido por una ruta propia de `/feria` por dos razones:
 *
 * 1. La ruta de la calculadora exige `NEXT_PUBLIC_BACKEND_URL` y devuelve 500
 *    si falta; acá se usa `getBackendUrl()`, que tiene fallback al backend de
 *    producción. El stand no puede depender de una variable de entorno.
 * 2. `/feria` precachea sus endpoints en el service worker (Bloque 4). Tener
 *    los suyos propios evita que un cambio en la calculadora —que está en
 *    producción y no se toca— rompa el modo avión en la playa.
 */

interface EquipoBackend {
  nombre?: string;
  potencia_kw?: number;
  energia_kwh?: number;
  horas_uso_dia?: number | null;
  tipo_carga?: string;
  factor_arranque?: number | null;
}

interface CategoriaBackend {
  id?: string;
  nombre?: string;
  equipos?: EquipoBackend[];
}

export async function GET() {
  try {
    const respuesta = await fetch(`${getBackendUrl()}/api/calculo-energetico/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!respuesta.ok) {
      console.error(
        `Error del backend al pedir el catálogo de equipos: ${respuesta.status}`,
      );
      return NextResponse.json(
        { success: false, message: "No se pudo obtener el catálogo de equipos" },
        { status: respuesta.status },
      );
    }

    const datos = await respuesta.json();
    const categorias: CategoriaBackend[] = Array.isArray(datos?.data)
      ? datos.data
      : [];

    const limpio = categorias
      .filter((categoria) => Array.isArray(categoria.equipos))
      .map((categoria) => ({
        nombre: categoria.nombre,
        equipos: (categoria.equipos || []).map((equipo) => ({
          nombre: equipo.nombre,
          potencia_kw: equipo.potencia_kw ?? 0,
          energia_kwh: equipo.energia_kwh ?? 0,
          horas_uso_dia: equipo.horas_uso_dia ?? null,
          tipo_carga: equipo.tipo_carga ?? null,
          factor_arranque: equipo.factor_arranque ?? null,
        })),
      }));

    return NextResponse.json({
      success: true,
      message: "Equipos obtenidos",
      data: limpio,
    });
  } catch (error) {
    console.error("Error al obtener el catálogo de equipos:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
