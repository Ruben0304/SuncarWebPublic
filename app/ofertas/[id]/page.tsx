import { redirect } from "next/navigation";

// La pantalla de detalle del kit ya no existe: todo ocurre en "Comprar un kit".
// Los enlaces que quedan por ahí (carrito, tienda, mensajes compartidos) llevan
// al configurador con ese kit ya elegido.
export default async function OfertaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/ofertas?kit=${encodeURIComponent(id)}`);
}
