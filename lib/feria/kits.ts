/**
 * Kits del stand de feria: catálogo, parseo de especificaciones y match contra
 * el dimensionamiento calculado.
 *
 * El catálogo es el MISMO que alimenta /ofertas en la web pública:
 * `/api/ofertas/confeccion/?tipo_oferta=generica&estado=aprobada_para_enviar`.
 * No se usa `/api/ofertas/` (el catálogo viejo): ahí las especificaciones viven
 * en texto libre e inconsistente y varias ofertas están dadas de baja.
 *
 * Las especificaciones se leen de `nombre_automatico`, que el backend genera con
 * un formato fijo y por eso es parseable sin ambigüedad:
 *
 *     "I-1x7,5kW, B-1x14,3kWh, P-6x600W"   → inversor, batería y paneles
 *     "I-2x5kW, B-3x5,12kWh"               → sin paneles (solo respaldo)
 *
 * Ojo con el decimal: el backend escribe coma, no punto.
 */

import type { ResultadoDimensionamiento } from "@/lib/solar/dimensionamiento"

/** Un kit vendible, con sus capacidades ya totalizadas (cantidad × capacidad). */
export interface KitFeria {
  id: string
  /** Nombre comercial largo, para mostrarle al cliente. */
  nombre: string
  /** Resumen compacto tal como lo genera el backend. Útil para depurar. */
  resumen: string
  /** Potencia total de inversores en kW. */
  inversorKw: number
  /** Capacidad total del banco de baterías en kWh. */
  bateriaKwh: number
  /** Potencia pico total del campo fotovoltaico en kWp. */
  panelesKwp: number
  /** Capacidad de UNA batería, en kWh. Es la unidad con la que se amplía el kit. */
  bateriaUnidadKwh: number
  /** Potencia de UN panel, en W. Es la unidad con la que se amplía el kit. */
  panelUnidadW: number
  precio: number
  moneda: string
  fotoUrl?: string
  /** Un kit sin paneles es respaldo puro: no genera, solo aguanta el apagón. */
  tienePaneles: boolean
}

/** Cómo le queda un kit a un cliente concreto. */
export interface KitMatch {
  kit: KitFeria
  cubreInversor: boolean
  cubreBaterias: boolean
  cubrePaneles: boolean
  /** Cuánto sobra respecto de lo pedido. Menor = más ajustado = más barato. */
  holgura: number
  etiqueta: EtiquetaKit
}

export type EtiquetaKit = "ajustado" | "holgado" | "solo-respaldo" | "insuficiente"

const RE_INVERSOR = /I-(\d+)\s*x\s*([\d.,]+)\s*kW/i
const RE_BATERIA = /B-(\d+)\s*x\s*([\d.,]+)\s*kWh/i
const RE_PANEL = /P-(\d+)\s*x\s*([\d.,]+)\s*W/i

/** Convierte "7,5" o "7.5" a 7.5. El backend usa coma decimal. */
function aNumero(valor: string): number {
  const n = Number.parseFloat(valor.replace(",", "."))
  return Number.isFinite(n) ? n : 0
}

/** Extrae `cantidad` y `capacidad unitaria` de un tramo del nombre automático. */
function componenteDe(texto: string, patron: RegExp): { cantidad: number; unidad: number } {
  const m = texto.match(patron)
  if (!m) return { cantidad: 0, unidad: 0 }
  return { cantidad: Number.parseInt(m[1], 10), unidad: aNumero(m[2]) }
}

/**
 * Lee las especificaciones de un `nombre_automatico`.
 * Devuelve ceros en los componentes ausentes, que es información válida:
 * un kit sin tramo `P-` sencillamente no trae paneles.
 */
