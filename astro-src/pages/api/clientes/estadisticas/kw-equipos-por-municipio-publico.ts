import type { APIRoute } from "astro";
import { errorDelBackend, json, pedirBackend, seguro } from "../../../../server/proxy";

// Equivalente de app/api/clientes/estadisticas/kw-equipos-por-municipio-publico
// (Next): el backend solo acepta CORS del dominio real, así que el navegador
// pide por esta ruta propia y el servidor habla con el backend. Alimenta el
// mapa de apagones de la home.
const FILTRO_VALIDO = /^[\p{L}\p{N} .,'()-]{1,80}$/u;

export const GET: APIRoute = ({ request }) =>
  seguro("clientes/estadisticas", async () => {
    const entrante = new URL(request.url);
    const consulta = new URLSearchParams();
    for (const clave of ["provincia", "municipio"]) {
      const valor = entrante.searchParams.get(clave);
      if (valor && FILTRO_VALIDO.test(valor)) consulta.set(clave, valor);
    }
    const sufijo = consulta.size ? `?${consulta}` : "";

    const respuesta = await pedirBackend(`/api/clientes/estadisticas/kw-equipos-por-municipio-publico${sufijo}`);
    if (!respuesta.ok) return errorDelBackend(respuesta, "No se pudo obtener el consolidado público por municipio");
    return json(respuesta.datos ?? { success: false, message: "Respuesta vacía del backend" });
  })({ request });
