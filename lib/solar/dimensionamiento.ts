/**
 * Motor de dimensionamiento de sistemas solares (lógica pura, sin UI).
 *
 * Calcula inversor, banco de baterías y paneles a partir de la lista de
 * equipos de un hogar o empresa. Pensado para ser validado por un técnico:
 * cada constante y cada fórmula está documentada.
 */

export type PerfilUso = "hogar" | "empresa"
export type TipoCarga = "resistiva" | "electronica" | "motor"
export type TecnologiaBateria = "litio" | "plomo"
export type Fases = "monofasico" | "trifasico"

/** Constantes de ingeniería con valores por defecto razonables para Cuba. */
export const CONSTANTES = {
  /** Horas Sol Pico promedio en Cuba (kWh/m²·día equivalentes). */
  HSP: 5,
  /** Performance Ratio: pérdidas globales del sistema FV (temperatura, polvo, cableado). */
  PR: 0.75,
  /** Potencia de un panel típico (kWp). 550 W. */
  POTENCIA_PANEL_KWP: 0.55,
  /** Eficiencia del inversor. */
  EFICIENCIA_INVERSOR: 0.95,
  /** Eficiencia round-trip de la batería (carga + descarga). */
  EFICIENCIA_BATERIA: 0.9,
  /** Factor de potencia típico de cargas mixtas (kW reales / kVA aparentes). */
  FACTOR_POTENCIA: 0.8,
} as const

/** Factor de simultaneidad: fracción de la potencia instalada encendida a la vez. */
export const FACTOR_SIMULTANEIDAD: Record<PerfilUso, number> = {
  hogar: 0.6,
  empresa: 0.75,
}

/** Profundidad de descarga útil según tecnología de batería. */
export const DOD: Record<TecnologiaBateria, number> = {
  litio: 0.9,
  plomo: 0.5,
}

/** Horas de uso al día por defecto, estimadas por categoría. */
export const HORAS_USO_POR_CATEGORIA: Record<string, number> = {
  "Electrodomésticos de Cocina": 2,
  "Equipos de Sala y Entretenimiento": 5,
  "Climatización y Ventilación": 8,
  "Iluminación": 5,
  "Dormitorio y Uso General": 6,
  "Lavandería y Limpieza": 1,
  "Agua y Servicios": 2,
  "Otros Equipos y Herramientas": 3,
}

export const HORAS_USO_DEFAULT = 4
/** Factor de arranque por defecto para cargas tipo motor (pico ≈ 3.5× nominal). */
export const FACTOR_ARRANQUE_MOTOR = 3.5

const PALABRAS_MOTOR = [
  "aire",
  "split",
  "climati",
  "refriger",
  "nevera",
  "frigo",
  "congelador",
  "freezer",
  "bomba",
  "motor",
  "compresor",
  "lavadora",
  "secadora",
  "ventilador",
  "extractor",
]

/** Infiere si un equipo es de tipo motor a partir de su nombre. */
export function inferirTipoCarga(nombre: string): TipoCarga {
  const n = nombre.toLowerCase()
  if (PALABRAS_MOTOR.some((p) => n.includes(p))) return "motor"
  return "resistiva"
}

/** Horas de uso por defecto a partir de la categoría del equipo. */
export function horasUsoPorDefecto(categoriaNombre: string): number {
  return HORAS_USO_POR_CATEGORIA[categoriaNombre] ?? HORAS_USO_DEFAULT
}

/** Factor de arranque por defecto a partir del tipo de carga. */
export function factorArranquePorDefecto(tipo: TipoCarga): number {
  return tipo === "motor" ? FACTOR_ARRANQUE_MOTOR : 1
}

export interface EquipoCalculo {
  /** Potencia nominal instantánea (kW). */
  potencia_kw: number
  /** Consumo medio por hora de operación (kWh/h ≈ kW promedio con su ciclo de trabajo). */
  energia_kwh: number
  /** Horas de uso al día. */
  horas_uso_dia: number
  /** Factor de arranque (1 = sin pico; >1 motores). */
  factor_arranque: number
  /** Cantidad de unidades de este equipo. */
  cantidad: number
}

