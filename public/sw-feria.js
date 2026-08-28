/**
 * Service worker del stand de feria (`/feria`).
 *
 * Existe por una sola razón: en la playa de Varadero no hay red. El ritual del
 * stand es abrir `/feria` una vez a las 8:30 con el wifi del hotel y que a
 * partir de ahí la herramienta funcione en modo avión durante todo el día.
 *
 * Alcance: se registra con scope `/feria`, así que **solo controla esa página**.
 * El resto de suncarsrl.com no pasa por acá. Para que ese scope sea válido, la
 * cabecera `Service-Worker-Allowed: /feria` se agrega en `next.config.mjs`.
 *
 * Estrategias, una por tipo de pedido:
 *
 * - Navegación → red primero, caché si falla. Con wifi siempre trae la versión
 *   nueva; sin red abre igual.
 * - `/_next/static/*` → caché primero. Llevan hash en el nombre: si el nombre
 *   es el mismo, el contenido es el mismo.
 * - Catálogos (`/api/feria/equipos` y `/api/feria/kits`) → red primero y se
 *   guarda la respuesta. Así los precios del día se actualizan al abrir y
 *   quedan disponibles sin red.
 * - Login y alta de leads son POST y no se tocan: sin red tienen que fallar
 *   para que la cola de IndexedDB haga su trabajo.
 *
 * Al subir una versión nueva del sitio hay que **subir `VERSION`**: es lo que
 * borra la caché vieja.
 */

const VERSION = "feria-v3"
const CACHE = `suncar-${VERSION}`

/**
 * En `next dev` los chunks NO llevan hash estable: la misma URL puede devolver
 * código distinto en cada recompilación. Servirlos desde caché dejaría la
 * pantalla congelada en una versión vieja durante horas de trabajo. En local se
 * pide siempre a la red y la caché queda solo como respaldo para poder probar
 * el modo avión.
 */
const EN_LOCAL =
  self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1"

/**
 * Lo mínimo para que la página abra sin red.
 * `/api/feria/contacto` está acá porque sin el número de la empresa no se puede
 * armar el QR de WhatsApp, que es lo último que hace el comercial con cada
 * visitante.
 */
const ESENCIALES = [
  "/feria",
  "/api/feria/equipos",
  "/api/feria/kits",
  "/api/feria/contacto",
]

const CATALOGOS = ["/api/feria/equipos", "/api/feria/kits", "/api/feria/contacto"]

/** Guarda una lista de URLs sin que una sola falla tire abajo el resto. */
async function guardarTodo(urls) {
  const cache = await caches.open(CACHE)

  const resultados = await Promise.allSettled(
    urls.map(async (url) => {
      const respuesta = await fetch(url, { cache: "no-store" })
      if (!respuesta.ok) throw new Error(`${url}: ${respuesta.status}`)
      await cache.put(url, respuesta)
    })
  )

  return resultados.filter((resultado) => resultado.status === "fulfilled").length
}

self.addEventListener("install", (evento) => {
  // No se espera a que el comercial cierre la pestaña: si abrió con wifi, la
  // versión nueva tiene que quedar activa ya.
  self.skipWaiting()
  evento.waitUntil(guardarTodo(ESENCIALES))
})

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    (async () => {
      const nombres = await caches.keys()
      await Promise.all(
        nombres
          .filter((nombre) => nombre.startsWith("suncar-feria") && nombre !== CACHE)
          .map((nombre) => caches.delete(nombre))
      )
      await self.clients.claim()
    })()
  )
})

/**
 * Next manda `Vary` en el HTML (RSC, router state). Sin `ignoreVary` la caché
 * solo devolvería el documento si las cabeceras del pedido coinciden exacto, y
 * un detalle así se descubre en la playa, sin red y sin forma de depurar.
 */
const SIN_VARY = { ignoreVary: true }

