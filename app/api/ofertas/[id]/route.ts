import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'El ID de la oferta es requerido'
      }, { status: 400 });
    }

    // Verificar que NEXT_PUBLIC_BACKEND_URL esté definida
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      console.error('NEXT_PUBLIC_BACKEND_URL no está definida en variables de entorno');
      return NextResponse.json({
        success: false,
        message: 'Error de configuración del servidor'
      }, { status: 500 });
    }

    // Llamar al endpoint del backend
    const targetUrl = `${backendUrl}/api/ofertas/${id}`;
    console.log(`=== DEBUG BACKEND CALL ===`);
    console.log(`NEXT_PUBLIC_BACKEND_URL env var: ${backendUrl}`);
    console.log(`Target URL: ${targetUrl}`);
    console.log(`Obteniendo oferta con ID: ${id}`);
    console.log(`=== END DEBUG ===`);

    const backendResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer suncar-token-2025',
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Error del backend: ${backendResponse.status} - ${errorText}`);

      return NextResponse.json({
        success: false,
        message: 'Oferta no encontrada o error en el servidor'
      }, { status: backendResponse.status });
    }

    const backendData = await backendResponse.json();

    console.log('Respuesta del backend:', backendData);

    // Verificar si la oferta está activa
    if (backendData.success && backendData.data) {
      const oferta = backendData.data;
      // Si is_active está definido y es false, devolver error 404
      if (oferta.is_active === false) {
        return NextResponse.json({
          success: false,
          message: 'Oferta no disponible'
        }, { status: 404 });
      }
    }

    return NextResponse.json(backendData);

  } catch (error) {
    console.error('Error en obtener oferta por ID:', error);

    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}