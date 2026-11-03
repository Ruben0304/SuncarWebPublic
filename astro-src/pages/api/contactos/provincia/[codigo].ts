import type { APIRoute } from "astro";
import { errorDelBackend, fallo, json, pedirBackend, seguro } from "../../../../server/proxy";

// Contacto de una provincia. El backend ya cae al contacto nacional si esa
// provincia todavía no tiene el suyo, así que aquí no hay que decidir nada.
// Equivale a app/api/contactos/provincia/[codigo] (Next). useContacto(codigo)
// ya sabe pedirlo; hoy la tienda usa el nacional a propósito.

const CODIGO_VALIDO = /^[A-Za-z0-9_-]{1,10}$/;

export const GET: APIRoute = ({ params, request }) =>
  seguro("contactos/provincia", async () => {
    const codigo = params.codigo ?? "";
    if (!CODIGO_VALIDO.test(codigo)) return fallo("Código de provincia inválido", 400);

    const respuesta = await pedirBackend(`/api/contactos/provincia/${encodeURIComponent(codigo)}`, {
      headers: { "Content-Type": "application/json", Authorization: "Bearer suncar-token-2025" },
    });
    if (!respuesta.ok) return errorDelBackend(respuesta, "Error al obtener contacto de la provincia");
    return json(respuesta.datos ?? { success: false, message: "Respuesta vacía del backend" });
  })({ request });
