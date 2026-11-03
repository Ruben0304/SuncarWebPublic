import type { APIRoute } from "astro";
import { errorDelBackend, json, pedirBackend, seguro } from "../../server/proxy";

// Equivalente a app/api/contactos/route.ts (Next): mismo proxy, mismo contrato.
// hooks/useContacto.ts (compartido) le pega a "/api/contactos" sin saber si el
// servidor es Next o Astro.
export const GET: APIRoute = ({ request }) =>
  seguro("contactos", async () => {
    const respuesta = await pedirBackend("/api/contactos/first", {
      headers: { "Content-Type": "application/json", Authorization: "Bearer suncar-token-2025" },
    });
    if (!respuesta.ok) return errorDelBackend(respuesta, "Error al obtener contacto del servidor");
    return json(respuesta.datos ?? { success: false, message: "Respuesta vacía del backend" });
  })({ request });
