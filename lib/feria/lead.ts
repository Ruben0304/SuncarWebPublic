/**
 * Armado del lead que captura el stand.
 *
 * Lo que hace útil a un lead de feria es el comentario: el lunes, quien llame
 * tiene que poder retomar la conversación sin haber estado en Varadero. Por eso
 * el cálculo completo viaja escrito en texto plano.
 *
 * Contrastado contra `presentation/schemas/requests/LeadCreateRequest.py`:
 * `fecha_contacto`, `nombre`, `telefono` y `estado` son obligatorios; el
 * comentario topa en 2000 caracteres; `prioridad` es un enum cerrado.
 */

import type { KitFeria, KitMatch } from "@/lib/feria/kits"
import type { EquipoSeleccionado } from "@/lib/feria/perfiles"
import type { SesionFeria } from "@/lib/feria/sesion"
import type { ResultadoDimensionamiento } from "@/lib/solar/dimensionamiento"

/**
 * Nombre exacto de la fuente que hay que crear en el admin (Bloque 0 del plan).
 * Si no coincide letra por letra, el lunes el filtro por fuente no encuentra
 * nada y no hay forma de medir el retorno del patrocinio.
 */
export const FUENTE_FERIA = "Feria Varadero 2026"

/**
 * Estado con el que entra un lead del stand.
 *
 * Sale de la lista que ofrece el admin al crear un lead
 * (`components/feats/leads/create-lead-dialog.tsx`): ahí no existe un estado
 * "nuevo", y de esa lista "Revisando ofertas" es lo que efectivamente pasó en
 * el stand —el visitante vio kits con precio— y además es el estado más usado
 * de la base.
 */
export const ESTADO_INICIAL = "Revisando ofertas"

/**
 * Estado que dispara la creación automática de una visita en el backend
 * (`application/services/leads_service.py`). La comparación allá es por string
 * exacto: cualquier variante ("Pendiente de Visita") no crea nada.
 */
export const ESTADO_VISITA = "Pendiente de visita"

/** Tope del campo `comentario` en el backend. */
const MAX_COMENTARIO = 2000

/** El backend exige `^\+?\d{6,15}$`: solo dígitos y un "+" opcional al inicio. */
const RE_TELEFONO = /^\+?\d{6,15}$/

/**
 * Provincias de Cuba con el nombre exacto que usa el backend
 * (`application/services/codigos_geograficos.py`).
 *
 * Va como lista fija y no desde `/api/provincias/` por dos razones: ese
 * endpoint exige token y, sobre todo, el stand trabaja sin red. Son 16 y no
 * cambian.
 */
export const PROVINCIAS = [
  "Pinar del Río",
  "Artemisa",
  "La Habana",
  "Mayabeque",
  "Matanzas",
  "Villa Clara",
  "Cienfuegos",
  "Sancti Spíritus",
  "Ciego de Ávila",
  "Camagüey",
  "Las Tunas",
  "Holguín",
  "Granma",
  "Santiago de Cuba",
  "Guantánamo",
  "Isla de la Juventud",
] as const

export interface DatosLead {
  nombre: string
  telefono: string
  /** Provincia de montaje. Vacío = no la dijo. */
  provincia: string
  /** Dirección o zona, en texto libre. */
  direccion: string
  /** `true` cuando el comercial marcó que hay que ir a verlo. */
  pendienteVisita: boolean
}

export interface ContextoLead {
  sesion: SesionFeria
  resultado: ResultadoDimensionamiento
  equipos: EquipoSeleccionado[]
  horas: number
  /** El kit que se le mostró, si alguno lo cubría. */
  kit: KitMatch | null
  /** Base ampliable, para el caso hostal donde ningún kit alcanza. */
  base: { kit: KitFeria; bateriasFaltantes: number; panelesFaltantes: number } | null
  /** Momento de la captura. Se pasa explícito para que sea el mismo en todo el lead. */
  cuando: Date
}

/**
 * Deja el teléfono como lo quiere el backend.
 *
 * En el stand se limpia en vez de rechazar, igual que hace la integración de
 * Chatwoot (`telefono_validators.py`): el comercial va a escribir "5 266 17 89"
 * o "+53 5266-1789" con dedos gordos y sol de frente, y perder el lead por un
 * espacio sería absurdo. Lo que no se puede salvar —letras, un número corto—
 * sí se rechaza, y ahí el comercial lo corrige con el cliente delante.
 */
export function normalizarTelefono(valor: string): string {
  const limpio = valor.trim()
  const tienePlus = limpio.startsWith("+")
  const digitos = limpio.replace(/\D/g, "")
  return digitos ? `${tienePlus ? "+" : ""}${digitos}` : ""
}

export function telefonoValido(valor: string): boolean {
  return RE_TELEFONO.test(normalizarTelefono(valor))
}

/** "29/08/2026" — el formato que escribe el admin y que el backend parsea. */
export function fechaContacto(cuando: Date): string {
  const dia = String(cuando.getDate()).padStart(2, "0")
  const mes = String(cuando.getMonth() + 1).padStart(2, "0")
  return `${dia}/${mes}/${cuando.getFullYear()}`
}

