"use client";

import { useEffect, useState } from "react";

import { aContacto, CONTACTO_FALLBACK, type ContactoSuncar } from "@/lib/contacto";

/**
 * Caché a nivel de módulo, compartida por todos los componentes.
 *
 * En la portada hay tres consumidores del contacto —la tarjeta de WhatsApp, la
 * de "Visítanos" y el pie de página— y cada uno hacía su propia petición. Son
 * datos que cambian una vez al año: alcanza con pedirlos una vez por carga.
 */
let contactoCacheado: ContactoSuncar | null = null;
let peticionEnCurso: Promise<ContactoSuncar> | null = null;

function pedirContacto(): Promise<ContactoSuncar> {
  if (contactoCacheado) return Promise.resolve(contactoCacheado);
  // El segundo componente que monta se engancha a la petición del primero en
  // vez de abrir otra.
  if (peticionEnCurso) return peticionEnCurso;

  peticionEnCurso = fetch("/api/contactos")
    .then((respuesta) => respuesta.json())
    .then((datos) => {
      if (!datos?.success) throw new Error(datos?.message || "respuesta sin datos");
      // `/api/contactos` devuelve el primer contacto; el endpoint plural del
      // backend devolvía un arreglo, así que se contemplan las dos formas.
      const contacto = aContacto(Array.isArray(datos.data) ? datos.data[0] : datos.data);
      contactoCacheado = contacto;
      return contacto;
    })
    .catch(() => {
      // El fallo NO se cachea: si fue un corte momentáneo, el próximo montaje
      // vuelve a intentarlo en vez de quedarse con el respaldo toda la sesión.
      peticionEnCurso = null;
      return CONTACTO_FALLBACK;
    });

  return peticionEnCurso;
}

/**
 * Contacto de SunCar para componentes de cliente.
 *
 * Arranca con el fallback en vez de con `null`: así el número de WhatsApp de un
 * botón ya es utilizable en el primer render y no hay un instante en que el
 * enlace apunte a ninguna parte. Cuando llega la respuesta, se reemplaza.
 */
export function useContacto(): { contacto: ContactoSuncar; cargando: boolean } {
  const [contacto, setContacto] = useState<ContactoSuncar>(
    contactoCacheado ?? CONTACTO_FALLBACK,
  );
  const [cargando, setCargando] = useState(!contactoCacheado);

  useEffect(() => {
    if (contactoCacheado) {
      setContacto(contactoCacheado);
      setCargando(false);
      return;
    }

    let vivo = true;
    pedirContacto().then((resuelto) => {
      if (!vivo) return;
      setContacto(resuelto);
      setCargando(false);
    });

    return () => {
      vivo = false;
    };
  }, []);

  return { contacto, cargando };
}
