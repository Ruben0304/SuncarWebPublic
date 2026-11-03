// Contacto de SunCar para islas de Svelte.
//
// Una sola petición por provincia y por carga: la portada tiene tres
// consumidores (WhatsApp, "Visítanos", pie) y antes cada uno pedía lo mismo.
// La clave "" es el contacto nacional; con código de provincia, el de esa
// provincia (lo usa la tienda).
import { aContacto, CONTACTO_FALLBACK, type ContactoSuncar } from "@/lib/contacto";

const cacheado = new Map<string, ContactoSuncar>();
const enCurso = new Map<string, Promise<ContactoSuncar>>();

export function pedirContacto(provincia = ""): Promise<ContactoSuncar> {
  const listo = cacheado.get(provincia);
  if (listo) return Promise.resolve(listo);
  const pendiente = enCurso.get(provincia);
  if (pendiente) return pendiente;

  const url = provincia ? `/api/contactos/provincia/${provincia}` : "/api/contactos";
  const peticion = fetch(url)
    .then((r) => r.json())
    .then((datos) => {
      if (!datos?.success) throw new Error(datos?.message || "respuesta sin datos");
      const contacto = aContacto(Array.isArray(datos.data) ? datos.data[0] : datos.data);
      cacheado.set(provincia, contacto);
      enCurso.delete(provincia);
      return contacto;
    })
    .catch(() => {
      // El fallo no se cachea: un corte momentáneo no debe dejar el respaldo
      // puesto toda la sesión.
      enCurso.delete(provincia);
      return CONTACTO_FALLBACK;
    });
  enCurso.set(provincia, peticion);
  return peticion;
}

/**
 * Úsalo en el script de un componente (corre dentro de su ciclo de vida):
 *
 *   const c = useContacto();            // nacional
 *   const c = useContacto(() => cod);   // por provincia, reacciona al cambio
 *
 * Arranca con el respaldo, así que `c.contacto.whatsapp` ya sirve en el primer
 * render; cuando llega la respuesta se reemplaza.
 */
export function useContacto(provincia: () => string | null | undefined = () => "") {
  let contacto = $state<ContactoSuncar>(cacheado.get(provincia() ?? "") ?? CONTACTO_FALLBACK);
  let cargando = $state(!cacheado.has(provincia() ?? ""));

  $effect(() => {
    const clave = provincia() ?? "";
    let vivo = true;
    const ya = cacheado.get(clave);
    if (ya) {
      contacto = ya;
      cargando = false;
    } else {
      cargando = true;
      pedirContacto(clave).then((c) => {
        if (!vivo) return;
        contacto = c;
        cargando = false;
      });
    }
    return () => {
      vivo = false;
    };
  });

  return {
    get contacto() {
      return contacto;
    },
    get cargando() {
      return cargando;
    },
  };
}
