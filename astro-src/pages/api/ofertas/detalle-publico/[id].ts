import type { APIRoute } from "astro";
import { obtenerOfertaPublica } from "@/lib/ofertas/ofertas-publicas-server";
import { fallo, json, seguro } from "../../../../server/proxy";

// El detalle de un kit publicado (elementos y garantías) para el configurador
// "Comprar un kit". Equivale a app/api/ofertas/detalle-publico/[id] (Next): pasa
// por aquí para no llamar al backend desde el navegador, y reutiliza lo que ya
// arma la ficha del kit (fotos del catálogo, garantía, caché de 1 min).

// Número de oferta (OF-20261027-003) o id de Mongo (24 hex).
const ID_VALIDO = /^[A-Za-z0-9_-]{1,64}$/;

export const GET: APIRoute = ({ params, request }) =>
  seguro("ofertas/detalle-publico", async () => {
    const id = params.id ?? "";
    if (!ID_VALIDO.test(id)) return fallo("Identificador de oferta inválido", 400);

    const oferta = await obtenerOfertaPublica(id);
    if (!oferta) return fallo("Oferta no encontrada", 404);
    return json({ success: true, data: oferta });
  })({ request });
