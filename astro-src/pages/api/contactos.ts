import { getBackendUrl } from "@/lib/backend-url";

// Equivalente a app/api/contactos/route.ts (Next): mismo proxy, mismo
// contrato de respuesta. hooks/useContacto.ts (compartido, sin cambios) le
// pega a "/api/contactos" sin saber si el servidor es Next o Astro.
export async function GET() {
  try {
    const backendUrl = getBackendUrl();
    const targetUrl = `${backendUrl}/api/contactos/first`;

    const backendResponse = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer suncar-token-2025",
      },
      cache: "no-store",
    });

    if (!backendResponse.ok) {
      return new Response(
        JSON.stringify({ success: false, message: "Error al obtener contacto del servidor" }),
        { status: backendResponse.status, headers: { "Content-Type": "application/json" } },
      );
    }

    const backendData = await backendResponse.json();
    return new Response(JSON.stringify(backendData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener contacto:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
