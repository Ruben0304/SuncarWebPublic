import { getBackendUrl } from "@/lib/backend-url";
import type { Oferta, OfertaSimplificada } from "@/types/ofertas";
import {
  OFERTAS_PUBLICAS_QUERY,
  extraerSeccionGarantia,
  mapOfertaDetalle,
  mapOfertaSimplificada,
} from "./ofertas-publicas";

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
  const data = await pedirJson(
    `/api/ofertas/confeccion/?${OFERTAS_PUBLICAS_QUERY}`,
  );
  if (!data?.success || !Array.isArray(data.data)) return null;
  return data.data.map(mapOfertaSimplificada);
}

export async function obtenerOfertaPublica(
  ofertaId: string,
): Promise<Oferta | null> {
  const [ofertaData, terminosData] = await Promise.all([
    pedirJson(`/api/ofertas/confeccion/${encodeURIComponent(ofertaId)}`),
    pedirJson("/api/terminos-condiciones/activo"),
  ]);
  if (!ofertaData?.success || !ofertaData.data) return null;

  const garantiaTexto =
    terminosData?.success && terminosData.data?.texto
      ? extraerSeccionGarantia(terminosData.data.texto)
      : null;
  return mapOfertaDetalle(ofertaData.data, garantiaTexto);
}
