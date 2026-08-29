"use client";

import { useEffect, useState } from "react";

import { aContacto, CONTACTO_FALLBACK, type ContactoSuncar } from "@/lib/contacto";

/**
 * Contacto de SunCar para componentes de cliente.
 *
 * Arranca con el fallback en vez de con `null`: así el número de WhatsApp de un
 * botón ya es utilizable en el primer render y no hay un instante en que el
 * enlace apunte a ninguna parte. Cuando llega la respuesta de la API, se
 * reemplaza.
 *
 * Pide `/api/contactos` —la ruta propia— y no el backend directo, para no
 * depender de `NEXT_PUBLIC_BACKEND_URL` en el navegador.
 */
export function useContacto(): { contacto: ContactoSuncar; cargando: boolean } {
  const [contacto, setContacto] = useState<ContactoSuncar>(CONTACTO_FALLBACK);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;

    fetch("/api/contactos")
      .then((respuesta) => respuesta.json())
      .then((datos) => {
        if (!vivo || !datos?.success) return;
        // `/api/contactos` devuelve el primer contacto; el endpoint plural del
        // backend devolvía un arreglo, así que se contemplan las dos formas.
        setContacto(aContacto(Array.isArray(datos.data) ? datos.data[0] : datos.data));
      })
      .catch(() => undefined)
      .finally(() => {
        if (vivo) setCargando(false);
      });

    return () => {
      vivo = false;
    };
  }, []);

  return { contacto, cargando };
}
