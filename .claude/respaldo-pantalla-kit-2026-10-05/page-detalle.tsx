import OfertaDetalle from "./oferta-detalle";
import {
  obtenerOfertaPublica,
  obtenerOfertasPublicas,
} from "@/lib/ofertas/ofertas-publicas-server";

interface OfertaDetailPageProps {
  params: Promise<{ id: string }>;
}

// La oferta se pide en el servidor para que el HTML ya la traiga: con
// conexiones lentas se ve sin esperar a que baje y arranque todo el JS.
export default async function OfertaDetailPage({
  params,
}: OfertaDetailPageProps) {
  const { id } = await params;
  // Los demás kits (con la misma caché de un minuto) permiten mostrar las
  // otras configuraciones que ya tenemos armadas.
  const [initialOferta, ofertasPublicas] = await Promise.all([
    obtenerOfertaPublica(id),
    obtenerOfertasPublicas(),
  ]);

  return (
    <OfertaDetalle
      ofertaId={id}
      initialOferta={initialOferta}
      ofertasPublicas={ofertasPublicas}
    />
  );
}