export function parsearEspecificaciones(nombreAutomatico: string): {
  inversorKw: number
  bateriaKwh: number
  panelesKwp: number
  bateriaUnidadKwh: number
  panelUnidadW: number
} {
  const texto = nombreAutomatico || ""
  const inversor = componenteDe(texto, RE_INVERSOR)
  const bateria = componenteDe(texto, RE_BATERIA)
  const panel = componenteDe(texto, RE_PANEL)

  return {
    inversorKw: inversor.cantidad * inversor.unidad,
    bateriaKwh: bateria.cantidad * bateria.unidad,
    // Los paneles vienen en W por unidad; el dimensionamiento trabaja en kWp.
    panelesKwp: (panel.cantidad * panel.unidad) / 1000,
    bateriaUnidadKwh: bateria.unidad,
    panelUnidadW: panel.unidad,
  }
}

/** Convierte una oferta cruda del backend en un kit utilizable por el stand. */
export function aKitFeria(oferta: Record<string, any>): KitFeria | null {
  const resumen: string = oferta?.nombre_automatico || ""
  const specs = parsearEspecificaciones(resumen)

  // Sin inversor no hay sistema que ofrecer: se descarta en vez de mostrarlo mal.
  if (specs.inversorKw <= 0) return null

  return {
    id: String(oferta.id),
    nombre: oferta.nombre_completo || oferta.nombre_oferta || resumen,
    resumen,
    ...specs,
    precio: Number(oferta.precio_final) || 0,
    moneda: (oferta.moneda_pago || "USD").toUpperCase(),
    fotoUrl: oferta.foto_portada || undefined,
    tienePaneles: specs.panelesKwp > 0,
  }
}

/** Margen que se le tolera a un kit para considerarlo suficiente (5%). */
const TOLERANCIA = 0.95

/** Prioridad de cada etiqueta al ordenar. Menor = se muestra antes. */
const PRIORIDAD: Record<EtiquetaKit, number> = {
  ajustado: 0,
  holgado: 1,
  "solo-respaldo": 2,
  insuficiente: 3,
}

/**
 * Ordena los kits por qué tan bien le calzan al dimensionamiento del cliente.
 *
 * Criterio: un inversor corto no se ofrece nunca —dejaría al cliente sin poder
 * arrancar sus equipos—, así que esos kits se descartan. Del resto se muestran
 * primero los que cubren todo lo que el cliente pidió, y solo después los que
 * cubren a medias.
 *
 * El orden NO puede ser por holgura a secas: un kit sin paneles siempre tiene
 * menos holgura que uno equivalente con paneles (no suma exceso fotovoltaico) y
 * terminaba encabezando el ranking de un cliente que sí quería generar. Por eso
 * la etiqueta manda sobre la holgura.
 */
export function matchKits(
  resultado: ResultadoDimensionamiento,
  kits: KitFeria[],
  opciones: { incluirSoloRespaldo?: boolean; incluirInsuficientes?: boolean } = {}
): KitMatch[] {
  const { incluirSoloRespaldo = true, incluirInsuficientes = false } = opciones
  const necesitaPaneles = resultado.panelesKwp > 0

  return kits
    .map((kit): KitMatch => {
      const cubreInversor = kit.inversorKw >= resultado.inversorKva * TOLERANCIA
      const cubreBaterias = kit.bateriaKwh >= resultado.bateriaBancoKwh * TOLERANCIA
      const cubrePaneles =
        !necesitaPaneles || kit.panelesKwp >= resultado.panelesKwp * TOLERANCIA

      const holgura =
        Math.max(0, kit.inversorKw - resultado.inversorKva) +
        Math.max(0, kit.bateriaKwh - resultado.bateriaBancoKwh) +
        Math.max(0, kit.panelesKwp - resultado.panelesKwp)

      let etiqueta: EtiquetaKit
      if (!cubreInversor || !cubreBaterias) {
        etiqueta = "insuficiente"
      } else if (necesitaPaneles && !kit.tienePaneles) {
        etiqueta = "solo-respaldo"
      } else {
        etiqueta = holgura <= 3 ? "ajustado" : "holgado"
      }

      return { kit, cubreInversor, cubreBaterias, cubrePaneles, holgura, etiqueta }
    })
    .filter((m) => m.cubreInversor)
    .filter((m) => incluirSoloRespaldo || m.etiqueta !== "solo-respaldo")
    .filter((m) => incluirInsuficientes || m.etiqueta !== "insuficiente")
    .sort((a, b) => {
      const dif = PRIORIDAD[a.etiqueta] - PRIORIDAD[b.etiqueta]
      return dif !== 0 ? dif : a.holgura - b.holgura
    })
}

