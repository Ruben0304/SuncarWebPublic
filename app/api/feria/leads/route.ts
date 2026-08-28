import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

/**
 * Alta de leads del stand de feria.
 *
 * Reenvía a `POST /api/leads/` con el Bearer del comercial. El token viaja tal
 * cual desde el cliente: el backend es quien lo valida y quien decide si ese
 * trabajador puede crear leads.
 *
 * Interesa distinguir tres respuestas, porque el cliente actúa distinto con
 * cada una: 401/403 (hay que volver a entrar), 422 (el lead está mal armado y
 * reintentar no lo va a arreglar) y el resto (se reintenta).
 */

export async function POST(request: Request) {
  try {
    const autorizacion = request.headers.get("authorization");

    if (!autorizacion) {
      return NextResponse.json(
        { success: false, message: "Falta la sesión del comercial" },
        { status: 401 },
      );
    }

    const cuerpo = await request.json();

    const respuesta = await fetch(`${getBackendUrl()}/api/leads/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: autorizacion,
      },
      body: JSON.stringify(cuerpo),
      cache: "no-store",
    });

    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
      // El 422 de FastAPI trae el detalle de validación en `detail`, que es lo
      // único que explica por qué un lead no entra (un teléfono con letras, un
      // comentario de más de 2000 caracteres).
      const detalle =
        typeof datos?.detail === "string"
          ? datos.detail
          : Array.isArray(datos?.detail)
            ? datos.detail
                .map((d: any) => `${d?.loc?.slice(-1)?.[0] ?? ""}: ${d?.msg ?? ""}`)
                .join(" · ")
            : datos?.message;

      return NextResponse.json(
        {
          success: false,
          message: detalle || `El servidor rechazó el lead (${respuesta.status})`,
        },
        { status: respuesta.status },
      );
    }

    return NextResponse.json({
      success: datos?.success !== false,
      message: datos?.message || "Lead creado",
    });
  } catch (error) {
    console.error("Error al crear el lead de feria:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
