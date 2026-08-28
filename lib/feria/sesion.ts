/**
 * Sesión del comercial en el stand de feria.
 *
 * El login se hace una sola vez, con wifi del hotel, contra el mismo endpoint
 * que usa el admin (`POST /api/auth/login-admin`). Después el token vive en
 * localStorage y el stand funciona sin red hasta que el token vence.
 *
 * Cuánto dura el token NO se asume: se lee del claim `exp` del propio JWT. El
 * backend usa `JWT_EXPIRATION_MINUTES`, que por defecto son 60 minutos y en
 * Railway está puesto en 10080 (7 días). Si esa variable se cayera, el stand
 * tiene que enterarse mostrando "vence hoy", no descubrirlo en la playa.
 */

/** Lo que el stand guarda de una sesión abierta. */
export interface SesionFeria {
  token: string
  ci: string
  nombre: string
  rol: string
  /** Vencimiento del token en milisegundos epoch (claim `exp` × 1000). */
  expiraEn: number
}

/** Claims que el backend firma en el token (`application/services/auth_service.py`). */
interface PayloadJwt {
  ci?: string
  nombre?: string
  rol?: string
  exp?: number
}

const CLAVE_ALMACEN = "feria:sesion"

/**
 * Decodifica el payload de un JWT sin verificar la firma.
 *
 * No hace falta verificarla en el cliente: el token se usa como credencial
 * contra el backend, que sí la valida. Acá solo se leen el nombre —para
 * mostrarlo y para firmar el lead— y el vencimiento.
 */
function leerPayload(token: string): PayloadJwt | null {
  try {
    const parte = token.split(".")[1]
    if (!parte) return null

    const base64 = parte.replace(/-/g, "+").replace(/_/g, "/")
    const relleno = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")

    // atob devuelve bytes crudos: hay que decodificarlos como UTF-8 o los
    // nombres con acento ("Fabián") llegan rotos.
    const binario = atob(relleno)
    const bytes = Uint8Array.from(binario, (caracter) => caracter.charCodeAt(0))

    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}

/** Arma la sesión a partir del token del backend. `null` si el token no sirve. */
export function aSesion(token: string): SesionFeria | null {
  const payload = leerPayload(token)
  if (!payload?.exp || !payload.ci) return null

  return {
    token,
    ci: payload.ci,
    nombre: payload.nombre || payload.ci,
    rol: payload.rol || "no definido",
    expiraEn: payload.exp * 1000,
  }
}

export function guardarSesion(sesion: SesionFeria): void {
  try {
    localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(sesion))
  } catch {
    // Modo privado o almacenamiento lleno: la sesión vive solo en memoria.
  }
}

/**
 * Lee la sesión guardada. Devuelve `null` si no hay, si está corrupta o si el
 * token ya venció: un token vencido es lo mismo que no tener sesión, y dejarlo
 * en el almacén solo sirve para que el próximo intento falle igual.
 */
export function leerSesion(): SesionFeria | null {
  try {
    const crudo = localStorage.getItem(CLAVE_ALMACEN)
    if (!crudo) return null

    const sesion: SesionFeria = JSON.parse(crudo)
    if (!sesion?.token || !sesion.expiraEn) return null

    if (sesion.expiraEn <= Date.now()) {
      cerrarSesion()
      return null
    }

    return sesion
  } catch {
    return null
  }
}

export function cerrarSesion(): void {
  try {
    localStorage.removeItem(CLAVE_ALMACEN)
  } catch {
    // Nada que limpiar.
  }
}

/**
 * Días enteros que le quedan al token, redondeando hacia arriba: si vence en
 * 30 horas quedan 2 días, no 1. El comercial necesita saber si llega al final
 * de la feria, no la cuenta exacta.
 */
export function diasRestantes(sesion: SesionFeria, ahora = Date.now()): number {
  return Math.max(0, Math.ceil((sesion.expiraEn - ahora) / 86_400_000))
}

/** "mar 3 sept" — la fecha en que el comercial se queda sin sesión. */
export function fechaVencimiento(sesion: SesionFeria): string {
  return new Date(sesion.expiraEn).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}