/** "sáb 29/08 14:30" — para firmar el comentario. */
function selloTemporal(cuando: Date): string {
  const dia = cuando.toLocaleDateString("es-ES", { weekday: "short" })
  const fecha = `${String(cuando.getDate()).padStart(2, "0")}/${String(
    cuando.getMonth() + 1
  ).padStart(2, "0")}`
  const hora = cuando.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
  return `${dia} ${fecha} ${hora}`
}

/** Un decimal, con punto: el comentario lo lee gente distinta en pantallas distintas. */
function n1(valor: number): string {
  return valor.toFixed(1)
}

/** "2 aires, nevera, bomba" — sin los paréntesis técnicos del catálogo. */
function listaEquipos(equipos: EquipoSeleccionado[]): string {
  return equipos
    .filter((equipo) => equipo.cantidad > 0)
    .map((equipo) => {
      const nombre = equipo.nombre.replace(/\s*\([^)]*\)/g, "").trim()
      return equipo.cantidad > 1 ? `${equipo.cantidad} ${nombre}` : nombre
    })
    .join(", ")
}

/**
 * El texto que va a leer quien llame el lunes.
 *
 * Formato fijo, empezando por `[FERIA VARADERO]` para que se reconozca de un
 * vistazo en la lista de leads del admin.
 */
export function construirComentario(contexto: ContextoLead): string {
  const { resultado, equipos, horas, kit, base, sesion, cuando } = contexto

  const lineas = [
    `[FERIA VARADERO] Consumo ${n1(resultado.energiaDiaKwh)} kWh/día · pico ${n1(
      resultado.potenciaPicoKw
    )} kW`,
    `Sistema: inversor ${n1(resultado.inversorKva)} kVA · baterías ${n1(
      resultado.bateriaBancoKwh
    )} kWh · ${resultado.numeroPaneles} paneles · ${horas}h autonomía`,
  ]

  if (kit) {
    lineas.push(
      `Kit sugerido: ${kit.kit.resumen} — $${Math.round(
        kit.kit.precio
      ).toLocaleString("en-US")} ${kit.kit.moneda}`
    )
  } else if (base) {
    const extras = [
      base.bateriasFaltantes > 0
        ? `+${base.bateriasFaltantes} batería${base.bateriasFaltantes > 1 ? "s" : ""}`
        : "",
      base.panelesFaltantes > 0
        ? `+${base.panelesFaltantes} panel${base.panelesFaltantes > 1 ? "es" : ""}`
        : "",
    ]
      .filter(Boolean)
      .join(" y ")

    lineas.push(
      `NINGÚN KIT LO CUBRE. Base: ${base.kit.resumen} — $${Math.round(
        base.kit.precio
      ).toLocaleString("en-US")} ${base.kit.moneda}`,
      `Ampliación necesaria: ${extras}`
    )
  } else {
    lineas.push("Ningún kit del catálogo cubre este consumo: cotizar a medida.")
  }

  lineas.push(
    `Equipos: ${listaEquipos(equipos)}`,
    `Atendió: ${sesion.nombre} · ${selloTemporal(cuando)}`
  )

  return lineas.join("\n").slice(0, MAX_COMENTARIO)
}

/** El cuerpo tal cual lo espera `POST /api/leads/`. */
export interface CuerpoLead {
  fecha_contacto: string
  nombre: string
  telefono: string
  estado: string
  fuente: string
  fuente_referencia: string
  comercial: string
  prioridad: "Ninguna" | "Baja" | "Media" | "Alta" | "Urgente"
  comentario: string
  /** Provincia de montaje: es el filtro con el que se reparten los leads. */
  provincia_montaje?: string
  direccion?: string
  /** Todos los leads del stand son de Cuba; el admin filtra por este campo. */
  pais_contacto: string
}

/**
 * Arma el lead listo para encolar.
 *
 * `fuente`, `fuente_referencia` y `comercial` salen del token, no de la
 * pantalla: nadie escribe a mano quién atendió. `fuente_referencia` va con el
 * nombre legible del trabajador, que es como lo guarda el admin
 * (`components/feats/leads/fuente-selector.tsx`).
 *
 * La prioridad se deriva del estado: si el comercial se jugó a pedir una visita
 * es porque el cliente vale la pena, y el lunes esa es la lista por la que hay
 * que empezar a llamar.
 */
export function armarLead(datos: DatosLead, contexto: ContextoLead): CuerpoLead {
  const estado = datos.pendienteVisita ? ESTADO_VISITA : ESTADO_INICIAL

  return {
    fecha_contacto: fechaContacto(contexto.cuando),
    nombre: datos.nombre.trim(),
    telefono: normalizarTelefono(datos.telefono),
    estado,
    fuente: FUENTE_FERIA,
    fuente_referencia: contexto.sesion.nombre,
    comercial: contexto.sesion.nombre,
    prioridad: datos.pendienteVisita ? "Alta" : "Media",
    comentario: construirComentario(contexto),
    // Los opcionales solo viajan si el comercial los llenó: mandar cadenas
    // vacías ensucia el listado del admin sin aportar nada.
    ...(datos.provincia ? { provincia_montaje: datos.provincia } : {}),
    ...(datos.direccion.trim() ? { direccion: datos.direccion.trim() } : {}),
    pais_contacto: "Cuba",
  }
}
