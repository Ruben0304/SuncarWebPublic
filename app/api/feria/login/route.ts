import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

/**
 * Login del comercial en el stand de feria.
 *
 * Reenvía al mismo endpoint que usa el admin, `POST /api/auth/login-admin`, con
 * el usuario real de cada comercial (no uno compartido: el lead tiene que salir
 * firmado por quien lo atendió).
 *
 * Va por una ruta propia y no directo al backend para no depender de la
 * configuración de CORS: `ALLOWED_ORIGINS` se habilitó para `www` el 20/08/2026
 * y si alguien la revierte, el stand se queda sin poder entrar. Same-origin no
 * tiene ese problema.
 *
 * Ojo con la forma de la respuesta: el backend devuelve **200 con
 * `success: false`** cuando las credenciales están mal, no un 401.
 */

export async function POST(request: Request) {
  try {
    const cuerpo = await request.json();
    const ci = typeof cuerpo?.ci === "string" ? cuerpo.ci.trim() : "";
    const adminPass = typeof cuerpo?.adminPass === "string" ? cuerpo.adminPass : "";

    if (!ci || !adminPass) {
      return NextResponse.json(
        { success: false, message: "Falta el carné o la contraseña" },
        { status: 400 },
      );
    }

    const respuesta = await fetch(`${getBackendUrl()}/api/auth/login-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ci, adminPass }),
      cache: "no-store",
    });

    if (!respuesta.ok) {
      // Nunca se registra el cuerpo: lleva la contraseña del trabajador.
      console.error(`Error del backend en el login de feria: ${respuesta.status}`);
      return NextResponse.json(
        { success: false, message: "El servidor no respondió al login" },
        { status: respuesta.status },
      );
    }

    const datos = await respuesta.json();

    return NextResponse.json({
      success: Boolean(datos?.success && datos?.token),
      message: datos?.message || "",
      token: datos?.token ?? null,
    });
  } catch (error) {
    console.error("Error en el login de feria:", error);
    return NextResponse.json(
      { success: false, message: "No se pudo contactar al servidor" },
      { status: 500 },
    );
  }
}
