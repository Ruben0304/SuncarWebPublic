import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "NEXT_PUBLIC_BACKEND_URL no está configurada",
        },
        { status: 500 },
      );
    }

    const incomingUrl = new URL(request.url);
    const targetUrl = new URL(
      `${backendUrl.replace(/\/+$/, "")}/api/clientes/estadisticas/kw-instalados-por-municipio`,
    );

    const provincia = incomingUrl.searchParams.get("provincia");
    const municipio = incomingUrl.searchParams.get("municipio");

    if (provincia) targetUrl.searchParams.set("provincia", provincia);
    if (municipio) targetUrl.searchParams.set("municipio", municipio);

    const backendResponse = await fetch(targetUrl.toString(), {
      method: "GET",
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (!backendResponse.ok) {
      const errorBody = await backendResponse.text();
      return NextResponse.json(
        {
          success: false,
          message: "No se pudo obtener el consolidado por municipio",
          status: backendResponse.status,
          details: errorBody || backendResponse.statusText,
        },
        { status: backendResponse.status },
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error inesperado al consultar estadísticas por municipio",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    );
  }
}
