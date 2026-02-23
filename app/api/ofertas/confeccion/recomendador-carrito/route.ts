import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: 'Error de configuracion del servidor' },
        { status: 500 },
      );
    }

    const body = await request.json();
    const targetUrl = `${backendUrl.replace(/\/+$/, '')}/api/ofertas/confeccion/recomendador-carrito`;

    const backendResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const raw = await backendResponse.text();
    let payload: any = {};
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      payload = {
        success: backendResponse.ok,
        message: raw || 'Respuesta del backend sin formato JSON',
      };
    }

    if (!backendResponse.ok) {
      return NextResponse.json(
        payload || {
          success: false,
          message: 'Error al obtener recomendaciones del carrito',
        },
        { status: backendResponse.status },
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error en proxy recomendador-carrito:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}