export interface ParametrosDimensionamiento {
  perfil: PerfilUso
  tecnologiaBateria: TecnologiaBateria
  /** Horas de respaldo deseadas sin red eléctrica (apagón). */
  horasAutonomia: number
  /** Override del factor de simultaneidad (modo experto). */
  factorSimultaneidad?: number
  /** Override de Horas Sol Pico (modo experto). */
  hsp?: number
  /** Override del Performance Ratio (modo experto). */
  pr?: number
  /** Override del factor de potencia (modo experto). */
  factorPotencia?: number
  /** Potencia del panel a usar para contar unidades (kWp). */
  potenciaPanelKwp?: number
}

export interface ResultadoDimensionamiento {
  /** Energía total consumida al día (kWh/día). */
  energiaDiaKwh: number
  /** Suma bruta de potencias nominales (kW), sin simultaneidad. */
  potenciaInstaladaKw: number
  /** Potencia continua exigida al inversor tras simultaneidad (kW). */
  potenciaContinuaKw: number
  /** Pico instantáneo por arranque de motores (kW). */
  potenciaPicoKw: number
  /** Potencia aparente del inversor recomendado (kVA). */
  inversorKva: number
  /** Potencia continua mínima del inversor recomendado (kW). */
  inversorKw: number
  /** Energía útil que se quiere respaldar durante la autonomía (kWh). */
  bateriaUtilKwh: number
  /** Capacidad real del banco de baterías tras DoD y pérdidas (kWh). */
  bateriaBancoKwh: number
  /** Potencia pico del campo fotovoltaico (kWp). */
  panelesKwp: number
  /** Número de paneles necesarios. */
  numeroPaneles: number
}

/**
 * Núcleo del dimensionamiento. Recibe equipos ya normalizados y parámetros.
 */
export function dimensionarSistema(
  equipos: EquipoCalculo[],
  parametros: ParametrosDimensionamiento
): ResultadoDimensionamiento {
  const factorSimultaneidad =
    parametros.factorSimultaneidad ?? FACTOR_SIMULTANEIDAD[parametros.perfil]
  const hsp = parametros.hsp ?? CONSTANTES.HSP
  const pr = parametros.pr ?? CONSTANTES.PR
  const factorPotencia = parametros.factorPotencia ?? CONSTANTES.FACTOR_POTENCIA
  const potenciaPanel = parametros.potenciaPanelKwp ?? CONSTANTES.POTENCIA_PANEL_KWP
  const dod = DOD[parametros.tecnologiaBateria]

  let potenciaInstaladaKw = 0
  let energiaDiaKwh = 0
  let sobrecargaArranqueKw = 0

  for (const equipo of equipos) {
    const cant = Math.max(0, equipo.cantidad)
    potenciaInstaladaKw += equipo.potencia_kw * cant
    energiaDiaKwh += equipo.energia_kwh * equipo.horas_uso_dia * cant
    // Energía extra de arranque por encima de la nominal (solo motores).
    const extraArranque = equipo.potencia_kw * cant * Math.max(0, equipo.factor_arranque - 1)
    sobrecargaArranqueKw += extraArranque
  }

  const potenciaContinuaKw = potenciaInstaladaKw * factorSimultaneidad
  const potenciaPicoKw = potenciaContinuaKw + sobrecargaArranqueKw

  const inversorKw = potenciaContinuaKw / CONSTANTES.EFICIENCIA_INVERSOR
  const inversorKva = inversorKw / factorPotencia

  const bateriaUtilKwh = (energiaDiaKwh / 24) * parametros.horasAutonomia
  const bateriaBancoKwh =
    bateriaUtilKwh / (dod * CONSTANTES.EFICIENCIA_BATERIA * CONSTANTES.EFICIENCIA_INVERSOR)

  const panelesKwp = energiaDiaKwh / (hsp * pr)
  const numeroPaneles = panelesKwp > 0 ? Math.ceil(panelesKwp / potenciaPanel) : 0

  return {
    energiaDiaKwh,
    potenciaInstaladaKw,
    potenciaContinuaKw,
    potenciaPicoKw,
    inversorKva,
    inversorKw,
    bateriaUtilKwh,
    bateriaBancoKwh,
    panelesKwp,
    numeroPaneles,
  }
}
