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
    const backendResponse = await fetch(`${backendUrl}/cotizacion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mensaje: textoFormateado
      }),
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const backendResult = await backendResponse.json();
    
    return NextResponse.json({
      success: true,
      message: 'Cotización enviada exitosamente',
      id: backendResult.id || Date.now().toString()
    });

  } catch (error) {
    console.error('Error procesando cotización:', error);
    
    // En caso de error del backend, aún podemos indicar que se recibió la solicitud
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al procesar la cotización. Por favor, intenta nuevamente o contacta directamente.' 
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