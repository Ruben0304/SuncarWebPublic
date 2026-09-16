import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend-url';

/**
 * Contacto de una provincia. El backend ya cae al contacto nacional si esa
 * provincia todavía no tiene el suyo, así que aquí no hay que decidir nada:
 * mientras SunCar no publique los números de cada provincia, todas devuelven
 * el de La Habana y la tienda sigue funcionando igual que hoy.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ codigo: string }> },
) {
  try {
    const { codigo } = await params;
    const backendUrl = getBackendUrl();
    const targetUrl = `${backendUrl}/api/contactos/provincia/${encodeURIComponent(codigo)}`;

    const backendResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer suncar-token-2025',
      },
      cache: 'no-store',
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Error del backend: ${backendResponse.status} - ${errorText}`);
      return NextResponse.json(
        { success: false, message: 'Error al obtener contacto de la provincia' },
        { status: backendResponse.status },
      );
    }

    return NextResponse.json(await backendResponse.json());
  } catch (error) {
    console.error('Error al obtener contacto por provincia:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}
