"use client";

import { useEffect, useState } from "react";

import { aContacto, CONTACTO_FALLBACK, type ContactoSuncar } from "@/lib/contacto";

/**
 * Caché a nivel de módulo, compartida por todos los componentes.
 *
 * En la portada hay tres consumidores del contacto —la tarjeta de WhatsApp, la
 * de "Visítanos" y el pie de página— y cada uno hacía su propia petición. Son
 * datos que cambian una vez al año: alcanza con pedirlos una vez por carga.
 *
 * Desde que la tienda es por provincia hay un contacto por provincia, así que
 * la caché se indexa por código. La clave "" es el contacto nacional, que es el
 * que usa todo lo que no es la tienda.
 */
const contactoCacheado = new Map<string, ContactoSuncar>();
const peticionesEnCurso = new Map<string, Promise<ContactoSuncar>>();

function urlDe(provincia: string): string {
  return provincia ? `/api/contactos/provincia/${provincia}` : "/api/contactos";
}

function pedirContacto(provincia: string): Promise<ContactoSuncar> {
  const cacheado = contactoCacheado.get(provincia);
  if (cacheado) return Promise.resolve(cacheado);
  // El segundo componente que monta se engancha a la petición del primero en
  // vez de abrir otra.
  const enCurso = peticionesEnCurso.get(provincia);
  if (enCurso) return enCurso;

  const peticion = fetch(urlDe(provincia))
    .then((respuesta) => respuesta.json())
    .then((datos) => {
      if (!datos?.success) throw new Error(datos?.message || "respuesta sin datos");
      // `/api/contactos` devuelve el primer contacto; el endpoint plural del
      // backend devolvía un arreglo, así que se contemplan las dos formas.
      const contacto = aContacto(Array.isArray(datos.data) ? datos.data[0] : datos.data);
      contactoCacheado.set(provincia, contacto);
      return contacto;
    })
    .catch(() => {
      // El fallo NO se cachea: si fue un corte momentáneo, el próximo montaje
      // vuelve a intentarlo en vez de quedarse con el respaldo toda la sesión.
      peticionesEnCurso.delete(provincia);
      return CONTACTO_FALLBACK;
    });

  peticionesEnCurso.set(provincia, peticion);
  return peticion;
}

/**
 * Contacto de SunCar para componentes de cliente.
 *
 * Arranca con el fallback en vez de con `null`: así el número de WhatsApp de un
 * botón ya es utilizable en el primer render y no hay un instante en que el
 * enlace apunte a ninguna parte. Cuando llega la respuesta, se reemplaza.
 *
 * @param provinciaCodigo código de 2 dígitos. Sin él devuelve el nacional, que
 *   es lo que quiere todo lo que no es la tienda (pie de página, portada...).
 */
export function useContacto(
  provinciaCodigo?: string | null,
): { contacto: ContactoSuncar; cargando: boolean } {
  const clave = provinciaCodigo ?? "";
  const [contacto, setContacto] = useState<ContactoSuncar>(
    contactoCacheado.get(clave) ?? CONTACTO_FALLBACK,
  );
  const [cargando, setCargando] = useState(!contactoCacheado.has(clave));

  useEffect(() => {
    const yaEstaba = contactoCacheado.get(clave);
    if (yaEstaba) {
      setContacto(yaEstaba);
      setCargando(false);
      return;
    }

    let vivo = true;
    setCargando(true);
    pedirContacto(clave).then((resuelto) => {
      if (!vivo) return;
      setContacto(resuelto);
      setCargando(false);
    });

    return () => {
      vivo = false;
    };
  }, [clave]);

  return { contacto, cargando };
}
