/**
 * Perfiles precargados del stand de feria.
 *
 * En el stand hay 90 segundos por visitante: no hay tiempo de armar la lista de
 * equipos desde cero. El comercial elige uno de tres perfiles típicos, que ya
 * traen un set de equipos con cantidades razonables, y desde ahí solo ajusta lo
 * que el cliente le corrija.
 *
 * Los equipos NO se definen acá con sus potencias: se referencian por nombre y
 * se resuelven contra el catálogo real (`/api/calculo-energetico/`), que es la
 * fuente de verdad de potencias, consumos y factores de arranque. Si mañana el
 * backend corrige el consumo de un aire, el stand lo toma sin tocar código.
 */

import {
  factorArranquePorDefecto,
  horasUsoPorDefecto,
  inferirTipoCarga,
  type EquipoCalculo,
  type PerfilUso,
  type TipoCarga,
} from "@/lib/solar/dimensionamiento"

/** Un equipo tal como viene del catálogo del backend. */
export interface EquipoCatalogo {
  nombre: string
  categoria: string
  potencia_kw: number
  energia_kwh: number
  /** El backend lo manda casi siempre en null; se estima por categoría. */
  horas_uso_dia: number | null
  tipo_carga: TipoCarga | null
  factor_arranque: number | null
}

/** Un equipo del catálogo con la cantidad que puso el comercial. */
export interface EquipoSeleccionado extends EquipoCatalogo {
  cantidad: number
}

export type PerfilId = "casa" | "casa-aires" | "negocio"

export interface ItemPerfil {
  nombre: string
  cantidad: number
  /**
   * Horas de uso al día, cuando el default por categoría no sirve.
   *
   * El backend manda `horas_uso_dia: null` en todos los equipos, así que el
   * motor cae en el default de la categoría. Para "Electrodomésticos de Cocina"
   * ese default son 2 h, que es correcto para un microondas y absurdo para una
   * nevera: la refrigeración trabaja las 24 h y su `energia_kwh` ya viene
   * promediada por ciclo de trabajo. Sin este override una casa da 3.4 kWh/día
   * y el stand muestra un sistema que no existe.
   */
  horas?: number
}

export interface PerfilFeria {
  id: PerfilId
  nombre: string
  /** Una línea para que el comercial sepa qué carga sin tener que leer la lista. */
  descripcion: string
  perfilUso: PerfilUso
  equipos: ItemPerfil[]
}

/**
 * Los tres perfiles del stand.
 *
 * Los nombres tienen que coincidir con los del catálogo. La resolución es
 * tolerante a mayúsculas y acentos (ver `normalizar`), pero si el backend
 * renombra un equipo, ese renglón simplemente no se carga en vez de romper la
 * pantalla delante del cliente.
 */
export const PERFILES: PerfilFeria[] = [
  {
    id: "casa",
    nombre: "Casa",
    descripcion: "Nevera, luces, TV, bomba de agua. Sin aire acondicionado.",
    perfilUso: "hogar",
    equipos: [
      { nombre: "Refrigerador (A++)", cantidad: 1, horas: 24 },
      { nombre: 'Televisor LED 32"', cantidad: 1 },
      { nombre: "Lámpara LED 10W", cantidad: 6 },
      { nombre: "Ventilador de pie", cantidad: 2 },
      { nombre: "Cargador de celular", cantidad: 3 },
      { nombre: "Bomba de agua doméstica 1/2 HP", cantidad: 1 },
      { nombre: "Olla arrocera", cantidad: 1 },
      { nombre: "Router WiFi", cantidad: 1, horas: 24 },
    ],
  },
  {
    id: "casa-aires",
    nombre: "Casa + aires",
    descripcion: "Lo de una casa más 2 aires de 12000 BTU y lavadora.",
    perfilUso: "hogar",
    equipos: [
      { nombre: "Refrigerador (A++)", cantidad: 1, horas: 24 },
      { nombre: "Aire acondicionado 12000 BTU (1 Tn)", cantidad: 2 },
      { nombre: 'Televisor LED 50"', cantidad: 1 },
      { nombre: "Lámpara LED 10W", cantidad: 8 },
      { nombre: "Ventilador de pie", cantidad: 2 },
      { nombre: "Cargador de celular", cantidad: 4 },
      { nombre: "Bomba de agua doméstica 1/2 HP", cantidad: 1 },
      { nombre: "Lavadora automática", cantidad: 1 },
      { nombre: "Microondas", cantidad: 1 },
      { nombre: "Router WiFi", cantidad: 1, horas: 24 },
    ],
  },
  {
    id: "negocio",
    nombre: "Negocio / hostal",
    descripcion: "6 habitaciones con aire, minibar, TV y bomba de agua.",
    perfilUso: "empresa",
    // El inversor más grande del catálogo es de 10 kW (I-1x10kW o I-2x5kW en
    // paralelo). Con 6 aires ya se van 7.8 kW de potencia instalada, así que el
    // resto del set tiene que ser liviano o el perfil se pasa de 10 kVA y
    // matchKits se queda sin un solo kit que ofrecer. Calentadores eléctricos
    // (2 kW cada uno) quedan fuera a propósito: si el cliente los tiene, el
    // comercial los agrega y ve en pantalla que hay que ir a un sistema mayor.
    equipos: [
      { nombre: "Aire acondicionado 12000 BTU (1 Tn)", cantidad: 6 },
      { nombre: "Refrigerador (A++)", cantidad: 2, horas: 24 },
      { nombre: "Mini bar", cantidad: 6, horas: 24 },
      { nombre: 'Televisor LED 32"', cantidad: 6 },
      { nombre: "Lámpara LED 10W", cantidad: 20 },
      { nombre: "Bomba de agua doméstica 1/2 HP", cantidad: 1 },
      { nombre: "Router WiFi", cantidad: 2, horas: 24 },
    ],
  },
]

