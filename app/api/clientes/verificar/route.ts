import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return NextResponse.json({
        success: false,
        message: 'El identificador es requerido'
      }, { status: 400 });
    }

    // Verificar que BACKEND_URL esté definida
    const backendUrl = process.env.BACKEND_URL;
    
    if (!backendUrl) {
      console.error('BACKEND_URL no está definida en variables de entorno');
      return NextResponse.json({
        success: false,
        message: 'Error de configuración del servidor'
      }, { status: 500 });
    }

    // Llamar al endpoint del backend
    const targetUrl = `${backendUrl}/api/clientes/verificar`;
    console.log(`=== DEBUG BACKEND CALL ===`);
    console.log(`BACKEND_URL env var: ${backendUrl}`);
    console.log(`Target URL: ${targetUrl}`);
    console.log(`Verificando cliente con identificador: ${identifier}`);
    console.log(`=== END DEBUG ===`);

    const backendResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer suncar-token-2025',
      },
      body: JSON.stringify({ identifier }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Error del backend: ${backendResponse.status} - ${errorText}`);
      
      return NextResponse.json({
        success: false,
        message: 'Cliente no encontrado o error en el servidor'
      }, { status: backendResponse.status });
    }

    const backendData = await backendResponse.json();
    
    console.log('Respuesta del backend:', backendData);

    // Transformar la respuesta para que coincida con nuestro modelo de frontend
    if (backendData.success && backendData.data) {
      const transformedData = {
        success: backendData.success,
        message: backendData.message,
        data: {
          numero: backendData.data.numero || backendData.data._id,
          nombre: backendData.data.nombre,
          telefono: backendData.data.telefono,
          email: backendData.data.email
        }
      };
      return NextResponse.json(transformedData);
    }

    return NextResponse.json(backendData);

  } catch (error) {
    console.error('Error en verificación de cliente:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}