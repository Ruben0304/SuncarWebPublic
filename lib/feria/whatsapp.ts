/**
 * El QR que se lleva el visitante.
 *
 * Cómo funciona, que no es obvio: el QR **no** manda nada desde la tablet. Lo
 * escanea el visitante con **su** teléfono, se le abre WhatsApp con el mensaje
 * ya escrito y él aprieta enviar. El mensaje entra al WhatsApp de la empresa,
 * que está conectado a Chatwoot, y aparece allá con **su número real**.
 *
 * Eso resuelve dos cosas de golpe: el backend no manda WhatsApp (Evolution API
 * está atada a Chatwoot, no al backend), y si el visitante no tiene señal en la
 * playa su propio teléfono encola el mensaje y lo suelta al recuperarla.
 *
 * El texto va en primera persona del visitante porque es él quien lo envía.
 */

import type { KitFeria, KitMatch } from "@/lib/feria/kits"
import type { EquipoSeleccionado } from "@/lib/feria/perfiles"
import type { SesionFeria } from "@/lib/feria/sesion"
import type { ResultadoDimensionamiento } from "@/lib/solar/dimensionamiento"

export interface ContextoResumen {
  resultado: ResultadoDimensionamiento
  equipos: EquipoSeleccionado[]
  horas: number
  kit: KitMatch | null
  base: { kit: KitFeria; bateriasFaltantes: number; panelesFaltantes: number } | null
  sesion: SesionFeria
}

/** Un decimal, con coma: lo va a leer un cliente cubano en su teléfono. */
function n1(valor: number): string {
  return valor.toFixed(1).replace(".", ",")
}

function precioTexto(kit: KitFeria): string {
  return `$${Math.round(kit.precio).toLocaleString("en-US")} ${kit.moneda}`
}

/**
 * El mensaje que el visitante le manda a SunCar.
 *
 * **Cada carácter agranda el QR**, y un QR denso no se deja escanear con sol de
 * frente y la pantalla llena de huellas. Por eso el texto es telegráfico: nada
 * de "Con 8 horas de apagón necesito un inversor de". Al codificarlo en la URL,
 * un espacio pasa a ocupar tres caracteres y una vocal con tilde nueve, así que
 * cada palabra de más se paga cara.
 *
 * Con esta redacción el código queda en 61 módulos; la versión larga anterior
 * daba 77, un 25% más chico cada cuadradito.
 */
export function construirResumen(contexto: ContextoResumen): string {
  const { resultado, horas, kit, base, sesion } = contexto

  const lineas = [
    "Hola SunCar, estuve en el stand de Varadero.",
    `Consumo ${n1(resultado.energiaDiaKwh)} kWh/día, respaldo ${horas} h.`,
    `Necesito ${n1(resultado.inversorKva)} kVA, ${n1(
      resultado.bateriaBancoKwh
    )} kWh y ${resultado.numeroPaneles} paneles.`,
  ]

  if (kit) {
    lineas.push(`Kit ${kit.kit.resumen} - ${precioTexto(kit.kit)}.`)
  } else if (base) {
    const extras = [
      base.bateriasFaltantes > 0
        ? `${base.bateriasFaltantes} batería${base.bateriasFaltantes > 1 ? "s" : ""}`
        : "",
      base.panelesFaltantes > 0
        ? `${base.panelesFaltantes} panel${base.panelesFaltantes > 1 ? "es" : ""}`
        : "",
    ]
      .filter(Boolean)
      .join(" y ")

    lineas.push(`Base ${base.kit.resumen} - ${precioTexto(base.kit)}.`, `Ampliar con ${extras}.`)
  }

  lineas.push(`Me atendió ${sesion.nombre}.`)

  return lineas.join("\n")
}

/**
 * El enlace que se codifica en el QR.
 *
 * `numero` tiene que venir en dígitos, sin "+" ni espacios: es lo único que
 * acepta wa.me. Lo devuelve así `/api/feria/contacto`.
 */
export function enlaceWhatsapp(numero: string, mensaje: string): string {
  const digitos = numero.replace(/\D/g, "")
  return `https://wa.me/${digitos}?text=${encodeURIComponent(mensaje)}`
}