/** Horas de apagón con las que arranca el slider. Es la realidad de 2026 en Cuba. */
export const HORAS_AUTONOMIA_DEFAULT = 8

/** Quita acentos y mayúsculas para comparar nombres de equipos sin sorpresas. */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

/** Aplana la respuesta de `/api/calculo-energetico/` a una lista de equipos. */
export function aplanarCatalogo(categorias: any[]): EquipoCatalogo[] {
  if (!Array.isArray(categorias)) return []

  return categorias.flatMap((categoria) => {
    const nombreCategoria: string = categoria?.nombre || "Otros Equipos y Herramientas"
    const equipos: any[] = Array.isArray(categoria?.equipos) ? categoria.equipos : []

    return equipos.map(
      (equipo): EquipoCatalogo => ({
        nombre: String(equipo?.nombre || ""),
        categoria: nombreCategoria,
        potencia_kw: Number(equipo?.potencia_kw) || 0,
        energia_kwh: Number(equipo?.energia_kwh) || 0,
        horas_uso_dia:
          equipo?.horas_uso_dia === null || equipo?.horas_uso_dia === undefined
            ? null
            : Number(equipo.horas_uso_dia),
        tipo_carga: (equipo?.tipo_carga as TipoCarga) || null,
        factor_arranque:
          equipo?.factor_arranque === null || equipo?.factor_arranque === undefined
            ? null
            : Number(equipo.factor_arranque),
      })
    )
  })
}

/**
 * Resuelve los equipos de un perfil contra el catálogo real.
 * Los que no aparecen en el catálogo se omiten en silencio: es preferible un
 * cálculo con un equipo de menos que una pantalla rota en el stand.
 */
export function equiposDePerfil(
  perfil: PerfilFeria,
  catalogo: EquipoCatalogo[]
): EquipoSeleccionado[] {
  const porNombre = new Map(catalogo.map((e) => [normalizar(e.nombre), e]))

  return perfil.equipos.flatMap((item) => {
    const equipo = porNombre.get(normalizar(item.nombre))
    if (!equipo) return []

    return [
      {
        ...equipo,
        cantidad: item.cantidad,
        horas_uso_dia: item.horas ?? equipo.horas_uso_dia,
      },
    ]
  })
}

/**
 * Traduce un equipo del catálogo a la entrada que espera `dimensionarSistema`.
 * Las horas de uso y el factor de arranque se completan con los defaults del
 * motor de dimensionamiento cuando el backend los manda vacíos.
 */
export function aEquipoCalculo(equipo: EquipoSeleccionado): EquipoCalculo {
  const tipo = equipo.tipo_carga ?? inferirTipoCarga(equipo.nombre)

  return {
    potencia_kw: equipo.potencia_kw,
    energia_kwh: equipo.energia_kwh,
    horas_uso_dia: equipo.horas_uso_dia ?? horasUsoPorDefecto(equipo.categoria),
    factor_arranque: equipo.factor_arranque ?? factorArranquePorDefecto(tipo),
    cantidad: equipo.cantidad,
  }
}
