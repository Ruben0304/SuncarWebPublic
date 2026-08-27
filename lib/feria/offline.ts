/**
 * Registro y precarga del service worker del stand.
 *
 * El problema que resuelve el precacheo dirigido: los chunks de Next llevan un
 * hash en el nombre que cambia en cada build, así que no se pueden escribir en
 * una lista fija dentro del worker. Pero la página **sí sabe** cuáles cargó —el
 * Performance API los tiene— y se los pasa al worker por `postMessage`.
 *
 * Gracias a eso una sola visita con wifi deja todo listo, que es exactamente el
 * ritual de las 8:30 del guion del stand: abrir `/feria` una vez y guardar la
 * tablet.
 */

export interface EstadoOffline {
  /**
   * `esperando` mientras se registra el worker, `descargando` mientras guarda
   * y `listo` cuando la tablet ya abre sin red. `fallo` si no se pudo.
   */
  fase: "esperando" | "descargando" | "listo" | "fallo"
  /** Cuántos recursos hay en la caché. Sirve para saber si algo quedó afuera. */
  recursos: number
}

export const OFFLINE_INICIAL: EstadoOffline = { fase: "esperando", recursos: 0 }

const RUTA_WORKER = "/sw-feria.js"
const ALCANCE = "/feria"

/** Espera a que la página termine de cargar antes de mirar qué pidió. */
function alTerminarDeCargar(): Promise<void> {
  if (document.readyState === "complete") return Promise.resolve()
  return new Promise((resolver) => window.addEventListener("load", () => resolver(), { once: true }))
}

/**
 * URLs que la página cargó de verdad: chunks, CSS, fuentes e íconos.
 *
 * Se excluyen los endpoints con efectos (login y alta de leads) y el socket de
 * recarga en caliente de `next dev`, que no tienen nada que hacer en una caché.
 */
function recursosCargados(): string[] {
  const entradas = performance.getEntriesByType("resource") as PerformanceResourceTiming[]

  const urls = entradas
    .map((entrada) => entrada.name)
    .filter((url) => url.startsWith(window.location.origin))
    .filter((url) => !url.includes("/api/feria/login"))
    .filter((url) => !url.includes("/api/feria/leads"))
    .filter((url) => !url.includes("webpack-hmr"))

  return Array.from(new Set(urls))
}

/**
 * Registra el worker y le pide que guarde todo lo que la página usó.
 *
 * Devuelve una función para desmontar el listener. Si el navegador no soporta
 * service workers, o si el registro falla, no rompe nada: el stand sigue
 * funcionando, solo que necesitando red.
 */
export function prepararOffline(alCambiarEstado: (estado: EstadoOffline) => void): () => void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return () => undefined
  }

  const alRecibirMensaje = (evento: MessageEvent) => {
    const datos = evento.data
    if (datos?.tipo === "precacheado") {
      alCambiarEstado({
        fase: datos.recursos > 0 ? "listo" : "fallo",
        recursos: datos.recursos ?? 0,
      })
    }
    if (datos?.tipo === "estado") {
      alCambiarEstado({ fase: datos.listo ? "listo" : "fallo", recursos: datos.recursos ?? 0 })
    }
  }

  navigator.serviceWorker.addEventListener("message", alRecibirMensaje)

  ;(async () => {
    try {
      await navigator.serviceWorker.register(RUTA_WORKER, { scope: ALCANCE })
      const registro = await navigator.serviceWorker.ready

      // Antes de listar recursos hay que dejar que la página termine: si se
      // mide demasiado pronto, faltan las fuentes y algún chunk tardío.
      await alTerminarDeCargar()

      const worker = registro.active
      if (!worker) return

      // A partir de acá el worker está bajando cosas: el comercial ve la barra
      // en vez de un check que aparece de la nada.
      alCambiarEstado({ fase: "descargando", recursos: 0 })
      worker.postMessage({ tipo: "precachear", urls: recursosCargados() })
    } catch (error) {
      // El caso típico es que falte la cabecera `Service-Worker-Allowed`, que
      // es lo que habilita el scope acotado a /feria.
      console.error("No se pudo preparar el modo sin red:", error)
      alCambiarEstado({ fase: "fallo", recursos: 0 })
    }
  })()

  return () => navigator.serviceWorker.removeEventListener("message", alRecibirMensaje)
}

/**
 * Guarda las fotos de los kits para que se vean sin red.
 *
 * Van aparte del precacheo general porque viven en S3 —otro origen— y porque
 * solo se conocen cuando ya llegó el catálogo. Es el mejor esfuerzo: si alguna
 * falla, la tarjeta del kit se muestra igual sin miniatura.
 */
export function guardarFotos(urls: string[]): void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return
  if (urls.length === 0) return

  navigator.serviceWorker.ready
    .then((registro) => registro.active?.postMessage({ tipo: "fotos", urls }))
    .catch(() => undefined)
}
