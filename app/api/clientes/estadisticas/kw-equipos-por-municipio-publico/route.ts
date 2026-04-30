import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      return NextResponse.json(
        {
          message: "NEXT_PUBLIC_BACKEND_URL no esta configurada",
        },
        { status: 500, headers: NO_STORE_HEADERS },
      );
    }

    const incomingUrl = new URL(request.url);
    const targetUrl = new URL(
      `${backendUrl.replace(/\/+$/, "")}/api/clientes/estadisticas/kw-equipos-por-municipio-publico`,
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
          message: "No se pudo obtener el consolidado publico por municipio",
          status: backendResponse.status,
          details: errorBody || backendResponse.statusText,
        },
        {
          status: backendResponse.status,
          headers: NO_STORE_HEADERS,
        },
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data, {
      status: 200,
      headers: NO_STORE_HEADERS,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "Error inesperado al consultar estadisticas publicas por municipio",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      {
        status: 500,
        headers: NO_STORE_HEADERS,
      },
    );
  }
}
