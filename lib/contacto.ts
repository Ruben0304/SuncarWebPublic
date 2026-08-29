/**
 * Fuente única de los datos de contacto de SunCar.
 *
 * Todo lo que la web muestre —teléfono, correo o dirección— sale de acá, y acá
 * sale de `/api/contactos`, que a su vez lee el backend. El problema que
 * resuelve: la dirección y el número estaban escritos a mano en nueve sitios
 * distintos, así que al mudarse la oficina el pie de página quedó bien y la
 * tarjeta "Visítanos" del inicio siguió mostrando la dirección vieja.
 *
 * Hay dos formas de consumirlo según dónde se esté:
 * - `obtenerContacto()` en componentes de servidor.
 * - `useContacto()` (hooks/useContacto.ts) en componentes de cliente.
 */

export interface ContactoSuncar {
  /** Como lo escribe la empresa: "+53 6 396 2417". Para mostrar. */
  telefono: string
  /** Solo dígitos, sin "+": es lo único que acepta `wa.me`. */
  whatsapp: string
  correo: string
  direccion: string
}

/**
 * Último recurso si la API no responde.
 *
 * No es "el dato bueno": es lo que se muestra para no dejar un hueco en la
 * página. Si ves esto en pantalla, la API está caída.
 */
export const CONTACTO_FALLBACK: ContactoSuncar = {
  telefono: "+53 6 396 2417",
  whatsapp: "5363962417",
  correo: "atencion_al_cliente@suncarsrl.com",
  direccion: "Esquina Ave. 3ra y Calle 2 #302, Miramar, Playa. La Habana, Cuba",
}

/** `wa.me` no acepta espacios, guiones ni el "+" inicial. */
export function soloDigitos(telefono: string): string {
  return (telefono || "").replace(/\D/g, "")
}

/** Normaliza lo que devuelve la API, completando lo que falte con el fallback. */
export function aContacto(crudo: unknown): ContactoSuncar {
  const dato = (crudo ?? {}) as Record<string, unknown>
  const telefono = typeof dato.telefono === "string" && dato.telefono.trim()
    ? dato.telefono.trim()
    : CONTACTO_FALLBACK.telefono

  return {
    telefono,
    whatsapp: soloDigitos(telefono) || CONTACTO_FALLBACK.whatsapp,
    correo:
      typeof dato.correo === "string" && dato.correo.trim()
        ? dato.correo.trim()
        : CONTACTO_FALLBACK.correo,
    direccion:
      typeof dato.direccion === "string" && dato.direccion.trim()
        ? dato.direccion.trim()
        : CONTACTO_FALLBACK.direccion,
  }
}

/**
 * Contacto para componentes de servidor.
 *
 * Se cachea una hora: son datos que cambian una vez al año y no justifican una
 * llamada por visita. Si la API falla, devuelve el fallback en vez de romper la
 * página: una dirección desactualizada es mejor que un error 500 en el inicio.
 */
export async function obtenerContacto(): Promise<ContactoSuncar> {
  try {
    const { getBackendUrl } = await import("@/lib/backend-url")
    const respuesta = await fetch(`${getBackendUrl()}/api/contactos/first`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer suncar-token-2025",
      },
      next: { revalidate: 3600 },
    })

    if (!respuesta.ok) return CONTACTO_FALLBACK

    const datos = await respuesta.json()
    return aContacto(datos?.data)
  } catch {
    return CONTACTO_FALLBACK
  }
}
