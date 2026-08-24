import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

/**
 * Número de WhatsApp de la empresa, para el QR que se lleva el visitante.
 *
 * Sale de `/api/contactos`, que es público y ya alimenta el resto de la web.
 * Se sirve por ruta propia para poder precachearlo con el service worker: en la
 * playa el QR tiene que armarse sin red.
 *
 * El backend devuelve el teléfono con espacios ("+53 6 396 2417"); acá se deja
 * también en el formato que exige `wa.me`, que son **solo dígitos, sin "+"**.
 */

interface ContactoBackend {
  telefono?: string;
  correo?: string;
  direccion?: string;
}

export async function GET() {
  try {
    const respuesta = await fetch(`${getBackendUrl()}/api/contactos`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!respuesta.ok) {
      console.error(`Error del backend al pedir contactos: ${respuesta.status}`);
      return NextResponse.json(
        { success: false, message: "No se pudo obtener el contacto" },
        { status: respuesta.status },
      );
    }

    const datos = await respuesta.json();
    const lista: ContactoBackend[] = Array.isArray(datos?.data)
      ? datos.data
      : datos?.data
        ? [datos.data]
        : [];

    const contacto = lista.find((item) => Boolean(item?.telefono));

    if (!contacto?.telefono) {
      return NextResponse.json(
        { success: false, message: "No hay un teléfono de contacto configurado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contacto obtenido",
      data: {
        telefono: contacto.telefono,
        // wa.me no acepta espacios, guiones ni el "+" inicial.
        whatsapp: contacto.telefono.replace(/\D/g, ""),
      },
    });
  } catch (error) {
    console.error("Error al obtener el contacto de feria:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
