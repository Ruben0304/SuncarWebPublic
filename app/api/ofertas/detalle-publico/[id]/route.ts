import { NextResponse } from "next/server";
import { obtenerOfertaPublica } from "@/lib/ofertas/ofertas-publicas-server";

// El detalle de un kit publicado (elementos y garantías) para el configurador
// "Comprar un kit", que solo conoce la lista de kits. Pasa por aquí para no
// llamar al backend desde el navegador, y reutiliza lo que ya arma la página
// de detalle: fotos del catálogo, garantía de los términos y la caché de 1 min.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const oferta = await obtenerOfertaPublica(id);
  if (!oferta) {
    return NextResponse.json(
      { success: false, message: "Oferta no encontrada" },
      { status: 404 },
    );
  }
  return NextResponse.json({ success: true, data: oferta });
}
