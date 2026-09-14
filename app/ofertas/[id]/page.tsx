import OfertaDetalle from "./oferta-detalle";
import { obtenerOfertaPublica } from "@/lib/ofertas/ofertas-publicas-server";

interface OfertaDetailPageProps {
  params: Promise<{ id: string }>;
}

// La oferta se pide en el servidor para que el HTML ya la traiga: con
// conexiones lentas se ve sin esperar a que baje y arranque todo el JS.
export default async function OfertaDetailPage({
  params,
}: OfertaDetailPageProps) {
  const { id } = await params;
  const initialOferta = await obtenerOfertaPublica(id);

  return <OfertaDetalle ofertaId={id} initialOferta={initialOferta} />;
}
