import { getBackendUrl } from "@/lib/backend-url";

// Piezas comunes de las rutas /api que hacen de proxy al backend. Cada ruta
// queda en pocas líneas y todas comparten: timeout (un backend colgado no
// cuelga al visitante), respuestas siempre en JSON y sin caché, y mensajes de
// error genéricos (el detalle va al log del servidor, no al navegador).

const CABECERAS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

export const json = (datos: unknown, status = 200) =>
  new Response(JSON.stringify(datos), { status, headers: CABECERAS });

export const fallo = (message: string, status = 500) => json({ success: false, message }, status);

export interface RespuestaBackend {
  ok: boolean;
  status: number;
  datos: unknown;
}

/** GET/POST al backend con timeout que cubre también la lectura del cuerpo. */
export async function pedirBackend(
  ruta: string,
  init: RequestInit = {},
  timeoutMs = 10_000,
): Promise<RespuestaBackend> {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), timeoutMs);
  try {
    const respuesta = await fetch(`${getBackendUrl()}${ruta}`, {
      ...init,
      headers: { accept: "application/json", ...init.headers },
      signal: controlador.signal,
      cache: "no-store",
    });
    const texto = await respuesta.text();
    let datos: unknown;
    try {
      datos = texto ? JSON.parse(texto) : undefined;
    } catch {
      datos = undefined;
    }
    return { ok: respuesta.ok, status: respuesta.status, datos };
  } finally {
    clearTimeout(temporizador);
  }
}

/** Envuelve un handler: cualquier excepción termina en 504/502, nunca en un stack. */
export function seguro(nombre: string, handler: (request: Request) => Promise<Response>) {
  return async ({ request }: { request: Request }): Promise<Response> => {
    try {
      return await handler(request);
    } catch (error) {
      const agotado = error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
      console.error(`[api/${nombre}]`, agotado ? "timeout hablando con el backend" : error);
      return agotado
        ? fallo("El servidor tardó demasiado en responder", 504)
        : fallo("Error al comunicarse con el servidor", 502);
    }
  };
}

/** Lo que devuelve el backend si respondió con error: estado propio, mensaje genérico. */
export function errorDelBackend(respuesta: RespuestaBackend, mensaje: string) {
  const status = respuesta.status >= 400 && respuesta.status < 600 ? respuesta.status : 502;
  return fallo(mensaje, status);
}