/** Panel estándar del catálogo, para estimar ampliaciones sobre kits sin paneles. */
const PANEL_ESTANDAR_W = 600

/** Lo que le falta a un kit para cubrir al cliente, en unidades comprables. */
export interface Ampliacion {
  bateriasFaltantes: number
  /** kWh que aportan esas baterías extra. */
  bateriaExtraKwh: number
  panelesFaltantes: number
  /** kWp que aportan esos paneles extra. */
  panelExtraKwp: number
  /** `false` cuando el kit ya cubre todo y no hace falta ampliar nada. */
  necesitaAmpliar: boolean
}

/**
 * Calcula cuántas baterías y paneles hay que sumarle a un kit para llegar a lo
 * que el cliente necesita.
 *
 * Los kits son ampliables, así que un kit "corto" no es un no-vende: es una base
 * sobre la que el comercial arma la propuesta. Se expresa en unidades enteras
 * (baterías y paneles) y no en kWh sueltos, porque es lo que el cliente compra y
 * lo que el comercial puede cotizar de cabeza en el stand.
 */
export function calcularAmpliacion(
  resultado: ResultadoDimensionamiento,
  kit: KitFeria
): Ampliacion {
  const unidadBateria = kit.bateriaUnidadKwh > 0 ? kit.bateriaUnidadKwh : 0
  const unidadPanelW = kit.panelUnidadW > 0 ? kit.panelUnidadW : PANEL_ESTANDAR_W

  const faltaBateriaKwh = Math.max(0, resultado.bateriaBancoKwh - kit.bateriaKwh)
  const faltaPanelesKwp = Math.max(0, resultado.panelesKwp - kit.panelesKwp)

  const bateriasFaltantes =
    unidadBateria > 0 ? Math.ceil(faltaBateriaKwh / unidadBateria) : 0
  const panelesFaltantes = Math.ceil(faltaPanelesKwp / (unidadPanelW / 1000))

  return {
    bateriasFaltantes,
    bateriaExtraKwh: bateriasFaltantes * unidadBateria,
    panelesFaltantes,
    panelExtraKwp: (panelesFaltantes * unidadPanelW) / 1000,
    necesitaAmpliar: bateriasFaltantes > 0 || panelesFaltantes > 0,
  }
}

/**
 * Elige la mejor base ampliable cuando ningún kit cubre al cliente de fábrica.
 *
 * Pasa con hostales y restaurantes, que es el público de más valor de la feria:
 * piden más batería y más paneles que el kit más grande del catálogo. En vez de
 * dejar al comercial sin nada que mostrar, se elige el kit que menos ampliación
 * requiere y se le dice exactamente cuánto le falta.
 */
export function mejorBaseAmpliable(
  resultado: ResultadoDimensionamiento,
  kits: KitFeria[]
): { kit: KitFeria; ampliacion: Ampliacion } | null {
  const candidatos = kits
    .filter((k) => k.inversorKw >= resultado.inversorKva * TOLERANCIA)
    .map((kit) => ({ kit, ampliacion: calcularAmpliacion(resultado, kit) }))

  if (!candidatos.length) return null

  return candidatos.sort((a, b) => {
    const faltaA = a.ampliacion.bateriasFaltantes + a.ampliacion.panelesFaltantes
    const faltaB = b.ampliacion.bateriasFaltantes + b.ampliacion.panelesFaltantes
    // A igual esfuerzo de ampliación, el más barato manda.
    return faltaA !== faltaB ? faltaA - faltaB : a.kit.precio - b.kit.precio
  })[0]
}
