import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verificar que NEXT_PUBLIC_BACKEND_URL esté definida
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      console.error('NEXT_PUBLIC_BACKEND_URL no está definida en variables de entorno');
      return NextResponse.json({
        success: false,
        message: 'Error de configuración del servidor'
      }, { status: 500 });
    }

    // Obtener el cuerpo de la petición
    const body = await request.json();

    // Llamar al endpoint del backend
    const targetUrl = `${backendUrl}/api/ofertas/recomendador`;
    console.log(`=== DEBUG RECOMENDADOR BACKEND CALL ===`);
    console.log(`NEXT_PUBLIC_BACKEND_URL env var: ${backendUrl}`);
    console.log(`Target URL: ${targetUrl}`);
    console.log(`Request body:`, body);
    console.log(`=== END DEBUG ===`);

    const backendResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer suncar-token-2025',
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Error del backend: ${backendResponse.status} - ${errorText}`);

      return NextResponse.json({
        success: false,
        message: 'Error al obtener recomendaciones'
      }, { status: backendResponse.status });
    }

    const backendData = await backendResponse.json();

    console.log('Respuesta del backend (recomendador):', backendData);

    // Filtrar ofertas activas en las recomendaciones
    if (backendData.success && backendData.data && backendData.data.ofertas && Array.isArray(backendData.data.ofertas)) {
      backendData.data.ofertas = backendData.data.ofertas.filter((oferta: any) => {
        // Solo mostrar ofertas que tienen is_active: true
        // Si is_active no está definido, asumir que está activa (comportamiento por defecto)
        return oferta.is_active !== false;
      });
    }

    return NextResponse.json(backendData);

  } catch (error) {
    console.error('Error en recomendador de ofertas:', error);

    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}