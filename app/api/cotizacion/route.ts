import { NextRequest, NextResponse } from 'next/server';
import { CotizacionData } from '@/services/domain/interfaces/cotizacionInterfaces';
import { CotizacionFormatter } from '@/services/application/useCases/cotizacionUseCase';

export async function POST(request: NextRequest) {
  try {
    const cotizacionData: CotizacionData = await request.json();
    
    // Validar datos requeridos
    if (!cotizacionData.nombre || !cotizacionData.email || !cotizacionData.telefono) {
      return NextResponse.json(
        { success: false, message: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Formatear los datos como texto elegante
    const textoFormateado = CotizacionFormatter.formatCotizacionText(cotizacionData);
    
    // Obtener URL del backend desde variables de entorno
    const backendUrl = process.env.BACKEND_URL;
    
    if (!backendUrl) {
      console.error('BACKEND_URL no está definida en variables de entorno');
      return NextResponse.json(
        { success: false, message: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    // Enviar al backend real
    const targetUrl = `${backendUrl}/api/cotizacion`;
    console.log(`=== DEBUG BACKEND CALL ===`);
    console.log(`BACKEND_URL env var: ${backendUrl}`);
    console.log(`Target URL: ${targetUrl}`);
    console.log('Datos a enviar:', { 
      mensaje: textoFormateado,
      latitud: cotizacionData.latitude,
      longitud: cotizacionData.longitude
    });
    console.log(`=== END DEBUG ===`);
    
    const backendResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer suncar-token-2025',
      },
      body: JSON.stringify({
        mensaje: textoFormateado,
        latitud: cotizacionData.latitude,
        longitud: cotizacionData.longitude
      }),
    });

    console.log(`Backend response status: ${backendResponse.status}`);
    console.log(`Backend response statusText: ${backendResponse.statusText}`);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend error response:', errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Error del backend: ${backendResponse.status} - ${errorText || backendResponse.statusText}`,
          details: {
            status: backendResponse.status,
            statusText: backendResponse.statusText,
            body: errorText
          }
        },
        { status: 500 }
      );
    }

    const backendResult = await backendResponse.json();
    console.log('Backend success response:', backendResult);
    
    return NextResponse.json({
      success: true,
      message: 'Cotización enviada exitosamente',
      data: backendResult
    });

  } catch (error) {
    console.error('Error completo procesando cotización:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    
    // Mensaje de error más específico
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      { 
        success: false, 
        message: `Error al procesar la cotización: ${errorMessage}`,
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Endpoint de cotización - solo acepta POST' },
    { status: 405 }
  );
}