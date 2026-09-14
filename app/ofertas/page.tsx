import OfertasContent from "./ofertas-content";
import { obtenerOfertasPublicas } from "@/lib/ofertas/ofertas-publicas-server";

interface OfertasPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Los kits se piden en el servidor para que el HTML ya los traiga: con
// conexiones lentas se ven sin esperar a que baje y arranque todo el JS.
export default async function OfertasPage({ searchParams }: OfertasPageProps) {
  const [params, initialOfertas] = await Promise.all([
    searchParams,
    obtenerOfertasPublicas(),
  ]);
  const marca = Array.isArray(params.marca) ? params.marca[0] : params.marca;

  return (
    <OfertasContent initialOfertas={initialOfertas} marcaParam={marca ?? null} />
  );
}
