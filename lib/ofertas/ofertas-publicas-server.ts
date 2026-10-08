import { getBackendUrl } from "@/lib/backend-url";
import type { Oferta, OfertaSimplificada } from "@/types/ofertas";
import {
  CATEGORIAS_POTENCIA,
  OFERTAS_PUBLICAS_QUERY,
  RUTA_TERMINOS_PUBLICOS,
  garantiaDeTerminos,
  idDeDetalle,
  mapOfertaDetalle,
  mapOfertasPublicas,
  potenciasDeCatalogo,
  rutaCatalogoLite,
} from "./ofertas-publicas";
import {
  CATEGORIAS_INSTALACION,
  normalizarCategoria,
  type MaterialCatalogo,
} from "./instalacion";

// Solo para server components. Los kits cambian pocas veces al día: con un
// minuto de caché todas las visitas comparten una llamada al backend y el HTML
// sale ya con los kits, sin que el móvil tenga que abrir otra conexión a la API.
const REVALIDAR_SEGUNDOS = 60;

// Si el backend tarda, la página no lo espera: se envía sin datos y el
// navegador los pide como antes.
const LIMITE_MS = 5000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function pedirJson(ruta: string): Promise<any | null> {
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  const peticion = fetch(`${getBackendUrl()}${ruta}`, {
    headers: { accept: "application/json" },
    next: { revalidate: REVALIDAR_SEGUNDOS },
  })
    .then((respuesta) => (respuesta.ok ? respuesta.json() : null))
    .catch(() => null);
  const limite = new Promise<null>((resolve) => {
    temporizador = setTimeout(() => resolve(null), LIMITE_MS);
  });

  try {
    return await Promise.race([peticion, limite]);
  } finally {
    clearTimeout(temporizador);
  }
}

export async function obtenerOfertasPublicas(): Promise<
  OfertaSimplificada[] | null
> {
  const [data, respuestasCatalogo] = await Promise.all([
    pedirJson(`/api/ofertas/confeccion/?${OFERTAS_PUBLICAS_QUERY}`),
    // La potencia de cada equipo sale del catálogo; si no responde, se lee de
    // las descripciones.
    Promise.all(CATEGORIAS_POTENCIA.map((c) => pedirJson(rutaCatalogoLite(c)))),
  ]);
  if (!data?.success || !Array.isArray(data.data)) return null;
  return mapOfertasPublicas(data.data, potenciasDeCatalogo(respuestasCatalogo));
}

export async function obtenerOfertaPublica(
  ofertaId: string,
): Promise<Oferta | null> {
  const id = /^[0-9a-f]{24}$/i.test(ofertaId)
    ? ofertaId
    : idDeDetalle(
        ofertaId,
        (await pedirJson(`/api/ofertas/confeccion/?${OFERTAS_PUBLICAS_QUERY}`))?.data,
      );
  if (!id) return null;

  const [ofertaData, terminosData] = await Promise.all([
    pedirJson(`/api/ofertas/confeccion/${encodeURIComponent(id)}`),
    pedirJson(RUTA_TERMINOS_PUBLICOS),
  ]);
  if (!ofertaData?.success || !ofertaData.data) return null;

  const garantiaTexto = garantiaDeTerminos(terminosData);
  const catalogo = await fotosDelCatalogo(
    ofertaData.data.materiales || ofertaData.data.items || [],
  );
  return mapOfertaDetalle(ofertaData.data, garantiaTexto, catalogo);
}

/**
 * Nombre comercial y foto de los componentes del kit, para "Ver cómo
 * quedaría". Los items de la oferta no traen foto: se piden al catálogo solo
 * las categorías que se dibujan, con la misma caché de un minuto.
 */
async function fotosDelCatalogo(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[],
): Promise<Map<string, MaterialCatalogo>> {
  const categorias = Array.from(
    new Set<string>(
      items
        .map((i) => i.categoria as string | undefined)
        .filter(
          (c): c is string =>
            !!c && CATEGORIAS_INSTALACION.includes(normalizarCategoria(c)),
        ),
    ),
  );
  const respuestas = await Promise.all(
    categorias.map((c) =>
      pedirJson(`/api/productos/lite?categoria=${encodeURIComponent(c)}`),
    ),
  );

  const catalogo = new Map<string, MaterialCatalogo>();
  for (const respuesta of respuestas) {
    if (!respuesta?.success || !Array.isArray(respuesta.data)) continue;
    for (const grupo of respuesta.data) {
      for (const m of grupo.materiales ?? []) {
        if (m?.codigo) {
          catalogo.set(m.codigo, { nombre: m.nombre ?? null, foto: m.foto ?? null });
        }
      }
    }
  }
  return catalogo;
}