/** Red primero; si no hay, lo último que se guardó. */
async function redPrimero(pedido, alternativa) {
  const cache = await caches.open(CACHE)

  try {
    const respuesta = await fetch(pedido)
    if (respuesta.ok) cache.put(pedido, respuesta.clone())
    return respuesta
  } catch (error) {
    const guardada = await cache.match(pedido, SIN_VARY)
    if (guardada) return guardada
    if (alternativa) {
      const respaldo = await cache.match(alternativa, SIN_VARY)
      if (respaldo) return respaldo
    }
    throw error
  }
}

/** Caché primero: para los archivos con hash en el nombre. */
async function cachePrimero(pedido) {
  const cache = await caches.open(CACHE)
  const guardada = await cache.match(pedido, SIN_VARY)
  if (guardada) return guardada

  const respuesta = await fetch(pedido)
  if (respuesta.ok) cache.put(pedido, respuesta.clone())
  return respuesta
}

self.addEventListener("fetch", (evento) => {
  const pedido = evento.request

  // Los POST (login, alta de leads) van derecho a la red. Sin red fallan, que
  // es exactamente lo que la cola espera para reintentarlos después.
  if (pedido.method !== "GET") return

  const url = new URL(pedido.url)

  // Las fotos de los kits son de otro origen (S3). Se sirven de la caché si
  // están guardadas; si no, se deja pasar el pedido tal cual y la tarjeta se
  // muestra sin miniatura.
  if (url.origin !== self.location.origin) {
    if (pedido.destination === "image") {
      evento.respondWith(
        caches.open(CACHE).then((cache) =>
          cache.match(pedido, SIN_VARY).then((guardada) => guardada || fetch(pedido))
        )
      )
    }
    return
  }

  if (pedido.mode === "navigate") {
    evento.respondWith(redPrimero(pedido, "/feria"))
    return
  }

  if (url.pathname.startsWith("/_next/static/")) {
    evento.respondWith(EN_LOCAL ? redPrimero(pedido) : cachePrimero(pedido))
    return
  }

  if (CATALOGOS.includes(url.pathname)) {
    evento.respondWith(redPrimero(pedido))
    return
  }

  // Resto de lo que pide la página (íconos, fuentes): sirve lo guardado y si no
  // lo tiene lo busca y lo guarda.
  evento.respondWith(cachePrimero(pedido))
})

/**
 * La página avisa qué recursos cargó de verdad.
 *
 * Los chunks de Next llevan hash y cambian en cada build, así que no se pueden
 * escribir en una lista fija. Pero la página sí sabe cuáles pidió: los lee del
 * Performance API y los manda por acá. Con eso, **una sola visita con wifi
 * alcanza** para que todo quede en caché — que es justo el ritual de las 8:30.
 */
self.addEventListener("message", (evento) => {
  const datos = evento.data

  if (datos?.tipo === "precachear") {
    evento.waitUntil(
      (async () => {
        const guardados = await guardarTodo([...ESENCIALES, ...(datos.urls || [])])
        evento.source?.postMessage({ tipo: "precacheado", recursos: guardados })
      })()
    )
  }

  /**
   * Fotos de los kits. Viven en S3, o sea otro origen, así que se piden en
   * `no-cors`: la respuesta es opaca (no se puede leer desde JS) pero sirve
   * perfectamente para pintar un <img>, que es todo lo que hace falta.
   */
  if (datos?.tipo === "fotos") {
    evento.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE)
        await Promise.allSettled(
          (datos.urls || []).map(async (url) => {
            if (await cache.match(url)) return
            const respuesta = await fetch(url, { mode: "no-cors" })
            await cache.put(url, respuesta)
          })
        )
      })()
    )
  }

  if (datos?.tipo === "estado") {
    evento.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE)
        const claves = await cache.keys()
        const pagina = await cache.match("/feria", SIN_VARY)
        evento.source?.postMessage({
          tipo: "estado",
          recursos: claves.length,
          listo: Boolean(pagina),
        })
      })()
    )
  }
})
