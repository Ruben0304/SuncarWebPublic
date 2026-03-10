import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      return NextResponse.json(
        {
          message: "NEXT_PUBLIC_BACKEND_URL no esta configurada",
        },
        { status: 500 },
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
          headers: {
            "Cache-Control":
              "public, max-age=30, s-maxage=30, stale-while-revalidate=60",
          },
        },
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control":
          "public, max-age=60, s-maxage=300, stale-while-revalidate=900",
      },
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
        headers: {
          "Cache-Control":
            "public, max-age=15, s-maxage=15, stale-while-revalidate=30",
        },
      },
    );
  }
}
