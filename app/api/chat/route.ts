import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, model = 'gemini-2.5-flash', streaming = false } = await request.json();
    
    // Validar datos requeridos
    if (!message) {
      return NextResponse.json(
        { success: false, message: 'El mensaje es requerido' },
        { status: 400 }
      );
    }

    // Obtener URL del backend desde variables de entorno
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    if (!backendUrl) {
      console.error('NEXT_PUBLIC_BACKEND_URL no está definida en variables de entorno');
      return NextResponse.json(
        { success: false, message: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    // Enviar al backend real
    const targetUrl = `${backendUrl}/api/chat/`;
    console.log(`=== DEBUG CHATBOT BACKEND CALL ===`);
    console.log(`NEXT_PUBLIC_BACKEND_URL env var: ${backendUrl}`);
    console.log(`Target URL: ${targetUrl}`);
    console.log('Datos a enviar:', { 
      message,
      model,
      streaming
    });
    console.log(`=== END DEBUG ===`);
    
    const backendResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': 'Bearer suncar-token-2025',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        model,
        streaming
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
      message: 'Respuesta generada exitosamente',
      response: backendResult.response,
      model_used: backendResult.model_used || model
    });

  } catch (error) {
    console.error('Error completo procesando chatbot:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    
    // Mensaje de error más específico
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      { 
        success: false, 
        message: `Error al procesar la consulta del chatbot: ${errorMessage}`,
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Endpoint de chatbot - solo acepta POST' },
    { status: 405 }
  );
}