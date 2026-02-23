import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: "Error de configuracion del servidor" },
        { status: 500 },
      );
    }

    const incoming = request.nextUrl.searchParams;
    const params = new URLSearchParams(incoming.toString());

    if (!params.has("vendible")) {
      params.set("vendible", "true");
    }

    const query = params.toString();
    const targetUrl = `${backendUrl.replace(/\/+$/, "")}/api/productos/catalogo-web${query ? `?${query}` : ""}`;

    const backendResponse = await fetch(targetUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return NextResponse.json(
        {
          success: false,
          message: "Error al obtener catalogo web de productos",
          detail: errorText,
        },
        { status: backendResponse.status },
      );
    }

    const backendData = await backendResponse.json();
    return NextResponse.json(backendData);
  } catch (error) {
    console.error("Error en proxy /api/productos/catalogo-web:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
