import ProductosContent from "./productos-content";
import { obtenerOfertasPublicas } from "@/lib/ofertas/ofertas-publicas-server";

// Tienda y kits en una sola página. Los kits llegan en el HTML (como en
// /ofertas) y la casa es SVG en línea: la página se ve completa aunque la
// conexión sea lenta, y los productos sueltos se cargan después.
export default async function ProductosPage() {
  const initialKits = await obtenerOfertasPublicas();
  return <ProductosContent initialKits={initialKits} />;
}
