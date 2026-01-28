import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { carpeta: string } }
) {
  try {
    const { carpeta } = params;

    // Verificar que BACKEND_URL esté definida
    // En API routes del servidor, usar BACKEND_URL sin NEXT_PUBLIC_
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      console.error('BACKEND_URL no está definida en variables de entorno');
      return NextResponse.json({
        success: false,
        message: 'Error de configuración del servidor'
      }, { status: 500 });
    }

    // Validar que la carpeta sea válida
    const carpetasValidas = ['instalaciones_exterior', 'instalaciones_interior', 'nosotros'];
    if (!carpetasValidas.includes(carpeta)) {
      return NextResponse.json({
        success: false,
        message: `Carpeta inválida. Debe ser una de: ${carpetasValidas.join(', ')}`
      }, { status: 400 });
    }

    // Llamar al endpoint del backend
    const targetUrl = `${backendUrl}/api/galeriaweb/${carpeta}`;
    console.log(`=== DEBUG GALERIAWEB CALL ===`);
    console.log(`BACKEND_URL env var: ${backendUrl}`);
    console.log(`Target URL: ${targetUrl}`);
    console.log(`Carpeta: ${carpeta}`);
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
        message: `Error al obtener fotos de la carpeta ${carpeta}`
      }, { status: backendResponse.status });
    }

    const backendData = await backendResponse.json();

    console.log(`Fotos obtenidas de ${carpeta}:`, backendData);

    return NextResponse.json(backendData);

  } catch (error) {
    console.error('Error en obtener fotos de galería:', error);

    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}
