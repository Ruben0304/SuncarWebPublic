import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend-url';

export async function GET() {
  try {
    // `getBackendUrl()` tiene fallback al backend de produccion: antes esto
    // devolvia 500 cuando faltaba NEXT_PUBLIC_BACKEND_URL, y entonces toda la
    // web caia al contacto de respaldo sin que nadie se enterara.
    const backendUrl = getBackendUrl();

    // Llamar al endpoint del backend para obtener el primer contacto
    const targetUrl = `${backendUrl}/api/contactos/first`;

    const backendResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer suncar-token-2025',
      },
      cache: "no-store",
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Error del backend: ${backendResponse.status} - ${errorText}`);
      
      return NextResponse.json({
        success: false,
        message: 'Error al obtener contacto del servidor'
      }, { status: backendResponse.status });
    }

    const backendData = await backendResponse.json();

    // Retornar la respuesta del backend
    return NextResponse.json(backendData);

  } catch (error) {
    console.error('Error al obtener contacto:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}