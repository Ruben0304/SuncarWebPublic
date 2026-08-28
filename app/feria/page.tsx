"use client"

/**
 * `/feria` — herramienta del stand de SunCar en Varadero (28–30 agosto 2026).
 *
 * La usa un comercial en una tablet, al sol, con 90 segundos por visitante y sin
 * internet confiable. De ahí las decisiones de esta pantalla:
 *
 * - Tres pasos y ni uno más: perfil → apagón → resultado.
 * - Nada de scroll de página: cada paso ocupa exactamente el alto de pantalla y
 *   solo scrollean las listas internas.
 * - Botones de 64 px, números enormes y alto contraste (texto oscuro sobre
 *   fondo claro, que es lo que se lee bajo sol directo).
 * - El slider de autonomía ocupa media pantalla: ver crecer el banco de
 *   baterías al mover "8 horas de apagón" es el gancho de venta, no el ahorro.
 *
 * El cálculo lo hace `dimensionarSistema` (lib/solar/dimensionamiento.ts), que
 * es el motor ya validado y no se toca. El match contra el catálogo real lo
 * hace `lib/feria/kits.ts`.
 *
 * Paleta de marca (la de `tailwind.config.ts`, no la naranja/azul vieja):
 *   #012928  Emerald Circuit  — texto y superficies oscuras
 *   #AFEB17  Volt Green       — acento vivo
 *   #F2C300  Solar Radiance   — acento cálido
 *   #0A052D  Midnight Voltage — bloques de "esto no entra en catálogo"
 *   #F2F2EF  fondo de la web
 * Sobre el degradado volt→solar el texto va en #012928, nunca en blanco: son
 * dos colores muy luminosos y al sol el blanco encima desaparece.
 */

import { useEffect, useMemo, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  Building2,
  Check,
  CheckCircle2,
  CloudOff,
  Home,
  QrCode,
  Loader2,
  LogOut,
  Minus,
  Plus,
  RefreshCw,
  RotateCcw,
  Snowflake,
  Sun,
  UserPlus,
  X,
  Zap,
} from "lucide-react"

import {
  contarPendientes,
  encolarLead,
  leerPendientes,
  sincronizarCola,
  type LeadEncolado,
} from "@/lib/feria/cola"
import {
  armarLead,
  normalizarTelefono,
  PROVINCIAS,
  telefonoValido,
  type ContextoLead,
} from "@/lib/feria/lead"
import {
  guardarFotos,
  OFFLINE_INICIAL,
  prepararOffline,
  type EstadoOffline,
} from "@/lib/feria/offline"
import { construirResumen, enlaceWhatsapp, type ContextoResumen } from "@/lib/feria/whatsapp"
import {
  aKitFeria,
  matchKits,
  mejorBaseAmpliable,
  type Ampliacion,
  type EtiquetaKit,
  type KitFeria,
  type KitMatch,
} from "@/lib/feria/kits"
import {
  aEquipoCalculo,
  aplanarCatalogo,
  equiposDePerfil,
  HORAS_AUTONOMIA_DEFAULT,
  PERFILES,
  type EquipoCatalogo,
  type EquipoSeleccionado,
  type PerfilFeria,
  type PerfilId,
} from "@/lib/feria/perfiles"
import {
  aSesion,
  cerrarSesion,
  diasRestantes,
  fechaVencimiento,
  guardarSesion,
  leerSesion,
  type SesionFeria,
} from "@/lib/feria/sesion"
import { dimensionarSistema } from "@/lib/solar/dimensionamiento"

/**
 * Los kits del catálogo se arman con paneles de 600 W. Contar los paneles con
 * los 550 W que trae el motor por defecto daría un número que no coincide con
 * lo que el comercial tiene en la lista de precios.
 */
const POTENCIA_PANEL_KWP = 0.6

/** Topes del slider de apagón. 24 h existe: en Cuba pasa. */
const HORAS_MIN = 2
const HORAS_MAX = 24
const HORAS_ATAJO = [4, 8, 12, 24]

const ICONO_PERFIL: Record<PerfilId, typeof Home> = {
  casa: Home,
  "casa-aires": Snowflake,
  negocio: Building2,
}

const ESTILO_ETIQUETA: Record<EtiquetaKit, { texto: string; clase: string }> = {
  ajustado: { texto: "A la medida", clase: "bg-[#AFEB17] text-[#012928] border-[#012928]/20" },
  holgado: { texto: "Con margen", clase: "bg-[#F2C300]/30 text-[#012928] border-[#F2C300]" },
  "solo-respaldo": {
    texto: "Solo respaldo",
    clase: "bg-[#012928]/10 text-[#012928]/70 border-[#012928]/20",
  },
  insuficiente: { texto: "Insuficiente", clase: "bg-red-100 text-red-800 border-red-300" },
}

