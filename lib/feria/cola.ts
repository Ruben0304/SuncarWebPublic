/**
 * Cola de leads del stand, en IndexedDB.
 *
 * Regla del stand: **guardar nunca falla**. El lead se escribe en disco antes
 * de intentar mandarlo, así que da igual si en ese momento hay wifi, si el
 * hotel se cayó o si la tablet está en modo avión. El envío es un intento
 * aparte que se repite hasta que sale.
 *
 * IndexedDB y no localStorage porque esto tiene que sobrevivir a que el
 * navegador se quede sin memoria y cierre la pestaña con 40 leads adentro.
 *
 * Sin librerías: son cuatro operaciones y una dependencia nueva en la semana
 * de la feria es riesgo sin beneficio.
 */

import type { CuerpoLead } from "@/lib/feria/lead"

const NOMBRE_DB = "suncar-feria"
const VERSION_DB = 1
const ALMACEN = "leads-pendientes"

/** Un lead esperando salir. */
export interface LeadEncolado {
  id: number
  cuerpo: CuerpoLead
  creadoEn: number
  intentos: number
  /** Último error del backend. Es lo que se le muestra al comercial si algo traba. */
  ultimoError?: string
}

function abrirDb(): Promise<IDBDatabase> {
  return new Promise((resolver, rechazar) => {
    const solicitud = indexedDB.open(NOMBRE_DB, VERSION_DB)

    solicitud.onupgradeneeded = () => {
      const db = solicitud.result
      if (!db.objectStoreNames.contains(ALMACEN)) {
        db.createObjectStore(ALMACEN, { keyPath: "id", autoIncrement: true })
      }
    }

    solicitud.onsuccess = () => resolver(solicitud.result)
    solicitud.onerror = () => rechazar(solicitud.error)
  })
}

/** Envuelve una operación sobre el almacén en su transacción. */
async function conAlmacen<T>(
  modo: IDBTransactionMode,
  operacion: (almacen: IDBObjectStore) => IDBRequest
): Promise<T> {
  const db = await abrirDb()

  try {
    return await new Promise<T>((resolver, rechazar) => {
      const transaccion = db.transaction(ALMACEN, modo)
      const solicitud = operacion(transaccion.objectStore(ALMACEN))

      solicitud.onsuccess = () => resolver(solicitud.result as T)
      solicitud.onerror = () => rechazar(solicitud.error)
    })
  } finally {
    db.close()
  }
}

/** Mete el lead en la cola. Devuelve su id. */
export function encolarLead(cuerpo: CuerpoLead): Promise<number> {
  return conAlmacen<number>("readwrite", (almacen) =>
    almacen.add({ cuerpo, creadoEn: Date.now(), intentos: 0 })
  )
}

/** Todos los leads que todavía no salieron, del más viejo al más nuevo. */
export async function leerPendientes(): Promise<LeadEncolado[]> {
  const todos = await conAlmacen<LeadEncolado[]>("readonly", (almacen) => almacen.getAll())
  return todos.sort((a, b) => a.creadoEn - b.creadoEn)
}

export function contarPendientes(): Promise<number> {
  return conAlmacen<number>("readonly", (almacen) => almacen.count())
}

/** Saca el lead de la cola: ya está en el servidor. */
export function borrarLead(id: number): Promise<void> {
  return conAlmacen<void>("readwrite", (almacen) => almacen.delete(id))
}

/**
 * Anota que un intento falló. El lead **no** se descarta: en el stand es
 * preferible reintentar diez veces que perder un contacto.
 */
export async function registrarFallo(id: number, error: string): Promise<void> {
  const lead = await conAlmacen<LeadEncolado | undefined>("readonly", (almacen) =>
    almacen.get(id)
  )
  if (!lead) return

  await conAlmacen<void>("readwrite", (almacen) =>
    almacen.put({ ...lead, intentos: lead.intentos + 1, ultimoError: error })
  )
}

/** Resultado de una pasada de sincronización. */
export interface ResultadoSincronizacion {
  enviados: number
  pendientes: number
  /** `true` si el backend rechazó el token: hay que volver a entrar. */
  sesionVencida: boolean
}

/**
 * Intenta vaciar la cola contra el backend.
 *
 * Se llama al entrar, cada vez que vuelve la red, después de guardar un lead y
 * cuando el comercial aprieta "reintentar". Es idempotente y no hace nada si la
 * cola está vacía.
 */
export async function sincronizarCola(token: string): Promise<ResultadoSincronizacion> {
  const pendientes = await leerPendientes()
  let enviados = 0

  for (const lead of pendientes) {
    try {
      const respuesta = await fetch("/api/feria/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(lead.cuerpo),
      })

      // Token vencido o revocado: no tiene sentido seguir intentando con los
      // demás, y el comercial tiene que volver a entrar. Los leads se quedan.
      if (respuesta.status === 401 || respuesta.status === 403) {
        return {
          enviados,
          pendientes: await contarPendientes(),
          sesionVencida: true,
        }
      }

      const datos = await respuesta.json().catch(() => null)

      if (respuesta.ok && datos?.success !== false) {
        await borrarLead(lead.id)
        enviados += 1
      } else {
        await registrarFallo(lead.id, datos?.message || `Error ${respuesta.status}`)
      }
    } catch {
      // Sin red: se corta la pasada entera, no tiene sentido intentar el resto.
      await registrarFallo(lead.id, "Sin conexión")
      break
    }
  }

  return { enviados, pendientes: await contarPendientes(), sesionVencida: false }
}
