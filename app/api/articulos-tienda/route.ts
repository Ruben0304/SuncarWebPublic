import { NextResponse } from 'next/server';

export async function GET() {
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

    // Llamar al endpoint del backend
    const targetUrl = `${backendUrl}/api/articulos-tienda`;
    console.log(`=== DEBUG BACKEND CALL ===`);
    console.log(`NEXT_PUBLIC_BACKEND_URL env var: ${backendUrl}`);
    console.log(`Target URL: ${targetUrl}`);
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
        message: 'Error al obtener artículos de tienda'
      }, { status: backendResponse.status });
    }

    const backendData = await backendResponse.json();

    console.log('Respuesta del backend:', backendData);

    return NextResponse.json(backendData);

  } catch (error) {
    console.error('Error en obtener artículos de tienda:', error);

    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}