/** Un decimal, con coma, como se escriben los números en español. */
function num(valor: number, decimales = 1): string {
  return valor.toLocaleString("es-ES", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

/** Precios en formato de lista: $8,420. */
function precio(valor: number): string {
  return `$${Math.round(valor).toLocaleString("en-US")}`
}

/** Comparador de kits por precio, para ordenar lo que ya se decidió mostrar. */
function porPrecio(a: KitMatch, b: KitMatch): number {
  return a.kit.precio - b.kit.precio
}

export default function FeriaPage() {
  const [catalogo, setCatalogo] = useState<EquipoCatalogo[]>([])
  const [kits, setKits] = useState<KitFeria[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // `undefined` = todavía no se leyó el almacén. La página es estática y
  // localStorage no existe en el prerender, así que la sesión solo se puede
  // mirar en el cliente; hasta entonces no se decide qué pantalla va.
  const [sesion, setSesion] = useState<SesionFeria | null | undefined>(undefined)

  const [paso, setPaso] = useState<1 | 2 | 3>(1)
  const [perfil, setPerfil] = useState<PerfilFeria | null>(null)
  const [equipos, setEquipos] = useState<EquipoSeleccionado[]>([])
  const [horas, setHoras] = useState(HORAS_AUTONOMIA_DEFAULT)
  const [agregando, setAgregando] = useState(false)

  const [capturando, setCapturando] = useState(false)
  const [pendientes, setPendientes] = useState(0)
  const [verCola, setVerCola] = useState(false)
  const [mostrandoQr, setMostrandoQr] = useState(false)
  /** Número de la empresa en formato wa.me (solo dígitos). */
  const [whatsapp, setWhatsapp] = useState("")
  /** El backend rechazó el token. No se expulsa solo: ver `sincronizar`. */
  const [sesionRechazada, setSesionRechazada] = useState(false)
  const [offline, setOffline] = useState<EstadoOffline>(OFFLINE_INICIAL)

  useEffect(() => {
    setSesion(leerSesion())
  }, [])

  // El service worker se prepara aunque no haya sesión: la pantalla de bloqueo
  // también tiene que quedar guardada, o el comercial que abra la tablet sin red
  // ni siquiera puede entrar.
  useEffect(() => prepararOffline(setOffline), [])

  // El número de la empresa se pide aparte: si falla, el stand sigue calculando
  // y capturando leads, solo se queda sin el QR de WhatsApp. No es motivo para
  // dejar al comercial con una pantalla de error.
  useEffect(() => {
    let vivo = true

    fetch("/api/feria/contacto")
      .then((respuesta) => respuesta.json())
      .then((datos) => {
        if (vivo && datos?.success) setWhatsapp(datos.data?.whatsapp || "")
      })
      .catch(() => undefined)

    return () => {
      vivo = false
    }
  }, [])

  useEffect(() => {
    let vivo = true

    async function cargar() {
      try {
        const [respEquipos, respKits] = await Promise.all([
          fetch("/api/feria/equipos"),
          fetch("/api/feria/kits"),
        ])

        const datosEquipos = await respEquipos.json()
        const datosKits = await respKits.json()
        if (!vivo) return

        if (!datosEquipos?.success || !datosKits?.success) {
          setError("El servidor no devolvió el catálogo. Probá de nuevo con red.")
          return
        }

        setCatalogo(aplanarCatalogo(datosEquipos.data))

        const listaKits = (Array.isArray(datosKits.data) ? datosKits.data : [])
          .map(aKitFeria)
          .filter((kit: KitFeria | null): kit is KitFeria => kit !== null)
        setKits(listaKits)

        // Las fotos solo se conocen ahora, con el catálogo ya en la mano.
        guardarFotos(
          listaKits
            .map((kit: KitFeria) => kit.fotoUrl)
            .filter((url: string | undefined): url is string => Boolean(url))
        )
      } catch {
        if (vivo) setError("No se pudo cargar el catálogo. Revisá la conexión.")
      } finally {
        if (vivo) setCargando(false)
      }
    }

    cargar()
    return () => {
      vivo = false
    }
  }, [])

  const resultado = useMemo(
    () =>
      dimensionarSistema(equipos.map(aEquipoCalculo), {
        perfil: perfil?.perfilUso ?? "hogar",
        tecnologiaBateria: "litio",
        horasAutonomia: horas,
        potenciaPanelKwp: POTENCIA_PANEL_KWP,
      }),
    [equipos, horas, perfil]
  )

  const hayConsumo = resultado.energiaDiaKwh > 0

  const { cubren, otrasBases, respaldo, base } = useMemo(() => {
    if (!hayConsumo || kits.length === 0) {
      return { cubren: [] as KitMatch[], otrasBases: [] as KitMatch[], respaldo: [] as KitMatch[], base: null }
    }

    const todos = matchKits(resultado, kits)
    const principales = todos.filter((m) => m.etiqueta !== "solo-respaldo")
    const cubren = principales.filter((m) => m.cubrePaneles)
    const base = cubren.length === 0 ? mejorBaseAmpliable(resultado, kits) : null

    return {
      // `matchKits` ordena por qué tan bien calza el kit, que es el criterio
      // correcto para ELEGIR cuáles mostrar. Pero en pantalla, entre kits que
      // ya cubren todo, el cliente lee el precio: dejar uno de $9,800 arriba de
      // uno de $6,950 hace perder la venta. Se eligen los 3 mejores por calce y
      // recién ahí se ordenan por precio.
      cubren: cubren.slice(0, 3).sort(porPrecio),
      otrasBases: principales.filter((m) => m.kit.id !== base?.kit.id).slice(0, 2).sort(porPrecio),
      respaldo: todos
        .filter((m) => m.etiqueta === "solo-respaldo")
        .slice(0, 2)
        .sort(porPrecio),
      base,
    }
  }, [hayConsumo, kits, resultado])

  /** La batería más grande del catálogo, para escalar la barra del apagón. */
  const maxBateriaKits = useMemo(
    () => kits.reduce((max, kit) => Math.max(max, kit.bateriaKwh), 0),
    [kits]
  )

  /** Enlace wa.me con el resumen. Vacío si falta el número o no hay cálculo. */
  const enlaceQr = useMemo(() => {
    if (!sesion || !whatsapp || !hayConsumo) return ""

    const contexto: ContextoResumen = {
      resultado,
      equipos,
      horas,
      kit: cubren[0] ?? null,
      base: base
        ? {
            kit: base.kit,
            bateriasFaltantes: base.ampliacion.bateriasFaltantes,
            panelesFaltantes: base.ampliacion.panelesFaltantes,
          }
        : null,
      sesion,
    }

    return enlaceWhatsapp(whatsapp, construirResumen(contexto))
  }, [sesion, whatsapp, hayConsumo, resultado, equipos, horas, cubren, base])

  function elegirPerfil(elegido: PerfilFeria) {
    setPerfil(elegido)
    setEquipos(equiposDePerfil(elegido, catalogo))
    setPaso(2)
  }

  function ajustarCantidad(nombre: string, delta: number) {
    setEquipos((actuales) =>
      actuales.map((equipo) =>
        equipo.nombre === nombre
          ? { ...equipo, cantidad: Math.max(0, Math.min(99, equipo.cantidad + delta)) }
          : equipo
      )
    )
  }

  /**
   * Lo agregado va al principio de la lista: si quedara al final, el comercial
   * agrega un equipo y no ve nada cambiar salvo el número del banco.
   */
  function agregarEquipo(equipo: EquipoCatalogo) {
    setEquipos((actuales) => {
      // Si el equipo ya estaba, se conserva su entrada: puede traer horas de uso
      // propias del perfil (una nevera trabaja 24 h, no las 2 h de su categoría)
      // que se perderían al reemplazarla por la versión cruda del catálogo.
      const existente = actuales.find((e) => e.nombre === equipo.nombre)
      const base = existente ?? { ...equipo, cantidad: 0 }
      const resto = actuales.filter((e) => e.nombre !== equipo.nombre)

      return [{ ...base, cantidad: Math.min(99, base.cantidad + 1) }, ...resto]
    })
    setAgregando(false)
  }

  function reiniciar() {
    setPerfil(null)
    setEquipos([])
    setHoras(HORAS_AUTONOMIA_DEFAULT)
    setPaso(1)
  }

  function salir() {
    cerrarSesion()
    setSesion(null)
    setSesionRechazada(false)
    reiniciar()
  }

  /**
   * Vacía la cola contra el backend. No hace falta esperarla nunca: guardar un
   * lead y mandarlo son dos cosas distintas a propósito.
   */
  async function sincronizar(forzado = false) {
    if (!sesion?.token) return
    // Con el token ya rechazado se dejan de hacer intentos automáticos —no tiene
    // sentido golpear el backend cada 30 s— pero un "Enviar ahora" a mano sí
    // vuelve a probar: puede que el problema ya esté resuelto del otro lado.
    if (sesionRechazada && !forzado) return

    const resultado = await sincronizarCola(sesion.token)
    setPendientes(resultado.pendientes)
    if (!resultado.sesionVencida) setSesionRechazada(false)

    // El backend rechazó el token (revocado, o vencido antes de lo previsto).
    // NO se expulsa al comercial acá: esto corre en segundo plano y sacarlo de
    // la pantalla en medio de una captura le haría creer que perdió el lead.
    // Se enciende un aviso en la cabecera y él decide cuándo volver a entrar;
    // los leads siguen guardados mientras tanto.
    if (resultado.sesionVencida) setSesionRechazada(true)
  }

  useEffect(() => {
    if (!sesion) return

    let vivo = true
    contarPendientes()
      .then((cantidad) => vivo && setPendientes(cantidad))
      .catch(() => undefined)
    sincronizar()

    const alVolverLaRed = () => sincronizar()
    window.addEventListener("online", alVolverLaRed)

    // La tablet puede tener "red" y no tener internet (wifi de hotel). Por eso
    // además del evento se reintenta cada tanto.
    const reloj = window.setInterval(() => sincronizar(), 30_000)

    return () => {
      vivo = false
      window.removeEventListener("online", alVolverLaRed)
      window.clearInterval(reloj)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesion])

  /** Guarda el lead en la cola. Esto no falla por falta de red: para eso está la cola. */
  async function guardarLead(datos: Parameters<typeof armarLead>[0]) {
    if (!sesion) return

    const contexto: ContextoLead = {
      sesion,
      resultado,
      equipos,
      horas,
      kit: cubren[0] ?? null,
      base: base
        ? {
            kit: base.kit,
            bateriasFaltantes: base.ampliacion.bateriasFaltantes,
            panelesFaltantes: base.ampliacion.panelesFaltantes,
          }
        : null,
      cuando: new Date(),
    }

    await encolarLead(armarLead(datos, contexto))
    setPendientes(await contarPendientes())
    sincronizar()
  }

  // El orden importa: primero la sesión. Si el comercial no entró, no tiene
  // sentido mostrarle un error de catálogo — su problema es que está afuera.
  if (sesion === undefined) {
    return <Pantalla mensaje={null} />
  }

  if (sesion === null) {
    return <PantallaLogin onEntrar={setSesion} />
  }

  if (cargando || error) {
    return <Pantalla mensaje={error} />
  }

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#F2F2EF] text-[#012928]">
      <Cabecera
        paso={paso}
        perfil={perfil}
        sesion={sesion}
        pendientes={pendientes}
        sesionRechazada={sesionRechazada}
        onPaso={setPaso}
        onReiniciar={reiniciar}
        onSalir={salir}
        onVerCola={() => setVerCola(true)}
      />

      {paso === 1 && (
        <PasoPerfil offline={offline} onElegir={elegirPerfil} />
      )}

      {paso === 2 && (
        <PasoApagon
          horas={horas}
          onHoras={setHoras}
          bancoKwh={resultado.bateriaBancoKwh}
          maxBateriaKits={maxBateriaKits}
          equipos={equipos}
          onCantidad={ajustarCantidad}
          onAbrirAgregar={() => setAgregando(true)}
          hayConsumo={hayConsumo}
          onContinuar={() => setPaso(3)}
        />
      )}

      {paso === 3 && (
        <PasoResultado
          resultado={resultado}
          horas={horas}
          cubren={cubren}
          otrasBases={otrasBases}
          respaldo={respaldo}
          base={base}
          hayQr={Boolean(enlaceQr)}
          onAtras={() => setPaso(2)}
          onCapturar={() => setCapturando(true)}
          onMostrarQr={() => setMostrandoQr(true)}
        />
      )}

      {agregando && (
        <DialogoAgregar
          catalogo={catalogo}
          onAgregar={agregarEquipo}
          onCerrar={() => setAgregando(false)}
        />
      )}

      {capturando && (
        <DialogoLead
          hayQr={Boolean(enlaceQr)}
          onGuardar={guardarLead}
          onCerrar={() => setCapturando(false)}
          onMostrarQr={() => {
            setCapturando(false)
            setMostrandoQr(true)
          }}
          onSiguienteCliente={() => {
            setCapturando(false)
            reiniciar()
          }}
        />
      )}

      {mostrandoQr && enlaceQr && (
        <PantallaQr enlace={enlaceQr} onCerrar={() => setMostrandoQr(false)} />
      )}

      {verCola && (
        <PanelCola
          pendientes={pendientes}
          onSincronizar={() => sincronizar(true)}
          onCerrar={() => setVerCola(false)}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Estructura                                                          */
/* ------------------------------------------------------------------ */

function Pantalla({ mensaje }: { mensaje: string | null }) {
  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 bg-[#F2F2EF] px-8 text-center text-[#012928]">
      {mensaje ? (
        <>
          <AlertTriangle className="h-10 w-10 text-[#012928]" strokeWidth={1.75} />
          <p className="max-w-sm text-[15px] leading-snug">{mensaje}</p>
        </>
      ) : (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-[#012928]/40" strokeWidth={2} />
          <p className="text-[15px] text-[#012928]/55">Cargando catálogo…</p>
        </>
      )}
    </div>
  )
}

function Cabecera({
  paso,
  perfil,
  sesion,
  pendientes,
  sesionRechazada,
  onPaso,
  onReiniciar,
  onSalir,
  onVerCola,
}: {
  paso: number
  perfil: PerfilFeria | null
  sesion: SesionFeria
  pendientes: number
  sesionRechazada: boolean
  onPaso: (paso: 1 | 2 | 3) => void
  onReiniciar: () => void
  onSalir: () => void
  onVerCola: () => void
}) {
  const pasos: Array<{ n: 1 | 2 | 3; titulo: string }> = [
    { n: 1, titulo: "Perfil" },
    { n: 2, titulo: "Apagón" },
    { n: 3, titulo: "Resultado" },
  ]

  return (
    /**
     * En 375 px no entran logo, tres pasos con nombre y cinco indicadores: la
     * versión anterior se solapaba. Acá queda una sola fila de acciones y los
     * pasos pasan a ser una barra de progreso. El estado del día —acceso y modo
     * sin red— se mira una vez al empezar, así que vive en el paso 1 y no
     * compite en cada pantalla.
     */
    <header className="shrink-0 border-b border-[#012928]/10 bg-white">
      <div className="flex h-14 items-center gap-2 px-3">
        <p className="min-w-0 flex-1 truncate text-[15px] font-semibold text-[#012928]">
          {sesion.nombre}
        </p>

        {/* El backend rechazó el token. Nadie es expulsado de golpe: el
            comercial decide cuándo cortar y volver a entrar. */}
        {sesionRechazada && (
          <button
            type="button"
            onClick={onSalir}
            className="h-9 shrink-0 rounded-full bg-[#0A052D] px-3 text-[13px] font-semibold text-white"
          >
            Volvé a entrar
          </button>
        )}

        {/* Leads sin enviar. En 0 no se muestra: lo que importa es que aparezca
            cuando hay algo esperando. */}
        {pendientes > 0 && (
          <button
            type="button"
            onClick={onVerCola}
            aria-label={`${pendientes} leads sin enviar`}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#F2C300] px-3 text-[13px] font-semibold text-[#012928]"
          >
            <CloudOff className="h-4 w-4" strokeWidth={2.5} />
            <span className="tabular-nums">{pendientes}</span>
          </button>
        )}

        <BotonIcono etiqueta="Empezar de nuevo" onClick={onReiniciar}>
          <RotateCcw className="h-[18px] w-[18px]" />
        </BotonIcono>
        <BotonIcono etiqueta="Cerrar sesión" onClick={onSalir}>
          <LogOut className="h-[18px] w-[18px]" />
        </BotonIcono>
      </div>

      {/* Tres pasos, tres segmentos. Los ya recorridos se pueden tocar. */}
      <nav aria-label="Pasos" className="flex gap-1.5 px-3 pb-2.5">
        {pasos.map(({ n, titulo }) => {
          const habilitado = n === 1 || Boolean(perfil)
          const recorrido = n <= paso
          return (
            <button
              key={n}
              type="button"
              disabled={!habilitado}
              aria-label={`Paso ${n}: ${titulo}`}
              aria-current={paso === n ? "step" : undefined}
              onClick={() => habilitado && onPaso(n)}
              className="group flex-1 py-1.5"
            >
              <span
                className={`block h-[3px] rounded-full transition-colors ${
                  recorrido ? "bg-[#012928]" : "bg-[#012928]/15"
                }`}
              />
            </button>
          )
        })}
      </nav>
    </header>
  )
}

/* ------------------------------------------------------------------ */
/* Pantalla de bloqueo                                                 */
/* ------------------------------------------------------------------ */

/**
 * Sin sesión no se entra al stand.
 *
 * Cada comercial usa su propio usuario de SunCar —el mismo del admin— porque el
 * lead tiene que salir firmado por quien atendió. Es el único momento que pide
 * internet: después el token dura lo que diga su `exp` y todo lo demás funciona
 * en modo avión.
 */
function PantallaLogin({ onEntrar }: { onEntrar: (sesion: SesionFeria) => void }) {
  const [ci, setCi] = useState("")
  const [clave, setClave] = useState("")
  const [entrando, setEntrando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault()
    if (entrando) return

    setEntrando(true)
    setError(null)

    try {
      const respuesta = await fetch("/api/feria/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ci: ci.trim(), adminPass: clave }),
      })
      const datos = await respuesta.json()

      if (!datos?.success || !datos?.token) {
        // El backend contesta 200 con `success:false` y un solo mensaje para dos
        // casos distintos: contraseña mala y trabajador sin `adminPass`. Como no
        // los distingue, se nombran los dos: el segundo se arregla en el admin,
        // no reintentando.
        setError(
          respuesta.ok
            ? "Carné o contraseña incorrectos. Si estás seguro, tu usuario todavía no tiene acceso de admin configurado."
            : datos?.message || "No se pudo entrar."
        )
        return
      }

      const sesion = aSesion(datos.token)
      if (!sesion) {
        setError("El servidor devolvió un token que no se entiende.")
        return
      }

      guardarSesion(sesion)
      onEntrar(sesion)
    } catch {
      setError("Sin conexión. Para entrar hace falta internet una sola vez.")
    } finally {
      setEntrando(false)
    }
  }

  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center bg-[#F2F2EF] px-6 text-[#012928]">
      <form onSubmit={enviar} className="w-full max-w-sm">
        <p className="text-2xl font-semibold leading-tight">SunCar</p>
        <p className="mb-7 text-[15px] text-[#012928]/55">
          Feria Varadero · 28 al 30 de agosto
        </p>

        <label className="mb-1.5 block text-[13px] font-medium text-[#012928]/55" htmlFor="feria-ci">
          Carné de identidad
        </label>
        <input
          id="feria-ci"
          value={ci}
          onChange={(evento) => setCi(evento.target.value)}
          inputMode="numeric"
          // La tablet es compartida: autocompletar el CI de otro comercial hace
          // que el lead salga firmado por quien no atendió.
          autoComplete="off"
          className="mb-4 h-[52px] w-full rounded-xl border border-[#012928]/15 bg-white px-3.5 text-[17px] tabular-nums outline-none transition focus:border-[#012928]"
        />

        <label className="mb-1.5 block text-[13px] font-medium text-[#012928]/55" htmlFor="feria-clave">
          Contraseña
        </label>
        <input
          id="feria-clave"
          type="password"
          value={clave}
          onChange={(evento) => setClave(evento.target.value)}
          autoComplete="off"
          className="mb-4 h-[52px] w-full rounded-xl border border-[#012928]/15 bg-white px-3.5 text-[17px] outline-none transition focus:border-[#012928]"
        />

        {error && (
          <p className="mb-4 rounded-xl bg-[#0A052D] p-3 text-[13px] font-medium leading-snug text-white">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={entrando || !ci.trim() || !clave}
          className="flex h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-r from-[#AFEB17] to-[#F2C300] text-[17px] font-semibold text-[#012928] transition active:opacity-90 disabled:bg-none disabled:bg-[#012928]/10 disabled:text-[#012928]/35"
        >
          {entrando ? <Loader2 className="h-5 w-5 animate-spin" /> : "Entrar"}
        </button>

        <p className="mt-4 text-[13px] leading-snug text-[#012928]/55">
          Entrá una vez con wifi. Después el stand funciona sin red hasta que venza el acceso.
        </p>
      </form>
    </div>
  )
}

/** Botón de acción secundaria de la cabecera. 40 px: sigue siendo tocable. */
function BotonIcono({
  children,
  etiqueta,
  onClick,
}: {
  children: React.ReactNode
  etiqueta: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#012928]/50 transition active:bg-[#012928]/5"
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Paso 1 — Perfil                                                     */
/* ------------------------------------------------------------------ */

function PasoPerfil({
  offline,
  onElegir,
}: {
  offline: EstadoOffline
  onElegir: (perfil: PerfilFeria) => void
}) {
  return (
    <main className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-5">
      <h1 className="shrink-0 text-[22px] font-semibold leading-tight">
        ¿Qué vamos a respaldar?
      </h1>

      {/* En móvil las tarjetas quedan arriba con su alto natural y el aire cae
          abajo; en pantallas anchas se reparten el alto en fila. */}
      <div className="mt-4 flex min-h-0 flex-col gap-2.5 lg:flex-1 lg:flex-row">
        {PERFILES.map((perfil) => {
          const Icono = ICONO_PERFIL[perfil.id]
          return (
            <button
              key={perfil.id}
              type="button"
              onClick={() => onElegir(perfil)}
              className="flex min-h-0 shrink-0 items-center gap-3.5 rounded-2xl border border-[#012928]/10 bg-white p-4 text-left transition active:border-[#012928]/30 active:bg-[#012928]/[0.03] lg:flex-1 lg:flex-col lg:justify-center lg:gap-4 lg:text-center"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#012928]/[0.06] text-[#012928] lg:h-14 lg:w-14">
                <Icono className="h-[22px] w-[22px] lg:h-7 lg:w-7" strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block text-[17px] font-semibold leading-tight lg:text-xl">
                  {perfil.nombre}
                </span>
                <span className="mt-0.5 block text-[13px] leading-snug text-[#012928]/55">
                  {perfil.descripcion}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <EstadoDescarga offline={offline} />
    </main>
  )
}

/**
 * El ritual de las 8:30, con las tres fases visibles.
 *
 * Antes solo aparecía el check al final y no había forma de distinguir "está
 * bajando" de "no arrancó". Ahora se ve la descarga en curso y recién después
 * el check, que es lo que autoriza a guardar la tablet y bajar a la playa.
 */
function EstadoDescarga({ offline }: { offline: EstadoOffline }) {
  if (offline.fase === "listo") {
    return (
      <p className="mt-4 flex shrink-0 items-center gap-1.5 text-[13px] text-[#012928]/60">
        <CheckCircle2 className="h-4 w-4 text-[#012928]" strokeWidth={2.5} />
        Funciona sin red · {offline.recursos} archivos guardados
      </p>
    )
  }

  if (offline.fase === "fallo") {
    return (
      <p className="mt-4 flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[#0A052D]">
        <CloudOff className="h-4 w-4" strokeWidth={2.5} />
        No se pudo guardar para usar sin red
      </p>
    )
  }

  return (
    <div className="mt-4 shrink-0">
      <p className="flex items-center gap-1.5 text-[13px] text-[#012928]/60">
        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
        {offline.fase === "descargando"
          ? "Descargando para trabajar sin red…"
          : "Preparando el modo sin red…"}
      </p>
      {/* Barra indeterminada: el worker no informa progreso por archivo, y una
          barra que avanza sola miente menos que un porcentaje inventado. */}
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#012928]/10">
        <div className="h-full w-1/3 animate-[barrido_1.2s_ease-in-out_infinite] rounded-full bg-[#012928]" />
      </div>
      <style>{`@keyframes barrido{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Paso 2 — El apagón                                                  */
/* ------------------------------------------------------------------ */

function PasoApagon({
  horas,
  onHoras,
  bancoKwh,
  maxBateriaKits,
  equipos,
  onCantidad,
  onAbrirAgregar,
  hayConsumo,
  onContinuar,
}: {
  horas: number
  onHoras: (horas: number) => void
  bancoKwh: number
  maxBateriaKits: number
  equipos: EquipoSeleccionado[]
  onCantidad: (nombre: string, delta: number) => void
  onAbrirAgregar: () => void
  hayConsumo: boolean
  onContinuar: () => void
}) {
  const porcentajeSlider = ((horas - HORAS_MIN) / (HORAS_MAX - HORAS_MIN)) * 100
  const superaCatalogo = maxBateriaKits > 0 && bancoKwh > maxBateriaKits
  const porcentajeBanco =
    maxBateriaKits > 0 ? Math.min(100, (bancoKwh / maxBateriaKits) * 100) : 0

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      {/* El gancho: mover el apagón y ver crecer el banco. Ocupa la mitad de
          arriba, pero con la escala tipográfica contenida — antes el "8" a 5rem
          y el banco a 3.5rem competían entre sí y no se leía cuál mandaba. */}
      <section className="shrink-0 border-b border-[#012928]/10 bg-white px-4 pb-4 pt-4 lg:flex lg:items-center lg:gap-8 lg:px-8">
        <div className="lg:flex-1">
          <p className="text-[13px] font-medium text-[#012928]/55">
            ¿Cuántas horas al día se va la corriente?
          </p>

          <p className="flex items-baseline gap-2 leading-none">
            <span className="text-[56px] font-semibold tabular-nums tracking-tight lg:text-7xl">
              {horas}
            </span>
            <span className="text-lg font-medium text-[#012928]/45">horas</span>
          </p>

          {/* El thumb baja de 64 a 28 px: el de antes se montaba encima de los
              atajos de abajo. El área tocable sigue siendo la del input entero. */}
          <div className="relative mt-1 h-11">
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-[#012928]/10">
              <div
                className="h-full rounded-full bg-[#012928]"
                style={{ width: `${porcentajeSlider}%` }}
              />
            </div>
            <input
              type="range"
              min={HORAS_MIN}
              max={HORAS_MAX}
              step={1}
              value={horas}
              onChange={(evento) => onHoras(Number(evento.target.value))}
              aria-label="Horas de apagón al día"
              className="absolute inset-0 h-11 w-full cursor-pointer appearance-none bg-transparent
                [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white
                [&::-webkit-slider-thumb]:bg-[#012928] [&::-webkit-slider-thumb]:shadow-md
                [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:appearance-none
                [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white
                [&::-moz-range-thumb]:bg-[#012928]"
            />
          </div>

          <div className="mt-2 flex gap-1.5">
            {HORAS_ATAJO.map((atajo) => (
              <button
                key={atajo}
                type="button"
                onClick={() => onHoras(atajo)}
                className={`h-9 flex-1 rounded-full text-[13px] font-semibold tabular-nums transition ${
                  horas === atajo
                    ? "bg-[#012928] text-white"
                    : "bg-[#012928]/[0.06] text-[#012928]/60"
                }`}
              >
                {atajo} h
              </button>
            ))}
          </div>
        </div>

        {/* El banco de baterías crece en vivo: es lo que el cliente mira. Bloque
            oscuro con el número en volt green — más contraste al sol que el
            degradado, y deja el degradado libre para el botón principal. */}
        <div className="mt-4 rounded-2xl bg-[#012928] p-4 text-white lg:mt-0 lg:w-[38%]">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/60">
            <BatteryCharging className="h-4 w-4" />
            Banco de baterías
          </p>
          <p className="mt-1 flex items-baseline gap-1.5 leading-none">
            <span className="text-[40px] font-semibold tabular-nums tracking-tight text-[#AFEB17] lg:text-6xl">
              {num(bancoKwh)}
            </span>
            <span className="text-base font-medium text-white/60">kWh</span>
          </p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-[#AFEB17] transition-[width] duration-200"
              style={{ width: `${porcentajeBanco}%` }}
            />
          </div>
          <p className="mt-2 text-[12px] leading-snug text-white/60">
            {superaCatalogo
              ? `Pasa el kit más grande (${num(maxBateriaKits)} kWh): hay que ampliar.`
              : `Kit más grande del catálogo: ${num(maxBateriaKits)} kWh.`}
          </p>
        </div>
      </section>

      {/* Equipos: el comercial solo corrige cantidades. */}
      <section className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-1 pt-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#012928]/45">
            Equipos
          </h2>
          <button
            type="button"
            onClick={onAbrirAgregar}
            className="flex h-9 items-center gap-1.5 rounded-full bg-[#012928]/[0.06] px-3 text-[13px] font-semibold text-[#012928]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Agregar
          </button>
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
          {equipos.map((equipo) => (
            <li
              key={equipo.nombre}
              className={`flex items-center gap-2 border-b border-[#012928]/[0.07] py-1.5 ${
                equipo.cantidad === 0 ? "opacity-40" : ""
              }`}
            >
              {/* Nombre y potencia en una línea: en 375 px, apilarlos hacía la
                  fila tan alta que solo entraban dos equipos en pantalla. */}
              <p className="min-w-0 flex-1 truncate text-[15px] leading-tight">
                <span className="font-medium">{equipo.nombre}</span>
                <span className="ml-1.5 text-[13px] tabular-nums text-[#012928]/40">
                  {num(equipo.potencia_kw * 1000, 0)} W
                </span>
              </p>
              <div className="flex shrink-0 items-center">
                <BotonCantidad
                  etiqueta={`Quitar un ${equipo.nombre}`}
                  onClick={() => onCantidad(equipo.nombre, -1)}
                >
                  <Minus className="h-[18px] w-[18px]" strokeWidth={2.5} />
                </BotonCantidad>
                <span className="w-7 text-center text-[17px] font-semibold tabular-nums">
                  {equipo.cantidad}
                </span>
                <BotonCantidad
                  etiqueta={`Agregar un ${equipo.nombre}`}
                  onClick={() => onCantidad(equipo.nombre, 1)}
                >
                  <Plus className="h-[18px] w-[18px]" strokeWidth={2.5} />
                </BotonCantidad>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <PieAccion>
        <button
          type="button"
          disabled={!hayConsumo}
          onClick={onContinuar}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#AFEB17] to-[#F2C300] text-[17px] font-semibold text-[#012928] transition active:opacity-90 disabled:bg-none disabled:bg-[#012928]/10 disabled:text-[#012928]/35"
        >
          Ver el sistema
          <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </PieAccion>
    </main>
  )
}

/** Cabecera común de las hojas a pantalla completa. */
function CabeceraHoja({ titulo, onCerrar }: { titulo: string; onCerrar: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#012928]/10 px-4">
      <h2 className="min-w-0 truncate text-[17px] font-semibold">{titulo}</h2>
      <BotonIcono etiqueta="Cerrar" onClick={onCerrar}>
        <X className="h-5 w-5" strokeWidth={2.5} />
      </BotonIcono>
    </header>
  )
}

/**
 * Pie fijo de acción.
 *
 * `env(safe-area-inset-bottom)` es lo que evita que el botón principal quede
 * debajo de la barra de gestos en un teléfono con notch — en la tablet suma 0.
 */
function PieAccion({ children }: { children: React.ReactNode }) {
  return (
    <footer
      className="shrink-0 border-t border-[#012928]/10 bg-white px-4 pt-3"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      {children}
    </footer>
  )
}

/**
 * Botón de cantidad. 44 px es el mínimo tocable de iOS y deja sitio al nombre
 * del equipo: con los 64 px de antes, en 375 px los nombres se truncaban todos.
 */
function BotonCantidad({
  children,
  etiqueta,
  onClick,
}: {
  children: React.ReactNode
  etiqueta: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full text-[#012928]/70 transition active:bg-[#012928]/[0.06]"
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Diálogo de agregar equipo                                           */
/* ------------------------------------------------------------------ */

function DialogoAgregar({
  catalogo,
  onAgregar,
  onCerrar,
}: {
  catalogo: EquipoCatalogo[]
  onAgregar: (equipo: EquipoCatalogo) => void
  onCerrar: () => void
}) {
  const categorias = useMemo(() => {
    const nombres: string[] = []
    for (const equipo of catalogo) {
      if (!nombres.includes(equipo.categoria)) nombres.push(equipo.categoria)
    }
    return nombres
  }, [catalogo])

  const [categoria, setCategoria] = useState(categorias[0] ?? "")
  const visibles = catalogo.filter((equipo) => equipo.categoria === categoria)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white text-[#012928]">
      <CabeceraHoja titulo="Agregar equipo" onCerrar={onCerrar} />

      {/* Las ocho categorías en varias líneas, no en scroll horizontal: con la
          fila deslizable, "Agua y Servicios" —donde vive el calentador de agua—
          quedaba fuera de pantalla y nadie la encontraba. */}
      <div className="shrink-0 border-b border-[#012928]/10 px-4 py-2.5">
        <div className="flex flex-wrap gap-1.5">
          {categorias.map((nombre) => (
            <button
              key={nombre}
              type="button"
              onClick={() => setCategoria(nombre)}
              className={`h-9 rounded-full px-3 text-[13px] font-medium transition ${
                categoria === nombre
                  ? "bg-[#012928] text-white"
                  : "bg-[#012928]/[0.06] text-[#012928]/60"
              }`}
            >
              {nombre}
            </button>
          ))}
        </div>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto px-4">
        {visibles.map((equipo) => (
          <li key={equipo.nombre}>
            <button
              type="button"
              onClick={() => onAgregar(equipo)}
              className="flex w-full items-center justify-between gap-3 border-b border-[#012928]/[0.07] py-2.5 text-left transition active:bg-[#012928]/[0.03]"
            >
              <span className="min-w-0 flex-1 truncate text-[15px] leading-tight">
                <span className="font-medium">{equipo.nombre}</span>
                <span className="ml-1.5 text-[13px] tabular-nums text-[#012928]/40">
                  {num(equipo.potencia_kw * 1000, 0)} W
                </span>
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#012928]/[0.06] text-[#012928]">
                <Plus className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Captura del lead                                                    */
/* ------------------------------------------------------------------ */

/**
 * Nombre y WhatsApp, y el lead queda guardado.
 *
 * Guardar escribe en IndexedDB y **no depende de la red**: el envío al backend
 * es un intento aparte que se repite solo. Por eso la confirmación dice
 * "guardado" y no "enviado": es lo único que se le puede prometer al comercial
 * parado en la arena.
 */
function DialogoLead({
  hayQr,
  onGuardar,
  onCerrar,
  onMostrarQr,
  onSiguienteCliente,
}: {
  hayQr: boolean
  onGuardar: (datos: {
    nombre: string
    telefono: string
    provincia: string
    direccion: string
    pendienteVisita: boolean
  }) => Promise<void>
  onCerrar: () => void
  onMostrarQr: () => void
  onSiguienteCliente: () => void
}) {
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [provincia, setProvincia] = useState("")
  const [direccion, setDireccion] = useState("")
  const [pendienteVisita, setPendienteVisita] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const normalizado = normalizarTelefono(telefono)
  const telefonoOk = telefonoValido(telefono)
  const puedeGuardar = nombre.trim().length >= 2 && telefonoOk && !guardando

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault()
    if (!puedeGuardar) return

    setGuardando(true)
    setError(null)

    try {
      await onGuardar({ nombre, telefono, provincia, direccion, pendienteVisita })
      setGuardado(true)
    } catch {
      setError("No se pudo guardar en la tablet. Anotalo en papel y avisá.")
    } finally {
      setGuardando(false)
    }
  }

  if (guardado) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white px-6 text-center text-[#012928]">
        <CheckCircle2 className="h-14 w-14 text-[#012928]" strokeWidth={1.75} />
        <div>
          <p className="text-[22px] font-semibold">Lead guardado</p>
          <p className="mx-auto mt-1 max-w-xs text-[13px] leading-snug text-[#012928]/55">
            Sale solo cuando haya internet. El contador de arriba lo lleva.
          </p>
        </div>
        <div className="mt-2 flex w-full max-w-sm flex-col gap-2">
          {/* Paso 5 del guion: que se lleve el cálculo en su teléfono. Va como
              acción principal porque es lo que sigue con el cliente delante. */}
          {hayQr && (
            <button
              type="button"
              onClick={onMostrarQr}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#AFEB17] to-[#F2C300] text-[17px] font-semibold text-[#012928] transition active:opacity-90"
            >
              <QrCode className="h-5 w-5" strokeWidth={2.5} />
              Pasarle el resumen
            </button>
          )}
          <button
            type="button"
            onClick={onSiguienteCliente}
            className={`h-[52px] w-full rounded-full text-[17px] font-semibold transition active:opacity-90 ${
              hayQr
                ? "border border-[#012928]/15 text-[#012928]"
                : "bg-gradient-to-r from-[#AFEB17] to-[#F2C300] text-[#012928]"
            }`}
          >
            Atender a otro
          </button>
          <button
            type="button"
            onClick={onCerrar}
            className="h-11 w-full text-[15px] font-medium text-[#012928]/55"
          >
            Volver al cálculo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white text-[#012928]">
      <CabeceraHoja titulo="Datos del cliente" onCerrar={onCerrar} />

      <form onSubmit={enviar} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-4">
          <label className="mb-1.5 block text-[13px] font-medium text-[#012928]/55" htmlFor="lead-nombre">
            Nombre
          </label>
          <input
            id="lead-nombre"
            value={nombre}
            onChange={(evento) => setNombre(evento.target.value)}
            autoComplete="off"
            autoCapitalize="words"
            className="mb-4 h-[52px] w-full rounded-xl border border-[#012928]/15 px-3.5 text-[17px] outline-none transition focus:border-[#012928]"
          />

          <label className="mb-1.5 block text-[13px] font-medium text-[#012928]/55" htmlFor="lead-telefono">
            WhatsApp
          </label>
          <input
            id="lead-telefono"
            value={telefono}
            onChange={(evento) => setTelefono(evento.target.value)}
            inputMode="tel"
            autoComplete="off"
            className="h-[52px] w-full rounded-xl border border-[#012928]/15 px-3.5 text-[17px] tabular-nums outline-none transition focus:border-[#012928]"
          />
          {/* El backend solo acepta dígitos con un "+" opcional. Se limpia solo,
              pero se muestra el resultado: el comercial tiene que ver el número
              que va a quedar guardado, con el cliente todavía delante. */}
          <p className="mb-5 mt-1.5 text-[13px] text-[#012928]/55">
            {telefono.trim() === "" ? (
              "Se guarda solo el número. Los espacios y guiones se quitan."
            ) : telefonoOk ? (
              <>
                Se guarda como{" "}
                <span className="font-semibold tabular-nums text-[#012928]">{normalizado}</span>
              </>
            ) : (
              "Faltan dígitos o hay letras: entre 6 y 15 números."
            )}
          </p>

          {/* Provincia y dirección son opcionales pero es lo que después
              permite repartir los leads: un cliente de Matanzas y uno de
              Holguín no los llama la misma persona. */}
          <label
            className="mb-1.5 block text-[13px] font-medium text-[#012928]/55"
            htmlFor="lead-provincia"
          >
            Provincia
          </label>
          <select
            id="lead-provincia"
            value={provincia}
            onChange={(evento) => setProvincia(evento.target.value)}
            className="mb-4 h-[52px] w-full appearance-none rounded-xl border border-[#012928]/15 bg-white bg-[length:16px] bg-[right_14px_center] bg-no-repeat px-3.5 text-[17px] outline-none transition focus:border-[#012928]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23012928' stroke-width='2' stroke-linecap='round'><path d='m6 9 6 6 6-6'/></svg>\")",
            }}
          >
            <option value="">Sin especificar</option>
            {PROVINCIAS.map((nombreProvincia) => (
              <option key={nombreProvincia} value={nombreProvincia}>
                {nombreProvincia}
              </option>
            ))}
          </select>

          <label
            className="mb-1.5 block text-[13px] font-medium text-[#012928]/55"
            htmlFor="lead-direccion"
          >
            Dirección o zona <span className="text-[#012928]/35">· opcional</span>
          </label>
          <input
            id="lead-direccion"
            value={direccion}
            onChange={(evento) => setDireccion(evento.target.value)}
            autoComplete="off"
            placeholder="Reparto, municipio, referencia…"
            className="mb-5 h-[52px] w-full rounded-xl border border-[#012928]/15 px-3.5 text-[17px] outline-none transition placeholder:text-[#012928]/30 focus:border-[#012928]"
          />

          <button
            type="button"
            onClick={() => setPendienteVisita((valor) => !valor)}
            className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition ${
              pendienteVisita ? "border-[#F2C300] bg-[#F2C300]/10" : "border-[#012928]/15"
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                pendienteVisita ? "border-[#012928] bg-[#012928]" : "border-[#012928]/25"
              }`}
            >
              {pendienteVisita && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-medium leading-tight">
                Pendiente de visita
              </span>
              <span className="mt-0.5 block text-[13px] leading-snug text-[#012928]/55">
                Hay que ir a verlo antes de cotizar.
              </span>
            </span>
          </button>

          {/* La advertencia del plan: marcar esto crea una visita de verdad en el
              backend. Con 80 leads de feria, marcarlo a todos ahoga a la gente
              que después tiene que hacer esas visitas. */}
          {pendienteVisita && (
            <p className="mt-2 flex items-start gap-2 rounded-xl bg-[#F2C300]/15 p-3 text-[13px] leading-snug">
              <AlertTriangle className="h-4 w-4 shrink-0 translate-y-0.5" strokeWidth={2.5} />
              Esto crea una visita en el sistema y marca el lead como Alta. Dejalo para clientes
              que valen el viaje, no para todos.
            </p>
          )}

          {error && (
            <p className="mt-3 rounded-xl bg-[#0A052D] p-3 text-[13px] font-medium text-white">
              {error}
            </p>
          )}
        </div>

        <PieAccion>
          <button
            type="submit"
            disabled={!puedeGuardar}
            className="flex h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-r from-[#AFEB17] to-[#F2C300] text-[17px] font-semibold text-[#012928] transition active:opacity-90 disabled:bg-none disabled:bg-[#012928]/10 disabled:text-[#012928]/35"
          >
            {guardando ? <Loader2 className="h-5 w-5 animate-spin" /> : "Guardar lead"}
          </button>
        </PieAccion>
      </form>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* QR de WhatsApp                                                      */
/* ------------------------------------------------------------------ */

/**
 * El visitante se lleva el cálculo en su propio teléfono.
 *
 * Escanea, se le abre WhatsApp con el mensaje escrito y él aprieta enviar: el
 * mensaje entra al WhatsApp de la empresa —conectado a Chatwoot— con su número
 * real. Si en la playa no tiene señal, su teléfono lo encola y sale solo.
 *
 * La pantalla es blanca y el QR negro a propósito: bajo sol directo, cualquier
 * color o fondo de marca le quita contraste a la cámara del visitante.
 */
function PantallaQr({ enlace, onCerrar }: { enlace: string; onCerrar: () => void }) {
  // El QR se agranda a lo que dé la pantalla: cuanto más grande el cuadradito,
  // menos depende del enfoque de la cámara del visitante y del sol de frente.
  const [lado, setLado] = useState(320)

  useEffect(() => {
    const medir = () =>
      setLado(Math.max(280, Math.min(440, Math.min(window.innerWidth, window.innerHeight) - 300)))

    medir()
    window.addEventListener("resize", medir)
    return () => window.removeEventListener("resize", medir)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-white px-6 text-center text-[#012928]">
      <div>
        <p className="text-[22px] font-semibold leading-tight">Escanealo con tu teléfono</p>
        <p className="mx-auto mt-1 max-w-xs text-[13px] leading-snug text-[#012928]/55">
          Se te abre WhatsApp con el cálculo escrito. Solo tenés que enviarlo.
        </p>
      </div>

      {/* `marginSize` es la zona de silencio que la cámara necesita para
          encontrar el código. Corrección nivel L: la redundancia extra sirve
          contra códigos impresos rotos o sucios, no contra una pantalla, y en
          cambio agrega módulos que sí hacen daño bajo sol directo. */}
      <QRCodeSVG
        value={enlace}
        size={lado}
        level="L"
        marginSize={4}
        bgColor="#FFFFFF"
        fgColor="#000000"
        aria-label="Código QR para enviar el resumen por WhatsApp"
      />

      <button
        type="button"
        onClick={onCerrar}
        className="h-[52px] w-full max-w-sm rounded-full bg-[#012928] text-[17px] font-semibold text-white transition active:opacity-90"
      >
        Listo
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Cola de envío                                                       */
/* ------------------------------------------------------------------ */

/**
 * Qué hay sin enviar y por qué.
 *
 * Es la pantalla del cierre del día: volver al hotel con wifi y ver el contador
 * bajar a 0. Si algo no sale, acá se ve el motivo en vez de quedar en un
 * silencio que nadie descubre hasta el lunes.
 */
function PanelCola({
  pendientes,
  onSincronizar,
  onCerrar,
}: {
  pendientes: number
  onSincronizar: () => Promise<void>
  onCerrar: () => void
}) {
  const [leads, setLeads] = useState<LeadEncolado[]>([])
  const [sincronizando, setSincronizando] = useState(false)

  useEffect(() => {
    leerPendientes()
      .then(setLeads)
      .catch(() => setLeads([]))
  }, [pendientes])

  async function reintentar() {
    setSincronizando(true)
    try {
      await onSincronizar()
      setLeads(await leerPendientes())
    } finally {
      setSincronizando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white text-[#012928]">
      <CabeceraHoja titulo={`Sin enviar (${leads.length})`} onCerrar={onCerrar} />

      <ul className="min-h-0 flex-1 overflow-y-auto px-4 pt-3">
        {leads.length === 0 && (
          <li className="flex flex-col items-center gap-3 py-20 text-center">
            <CheckCircle2 className="h-12 w-12 text-[#012928]" strokeWidth={1.75} />
            <p className="text-[17px] font-semibold">Todo enviado</p>
          </li>
        )}

        {leads.map((lead) => (
          <li key={lead.id} className="mb-2 rounded-xl border border-[#012928]/10 p-3.5">
            <p className="text-[15px] font-medium">{lead.cuerpo.nombre}</p>
            <p className="mt-0.5 text-[13px] tabular-nums text-[#012928]/55">
              {lead.cuerpo.telefono} · {lead.cuerpo.estado}
            </p>
            <p className="mt-0.5 text-[12px] text-[#012928]/40">
              Guardado{" "}
              {new Date(lead.creadoEn).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {lead.intentos > 0 && ` · ${lead.intentos} intento${lead.intentos > 1 ? "s" : ""}`}
            </p>
            {lead.ultimoError && (
              <p className="mt-2 rounded-lg bg-[#0A052D] px-2.5 py-2 text-[12px] leading-snug text-white">
                {lead.ultimoError}
              </p>
            )}
          </li>
        ))}
      </ul>

      <PieAccion>
        <button
          type="button"
          onClick={reintentar}
          disabled={sincronizando || leads.length === 0}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#012928] text-[17px] font-semibold text-white transition active:opacity-90 disabled:bg-[#012928]/10 disabled:text-[#012928]/35"
        >
          <RefreshCw
            className={`h-5 w-5 ${sincronizando ? "animate-spin" : ""}`}
            strokeWidth={2.5}
          />
          Enviar ahora
        </button>
      </PieAccion>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Paso 3 — Resultado                                                  */
/* ------------------------------------------------------------------ */

function PasoResultado({
  resultado,
  horas,
  cubren,
  otrasBases,
  respaldo,
  base,
  hayQr,
  onAtras,
  onCapturar,
  onMostrarQr,
}: {
  resultado: ReturnType<typeof dimensionarSistema>
  horas: number
  cubren: KitMatch[]
  otrasBases: KitMatch[]
  respaldo: KitMatch[]
  base: { kit: KitFeria; ampliacion: Ampliacion } | null
  hayQr: boolean
  onAtras: () => void
  onCapturar: () => void
  onMostrarQr: () => void
}) {
  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-4">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <Cifra titulo="Consumo" valor={num(resultado.energiaDiaKwh)} unidad="kWh/día" />
          <Cifra titulo="Inversor" valor={num(resultado.inversorKva)} unidad="kVA" />
          <Cifra
            titulo={`Baterías · ${horas} h`}
            valor={num(resultado.bateriaBancoKwh)}
            unidad="kWh"
            destacado
          />
          <Cifra
            titulo="Paneles"
            valor={String(resultado.numeroPaneles)}
            unidad={`de 600 W · ${num(resultado.panelesKwp)} kWp`}
          />
        </div>

        {base ? (
          <BloqueAmpliacion base={base} resultado={resultado} />
        ) : (
          <>
            <Rotulo>{cubren.length === 1 ? "Kit que le sirve" : "Kits que le sirven"}</Rotulo>
            <div className="grid gap-2 lg:grid-cols-3">
              {cubren.map((match) => (
                <TarjetaKit key={match.kit.id} match={match} />
              ))}
            </div>
          </>
        )}

        {base && otrasBases.length > 0 && (
          <>
            <Rotulo>Otras bases posibles</Rotulo>
            <div className="grid gap-2 lg:grid-cols-2">
              {otrasBases.map((match) => (
                <TarjetaKit key={match.kit.id} match={match} />
              ))}
            </div>
          </>
        )}

        {respaldo.length > 0 && (
          <>
            <Rotulo>Solo respaldo · no generan</Rotulo>
            <div className="grid gap-2 lg:grid-cols-2">
              {respaldo.map((match) => (
                <TarjetaKit key={match.kit.id} match={match} />
              ))}
            </div>
          </>
        )}

        {cubren.length === 0 && !base && (
          <div className="mt-5 rounded-2xl bg-[#0A052D] p-4 text-white">
            <p className="text-[17px] font-semibold leading-snug">
              Ningún kit del catálogo arranca este consumo.
            </p>
            <p className="mt-1 text-[13px] text-white/60">
              Anotá los datos del cliente: este caso se cotiza a medida desde la oficina.
            </p>
          </div>
        )}
      </div>

      <PieAccion>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onAtras}
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full text-[#012928]/60 transition active:bg-[#012928]/[0.06]"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={onCapturar}
            className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#AFEB17] to-[#F2C300] text-[17px] font-semibold text-[#012928] transition active:opacity-90"
          >
            <UserPlus className="h-5 w-5" strokeWidth={2.5} />
            Guardar lead
          </button>
          {/* Para el visitante con prisa que no deja el número pero sí quiere
              llevarse el cálculo. */}
          {hayQr && (
            <button
              type="button"
              onClick={onMostrarQr}
              aria-label="Mostrar QR de WhatsApp"
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-[#012928]/15 text-[#012928] transition active:bg-[#012928]/[0.06]"
            >
              <QrCode className="h-5 w-5" strokeWidth={2} />
            </button>
          )}
        </div>
      </PieAccion>
    </main>
  )
}

/** Rótulo de sección: pequeño y en mayúsculas, para no competir con las cifras. */
function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#012928]/45">
      {children}
    </h2>
  )
}

function Cifra({
  titulo,
  valor,
  unidad,
  destacado = false,
}: {
  titulo: string
  valor: string
  unidad: string
  destacado?: boolean
}) {
  return (
    <div
      className={`rounded-2xl p-3 ${
        destacado ? "bg-[#012928] text-white" : "border border-[#012928]/10 bg-white"
      }`}
    >
      <p
        className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${
          destacado ? "text-white/55" : "text-[#012928]/45"
        }`}
      >
        {titulo}
      </p>
      <p
        className={`mt-0.5 text-[30px] font-semibold leading-none tabular-nums tracking-tight ${
          destacado ? "text-[#AFEB17]" : ""
        }`}
      >
        {valor}
      </p>
      <p className={`mt-1 text-[12px] ${destacado ? "text-white/55" : "text-[#012928]/45"}`}>
        {unidad}
      </p>
    </div>
  )
}

function TarjetaKit({ match }: { match: KitMatch }) {
  const { kit, etiqueta } = match
  const estilo = ESTILO_ETIQUETA[etiqueta]

  return (
    <article className="flex gap-3 rounded-2xl border border-[#012928]/10 bg-white p-3.5">
      <FotoKit url={kit.fotoUrl} nombre={kit.nombre} />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[26px] font-semibold leading-none tabular-nums tracking-tight">
            {precio(kit.precio)}
            <span className="ml-1 text-[13px] font-medium text-[#012928]/40">{kit.moneda}</span>
          </p>
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${estilo.clase}`}
          >
            {estilo.texto}
          </span>
        </div>

        <p className="mt-1.5 font-mono text-[13px] leading-snug text-[#012928]/70">{kit.resumen}</p>

        <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[12px]">
          <Cobertura ok={match.cubreInversor} texto={`${num(kit.inversorKw)} kW`} />
          <Cobertura ok={match.cubreBaterias} texto={`${num(kit.bateriaKwh)} kWh`} />
          <Cobertura
            ok={match.cubrePaneles}
            texto={kit.tienePaneles ? `${num(kit.panelesKwp)} kWp` : "sin paneles"}
          />
        </div>
      </div>
    </article>
  )
}

/**
 * Miniatura del kit.
 *
 * Las fotos viven en S3 y el service worker las guarda aparte para que se vean
 * sin red. Si alguna falta —o la tablet nunca las bajó— la tarjeta se muestra
 * igual con un hueco neutro: nunca un ícono de imagen rota delante del cliente.
 */
function FotoKit({ url, nombre }: { url?: string; nombre: string }) {
  const [falló, setFalló] = useState(false)

  if (!url || falló) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#012928]/[0.06]">
        <Sun className="h-5 w-5 text-[#012928]/25" strokeWidth={2} />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={nombre}
      loading="lazy"
      onError={() => setFalló(true)}
      className="h-14 w-14 shrink-0 rounded-xl border border-[#012928]/10 object-cover"
    />
  )
}

function Cobertura({ ok, texto }: { ok: boolean; texto: string }) {
  return (
    <span
      className={`flex items-center gap-1 ${
        ok ? "font-medium text-[#012928]/70" : "text-[#012928]/35"
      }`}
    >
      {ok ? (
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      ) : (
        <X className="h-3.5 w-3.5" strokeWidth={3} />
      )}
      {texto}
    </span>
  )
}

/**
 * Caso hostal/restaurante: ningún kit lo cubre de fábrica. En vez de dejar al
 * comercial sin nada que mostrar, se le da la base más barata de ampliar y
 * exactamente cuántas baterías y paneles hay que sumarle.
 */
function BloqueAmpliacion({
  base,
  resultado,
}: {
  base: { kit: KitFeria; ampliacion: Ampliacion }
  resultado: ReturnType<typeof dimensionarSistema>
}) {
  const { kit, ampliacion } = base
  const bateriaFinal = kit.bateriaKwh + ampliacion.bateriaExtraKwh
  const panelesFinal = kit.panelesKwp + ampliacion.panelExtraKwp

  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-[#F2C300] bg-[#F2C300]/10">
      <div className="flex items-center gap-2 bg-[#F2C300] px-3.5 py-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-[#012928]" strokeWidth={2.5} />
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#012928]">
          Necesita ampliación
        </p>
      </div>

      <div className="p-3.5">
        <p className="text-[13px] text-[#012928]/70">
          Ningún kit lo cubre de fábrica. Se parte de esta base y se le suma:
        </p>

        <div className="mt-3 grid gap-2 lg:grid-cols-2">
          <div className="rounded-xl border border-[#012928]/10 bg-white p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#012928]/45">
              Base
            </p>
            <p className="mt-0.5 text-[26px] font-semibold leading-none tabular-nums tracking-tight">
              {precio(kit.precio)}
              <span className="ml-1 text-[13px] font-medium text-[#012928]/40">{kit.moneda}</span>
            </p>
            <p className="mt-1.5 font-mono text-[13px] leading-snug text-[#012928]/70">
              {kit.resumen}
            </p>
          </div>

          <div className="rounded-xl border border-[#012928]/10 bg-white p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#012928]/45">
              Se le agrega
            </p>
            <ul className="mt-1.5 space-y-1">
              {ampliacion.bateriasFaltantes > 0 && (
                <li className="flex items-baseline gap-1.5 text-[17px] leading-tight">
                  <span className="font-semibold tabular-nums">
                    +{ampliacion.bateriasFaltantes}
                  </span>
                  batería{ampliacion.bateriasFaltantes > 1 ? "s" : ""}
                  <span className="text-[13px] text-[#012928]/50">
                    de {num(kit.bateriaUnidadKwh)} kWh
                  </span>
                </li>
              )}
              {ampliacion.panelesFaltantes > 0 && (
                <li className="flex items-baseline gap-1.5 text-[17px] leading-tight">
                  <span className="font-semibold tabular-nums">+{ampliacion.panelesFaltantes}</span>
                  panel{ampliacion.panelesFaltantes > 1 ? "es" : ""}
                  <span className="text-[13px] text-[#012928]/50">
                    de {num(kit.panelUnidadW, 0)} W
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Orden de magnitud de la ampliación. Se reparte el precio final del
            kit entre sus materiales para sacar cuánto vale una batería y un
            panel, así que es una estimación y se dice que lo es: el comercial
            va a leer este número en voz alta. */}
        {ampliacion.costoEstimado !== null && (
          <div className="mt-2 rounded-xl bg-[#012928] p-3.5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/55">
              Estimado de la ampliación
            </p>
            <p className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-[26px] font-semibold leading-none tabular-nums tracking-tight text-[#AFEB17]">
                +{precio(ampliacion.costoEstimado)}
              </span>
              <span className="text-[13px] text-white/55">{kit.moneda}</span>
            </p>
            <p className="mt-1.5 text-[12px] text-white/55">
              Con la base, el sistema queda en{" "}
              <span className="font-semibold text-white">
                {precio(kit.precio + ampliacion.costoEstimado)} {kit.moneda}
              </span>
              . Aproximado, a confirmar en oficina.
            </p>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] font-medium text-[#012928]/70">
          <span className="flex items-center gap-1">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
            Baterías {num(bateriaFinal)} / {num(resultado.bateriaBancoKwh)} kWh
          </span>
          <span className="flex items-center gap-1">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
            Paneles {num(panelesFinal)} / {num(resultado.panelesKwp)} kWp
          </span>
        </div>
      </div>
    </section>
  )
}
