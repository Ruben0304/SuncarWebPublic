"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Footer from "@/components/footer"
import FooterChristmas from "@/components/footer-christmas"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calculator,
  Plus,
  X,
  Zap,
  RotateCcw,
  Battery,
  Cpu,
  Sun,
  Minus,
  Search,
  Loader2,
  Trash2,
  ArrowLeft,
  Home,
  Building2,
  Clock,
  Info,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react"
import { calculoEnergeticoService } from "@/services/api/calculoEnergeticoService"
import type { CalculoEnergeticoCategoria } from "@/services/api/calculoEnergeticoService"
import {
  dimensionarSistema,
  inferirTipoCarga,
  horasUsoPorDefecto,
  factorArranquePorDefecto,
  CONSTANTES,
  FACTOR_SIMULTANEIDAD,
  DOD,
  type EquipoCalculo,
  type ParametrosDimensionamiento,
  type PerfilUso,
  type TecnologiaBateria,
  type TipoCarga,
} from "@/lib/solar/dimensionamiento"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { isChristmasSeason } from "@/lib/christmas-utils"

const categoriaIconos: Record<string, string> = {
  "Electrodomésticos de Cocina": "🏠",
  "Equipos de Sala y Entretenimiento": "🛋️",
  "Climatización y Ventilación": "❄️",
  "Iluminación": "💡",
  "Dormitorio y Uso General": "🛏️",
  "Lavandería y Limpieza": "🧺",
  "Agua y Servicios": "💧",
  "Otros Equipos y Herramientas": "🔧",
}

type Modo = "asistido" | "experto"

const getEquipoKey = (categoriaId: string, equipoNombre: string) => `${categoriaId}::${equipoNombre}`

type EquipoWithMeta = {
  key: string
  categoriaId: string
  categoriaNombre: string
  nombre: string
  potencia_kw: number
  energia_kwh: number
  horas_uso_dia: number
  tipo_carga: TipoCarga
  factor_arranque: number
  isLocal?: boolean
}

interface CreateEquipoForm {
  nombre: string
  potencia_kw: string
  energia_kwh: string
  horas_uso_dia: string
  tipo_carga: TipoCarga
  categoria: string
  categoriaPersonalizada: string
}

const createEmptyCreateForm = (): CreateEquipoForm => ({
  nombre: "",
  potencia_kw: "",
  energia_kwh: "",
  horas_uso_dia: "4",
  tipo_carga: "resistiva",
  categoria: "",
  categoriaPersonalizada: "",
})

const fmt = (n: number, dec = 1) =>
  n.toLocaleString("es-ES", { minimumFractionDigits: dec, maximumFractionDigits: dec })

export default function CalculadoraPage() {
  const { toast } = useToast()

  const [modo, setModo] = useState<Modo>("asistido")
  const [perfil, setPerfil] = useState<PerfilUso>("hogar")
  const [tecnologiaBateria, setTecnologiaBateria] = useState<TecnologiaBateria>("litio")
  const [horasAutonomia, setHorasAutonomia] = useState([8])
  const [showAvanzado, setShowAvanzado] = useState(false)
  const [avanzado, setAvanzado] = useState({
    factorSimultaneidad: null as number | null,
    hsp: CONSTANTES.HSP,
    pr: CONSTANTES.PR,
    factorPotencia: CONSTANTES.FACTOR_POTENCIA,
    potenciaPanelKwp: CONSTANTES.POTENCIA_PANEL_KWP,
  })

  const [categorias, setCategorias] = useState<CalculoEnergeticoCategoria[]>([])
  const [equiposLocales, setEquiposLocales] = useState<Map<string, EquipoWithMeta>>(new Map())
  const [equiposCantidad, setEquiposCantidad] = useState<Map<string, number>>(new Map())
  const [horasUsoOverride, setHorasUsoOverride] = useState<Map<string, number>>(new Map())
  const [openBuscador, setOpenBuscador] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [cantidadBuscador, setCantidadBuscador] = useState<Map<string, number>>(new Map())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createForm, setCreateForm] = useState<CreateEquipoForm>(() => createEmptyCreateForm())
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingCategorias, setLoadingCategorias] = useState(false)
  const [categoriasError, setCategoriasError] = useState<string | null>(null)
  const [isChristmas, setIsChristmas] = useState(false)

  const fetchCategorias = useCallback(async () => {
    setLoadingCategorias(true)
    try {
      const data = await calculoEnergeticoService.getCategorias()
      setCategorias(data)
      setCategoriasError(null)
    } catch (error) {
      console.error("[Calculadora] Error al cargar categorías:", error)
      setCategorias([])
      setCategoriasError(
        error instanceof Error ? error.message : "No se pudieron cargar los equipos. Intenta nuevamente."
      )
    } finally {
      setLoadingCategorias(false)
      setInitialLoading(false)
    }
  }, [])

  useEffect(() => {
    setIsChristmas(isChristmasSeason())
    fetchCategorias()
  }, [fetchCategorias])

  // Combinar equipos del backend con equipos locales, infiriendo campos faltantes
  const equiposConMeta = useMemo<EquipoWithMeta[]>(() => {
    const equiposBackend = categorias.flatMap((categoria) =>
      (categoria.equipos || []).map((equipo) => {
        const tipo = equipo.tipo_carga ?? inferirTipoCarga(equipo.nombre)
        return {
          key: getEquipoKey(categoria.id, equipo.nombre),
          categoriaId: categoria.id,
          categoriaNombre: categoria.nombre,
          nombre: equipo.nombre,
          potencia_kw: equipo.potencia_kw,
          energia_kwh: equipo.energia_kwh,
          horas_uso_dia: equipo.horas_uso_dia ?? horasUsoPorDefecto(categoria.nombre),
          tipo_carga: tipo,
          factor_arranque: equipo.factor_arranque ?? factorArranquePorDefecto(tipo),
          isLocal: false,
        }
      })
    )

    const equiposLocalesArray = Array.from(equiposLocales.values())

    return [...equiposBackend, ...equiposLocalesArray]
  }, [categorias, equiposLocales])

  const equiposIndex = useMemo(() => {
    const map = new Map<string, EquipoWithMeta>()
    equiposConMeta.forEach((equipo) => map.set(equipo.key, equipo))
    return map
  }, [equiposConMeta])

  const categoriasPorNombre = useMemo(() => {
    const map = new Map<string, EquipoWithMeta[]>()
    equiposConMeta.forEach((equipo) => {
      const categoria = equipo.categoriaNombre
      if (!map.has(categoria)) map.set(categoria, [])
      map.get(categoria)!.push(equipo)
    })
    return map
  }, [equiposConMeta])

  useEffect(() => {
    const validKeys = new Set(equiposConMeta.map((equipo) => equipo.key))
    const pruneMap = <T,>(source: Map<string, T>) => {
      let changed = false
      const next = new Map<string, T>()
      source.forEach((value, key) => {
        if (validKeys.has(key)) next.set(key, value)
        else changed = true
      })
      if (!changed && source.size === next.size) return source
      return next
    }

    setEquiposCantidad((prev) => pruneMap(prev))
    setCantidadBuscador((prev) => pruneMap(prev))
    setHorasUsoOverride((prev) => pruneMap(prev))
  }, [equiposConMeta])

  const getHorasUso = useCallback(
    (equipo: EquipoWithMeta) => horasUsoOverride.get(equipo.key) ?? equipo.horas_uso_dia,
    [horasUsoOverride]
  )

  // Lista lista para el motor de cálculo
  const equiposParaCalculo = useMemo<EquipoCalculo[]>(() => {
    const lista: EquipoCalculo[] = []
    equiposCantidad.forEach((cantidad, key) => {
      const equipo = equiposIndex.get(key)
      if (equipo) {
        lista.push({
          potencia_kw: equipo.potencia_kw,
          energia_kwh: equipo.energia_kwh,
          horas_uso_dia: getHorasUso(equipo),
          factor_arranque: equipo.factor_arranque,
          cantidad,
        })
      }
    })
    return lista
  }, [equiposCantidad, equiposIndex, getHorasUso])

  const parametros = useMemo<ParametrosDimensionamiento>(() => {
    const base: ParametrosDimensionamiento = {
      perfil,
      tecnologiaBateria,
      horasAutonomia: horasAutonomia[0],
    }
    if (modo === "experto") {
      return {
        ...base,
        factorSimultaneidad: avanzado.factorSimultaneidad ?? undefined,
        hsp: avanzado.hsp,
        pr: avanzado.pr,
        factorPotencia: avanzado.factorPotencia,
        potenciaPanelKwp: avanzado.potenciaPanelKwp,
      }
    }
    return base
  }, [perfil, tecnologiaBateria, horasAutonomia, modo, avanzado])

  const resultado = useMemo(
    () => dimensionarSistema(equiposParaCalculo, parametros),
    [equiposParaCalculo, parametros]
  )

  const totalEquipos = equiposCantidad.size
  const tieneEquipos = totalEquipos > 0

  const categoriaOptions = useMemo(() => {
    const categoriasBackend = categorias.map((cat) => cat.nombre)
    const categoriasLocales = Array.from(
      new Set(Array.from(equiposLocales.values()).map((eq) => eq.categoriaNombre))
    ).filter((cat) => !categoriasBackend.includes(cat))
    return [...categoriasBackend, ...categoriasLocales]
  }, [categorias, equiposLocales])

  const noEquiposRegistrados = useMemo(
    () => categorias.every((categoria) => (categoria.equipos || []).length === 0) && equiposLocales.size === 0,
    [categorias, equiposLocales]
  )

  const restablecerParametros = () => {
    setEquiposCantidad(new Map())
    setCantidadBuscador(new Map())
    setEquiposLocales(new Map())
    setHorasUsoOverride(new Map())
  }

  const agregarEquipo = (equipoKey: string, cantidad = 1) => {
    if (!equiposIndex.has(equipoKey)) return
    setEquiposCantidad((prev) => {
      const next = new Map(prev)
      next.set(equipoKey, cantidad)
      return next
    })
  }

  const eliminarEquipo = (equipoKey: string) => {
    setEquiposCantidad((prev) => {
      const next = new Map(prev)
      next.delete(equipoKey)
      return next
    })
  }

  const incrementarCantidad = (equipoKey: string) => {
    setEquiposCantidad((prev) => {
      const next = new Map(prev)
      next.set(equipoKey, (next.get(equipoKey) || 0) + 1)
      return next
    })
  }

  const decrementarCantidad = (equipoKey: string) => {
    setEquiposCantidad((prev) => {
      const next = new Map(prev)
      const actual = next.get(equipoKey) || 0
      if (actual > 1) next.set(equipoKey, actual - 1)
      else next.delete(equipoKey)
      return next
    })
  }

  const actualizarHorasUso = (equipoKey: string, horas: number) => {
    setHorasUsoOverride((prev) => {
      const next = new Map(prev)
      next.set(equipoKey, Math.min(24, Math.max(0.5, horas)))
      return next
    })
  }

  const agregarDesdeBuscador = (equipoKey: string) => {
    const cantidad = Math.max(1, cantidadBuscador.get(equipoKey) || 1)
    agregarEquipo(equipoKey, cantidad)
    setCantidadBuscador((prev) => {
      const next = new Map(prev)
      next.delete(equipoKey)
      return next
    })
    setOpenBuscador(false)
    setBusqueda("")
  }

  const actualizarCantidadBuscador = (equipoKey: string, cantidad: number) => {
    setCantidadBuscador((prev) => {
      const next = new Map(prev)
      if (cantidad > 0) next.set(equipoKey, cantidad)
      else next.delete(equipoKey)
      return next
    })
  }

  const handleCreateDialogChange = (open: boolean) => {
    setIsCreateDialogOpen(open)
    if (!open) setCreateForm(createEmptyCreateForm())
  }

  const handleCreateEquipoLocal = () => {
    const nombre = createForm.nombre.trim()
    const potencia = parseFloat(createForm.potencia_kw)
    const energia = parseFloat(createForm.energia_kwh)
    const horas = parseFloat(createForm.horas_uso_dia)
    const categoriaSeleccionada =
      createForm.categoria === "otro" ? createForm.categoriaPersonalizada.trim() : createForm.categoria.trim()

    if (!nombre) {
      toast({ title: "Campos incompletos", description: "Ingresa el nombre del equipo.", variant: "destructive" })
      return
    }
    if (!categoriaSeleccionada) {
      toast({ title: "Campos incompletos", description: "Selecciona o ingresa una categoría.", variant: "destructive" })
      return
    }
    if (Number.isNaN(potencia) || potencia <= 0) {
      toast({ title: "Dato inválido", description: "La potencia debe ser un número positivo en kW.", variant: "destructive" })
      return
    }
    if (Number.isNaN(energia) || energia <= 0) {
      toast({ title: "Dato inválido", description: "El consumo debe ser un número positivo en kWh.", variant: "destructive" })
      return
    }
    const horasUso = Number.isNaN(horas) || horas <= 0 ? 4 : Math.min(24, horas)

    const categoriaId = `local-${categoriaSeleccionada.toLowerCase().replace(/\s+/g, "-")}`
    const equipoKey = getEquipoKey(categoriaId, nombre)

    if (equiposLocales.has(equipoKey) || equiposIndex.has(equipoKey)) {
      toast({ title: "Equipo duplicado", description: "Ya existe un equipo con ese nombre en esta categoría.", variant: "destructive" })
      return
    }

    const nuevoEquipo: EquipoWithMeta = {
      key: equipoKey,
      categoriaId,
      categoriaNombre: categoriaSeleccionada,
      nombre,
      potencia_kw: potencia,
      energia_kwh: energia,
      horas_uso_dia: horasUso,
      tipo_carga: createForm.tipo_carga,
      factor_arranque: factorArranquePorDefecto(createForm.tipo_carga),
      isLocal: true,
    }

    setEquiposLocales((prev) => {
      const next = new Map(prev)
      next.set(equipoKey, nuevoEquipo)
      return next
    })

    toast({ title: "Equipo agregado", description: "El equipo se agregó a tu calculadora (solo en esta sesión)." })
    handleCreateDialogChange(false)
  }

  const eliminarEquipoLocal = (equipoKey: string) => {
    setEquiposLocales((prev) => {
      const next = new Map(prev)
      next.delete(equipoKey)
      return next
    })
    setEquiposCantidad((prev) => {
      const next = new Map(prev)
      next.delete(equipoKey)
      return next
    })
    setCantidadBuscador((prev) => {
      const next = new Map(prev)
      next.delete(equipoKey)
      return next
    })
    toast({ title: "Equipo eliminado", description: "El equipo personalizado fue eliminado." })
  }

  const BackButton = () => (
    <Link
      href="/"
      className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full border border-[#AFEB17]/25 text-gray-700 hover:bg-white transition-all duration-300 group shadow-lg"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      <span className="text-sm font-semibold">Volver</span>
    </Link>
  )

  const Header = () => (
    <header className="bg-white border-b border-[#AFEB17]/25 sticky top-0 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#012928]/20 flex-shrink-0 bg-white flex items-center justify-center p-1">
              <img src="/images/logo-icon.png" alt="Suncar Logo" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-[#012928]" />
                Calculadora Solar
              </h1>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {loadingCategorias && (
              <span className="hidden md:flex items-center gap-2 text-sm text-[#012928]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Actualizando</span>
              </span>
            )}
            <Button
              onClick={restablecerParametros}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-[#AFEB17]/25 hover:bg-[#AFEB17]/5 hover:border-[#AFEB17]/40"
              disabled={totalEquipos === 0 && equiposLocales.size === 0}
            >
              <RotateCcw className="h-4 w-4 text-[#012928]" />
              <span className="hidden sm:inline">Limpiar</span>
            </Button>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              size="sm"
              className="flex items-center gap-2 bg-[#012928] hover:bg-[#011818] text-white"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Crear</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )

  if (initialLoading) {
    return (
      <>
        <BackButton />
        <div className="min-h-screen bg-[#F2F2EF]">
          <Header />
          <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 60px)" }}>
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#012928] mx-auto mb-4" />
              <p className="text-gray-600">Cargando calculadora...</p>
            </div>
          </div>
          {isChristmas ? <FooterChristmas /> : <Footer />}
        </div>
      </>
    )
  }

  const esExperto = modo === "experto"
  const factorSimAplicado = parametros.factorSimultaneidad ?? FACTOR_SIMULTANEIDAD[perfil]

  return (
    <>
      <BackButton />

      <div className="min-h-screen bg-[#F2F2EF]">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* Selector de modo */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="inline-flex rounded-full border border-[#AFEB17]/30 bg-white p-1 shadow-sm self-start">
              <button
                onClick={() => setModo("asistido")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  !esExperto ? "bg-[#012928] text-white" : "text-gray-600 hover:text-[#012928]"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Modo Asistido
              </button>
              <button
                onClick={() => setModo("experto")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  esExperto ? "bg-[#012928] text-white" : "text-gray-600 hover:text-[#012928]"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Modo Experto
              </button>
            </div>
            <p className="text-sm text-gray-600 max-w-md">
              {esExperto
                ? "Ajusta factores técnicos (simultaneidad, DoD, pérdidas, fases) y ve el detalle en kVA."
                : "Selecciona tus equipos y te decimos qué necesitas, en lenguaje sencillo."}
            </p>
          </div>

          {/* Configuración del sistema */}
          <Card className="bg-white border-[#AFEB17]/25 shadow-sm">
            <CardContent className="pt-5 sm:pt-6 space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Perfil */}
                <div>
                  <Label className="text-sm font-semibold text-gray-900">¿Dónde lo vas a instalar?</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => setPerfil("hogar")}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                        perfil === "hogar"
                          ? "border-[#AFEB17] bg-[#AFEB17]/10 text-[#012928]"
                          : "border-gray-200 text-gray-600 hover:border-[#AFEB17]/40"
                      }`}
                    >
                      <Home className="h-4 w-4" />
                      Mi casa
                    </button>
                    <button
                      onClick={() => setPerfil("empresa")}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                        perfil === "empresa"
                          ? "border-[#AFEB17] bg-[#AFEB17]/10 text-[#012928]"
                          : "border-gray-200 text-gray-600 hover:border-[#AFEB17]/40"
                      }`}
                    >
                      <Building2 className="h-4 w-4" />
                      Mi negocio
                    </button>
                  </div>
                </div>

                {/* Autonomía */}
                <div>
                  <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#012928]" />
                    ¿Cuántas horas de respaldo quieres en un apagón?
                  </Label>
                  <div className="mt-3">
                    <Slider
                      min={1}
                      max={24}
                      step={1}
                      value={horasAutonomia}
                      onValueChange={setHorasAutonomia}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 h</span>
                      <span className="font-semibold text-[#012928]">{horasAutonomia[0]} horas</span>
                      <span>24 h</span>
                    </div>
                  </div>
                </div>

                {/* Tecnología de batería */}
                <div>
                  <Label className="text-sm font-semibold text-gray-900">Tipo de batería</Label>
                  <Select value={tecnologiaBateria} onValueChange={(v) => setTecnologiaBateria(v as TecnologiaBateria)}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="litio">Litio (LiFePO4) — recomendada</SelectItem>
                      <SelectItem value="plomo">Plomo-ácido — económica</SelectItem>
                    </SelectContent>
                  </Select>
                  {esExperto && (
                    <p className="text-xs text-gray-500 mt-1">
                      Profundidad de descarga útil (DoD): {(DOD[tecnologiaBateria] * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              </div>

              {/* Parámetros avanzados (solo experto) */}
              {esExperto && (
                <div className="border-t border-[#AFEB17]/20 pt-4">
                  <button
                    onClick={() => setShowAvanzado((v) => !v)}
                    className="flex items-center gap-2 text-sm font-semibold text-[#012928] hover:opacity-80"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Parámetros avanzados
                    <ChevronDown className={`h-4 w-4 transition-transform ${showAvanzado ? "rotate-180" : ""}`} />
                  </button>
                  {showAvanzado && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      <div>
                        <Label className="text-xs text-gray-600">
                          Factor de simultaneidad (def. {FACTOR_SIMULTANEIDAD[perfil]})
                        </Label>
                        <Input
                          type="number"
                          step="0.05"
                          min="0.1"
                          max="1"
                          placeholder={String(FACTOR_SIMULTANEIDAD[perfil])}
                          value={avanzado.factorSimultaneidad ?? ""}
                          onChange={(e) =>
                            setAvanzado((p) => ({
                              ...p,
                              factorSimultaneidad: e.target.value === "" ? null : parseFloat(e.target.value),
                            }))
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Horas Sol Pico (HSP)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={avanzado.hsp}
                          onChange={(e) => setAvanzado((p) => ({ ...p, hsp: parseFloat(e.target.value) || CONSTANTES.HSP }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Performance Ratio (PR)</Label>
                        <Input
                          type="number"
                          step="0.05"
                          value={avanzado.pr}
                          onChange={(e) => setAvanzado((p) => ({ ...p, pr: parseFloat(e.target.value) || CONSTANTES.PR }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Factor de potencia</Label>
                        <Input
                          type="number"
                          step="0.05"
                          value={avanzado.factorPotencia}
                          onChange={(e) =>
                            setAvanzado((p) => ({ ...p, factorPotencia: parseFloat(e.target.value) || CONSTANTES.FACTOR_POTENCIA }))
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Potencia por panel (kWp)</Label>
                        <Input
                          type="number"
                          step="0.05"
                          value={avanzado.potenciaPanelKwp}
                          onChange={(e) =>
                            setAvanzado((p) => ({ ...p, potenciaPanelKwp: parseFloat(e.target.value) || CONSTANTES.POTENCIA_PANEL_KWP }))
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resultados del dimensionamiento */}
          {tieneEquipos ? (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sun className="h-5 w-5 text-[#F2C300]" />
                Tu sistema solar recomendado
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Inversor */}
                <Card className="border-[#AFEB17]/25 shadow-sm overflow-hidden">
                  <div className="bg-[#012928] px-4 py-3 flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-[#AFEB17]" />
                    <span className="font-semibold text-white">Inversor</span>
                  </div>
                  <CardContent className="pt-4 space-y-2">
                    <p className="text-3xl font-bold text-[#012928]">
                      {fmt(esExperto ? resultado.inversorKva : resultado.inversorKw, esExperto ? 1 : 1)}{" "}
                      <span className="text-lg font-semibold text-gray-500">{esExperto ? "kVA" : "kW"}</span>
                    </p>
                    {esExperto ? (
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Potencia continua: <b>{fmt(resultado.potenciaContinuaKw)} kW</b></p>
                        <p>Pico de arranque: <b>{fmt(resultado.potenciaPicoKw)} kW</b></p>
                        <p>Potencia instalada: {fmt(resultado.potenciaInstaladaKw)} kW</p>
                        <p>Simultaneidad: {factorSimAplicado} · FP: {parametros.factorPotencia ?? CONSTANTES.FACTOR_POTENCIA}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Capaz de mover tus equipos a la vez, con margen para el arranque de motores.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Baterías */}
                <Card className="border-[#AFEB17]/25 shadow-sm overflow-hidden">
                  <div className="bg-[#012928] px-4 py-3 flex items-center gap-2">
                    <Battery className="h-5 w-5 text-[#AFEB17]" />
                    <span className="font-semibold text-white">Baterías</span>
                  </div>
                  <CardContent className="pt-4 space-y-2">
                    <p className="text-3xl font-bold text-[#012928]">
                      {fmt(resultado.bateriaBancoKwh)} <span className="text-lg font-semibold text-gray-500">kWh</span>
                    </p>
                    {esExperto ? (
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Energía útil requerida: <b>{fmt(resultado.bateriaUtilKwh)} kWh</b></p>
                        <p>Tecnología: {tecnologiaBateria === "litio" ? "Litio" : "Plomo-ácido"} (DoD {(DOD[tecnologiaBateria] * 100).toFixed(0)}%)</p>
                        <p>Incluye pérdidas de batería e inversor.</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Para mantener tus equipos encendidos ~{horasAutonomia[0]} h durante un apagón.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Paneles */}
                <Card className="border-[#AFEB17]/25 shadow-sm overflow-hidden">
                  <div className="bg-[#012928] px-4 py-3 flex items-center gap-2">
                    <Sun className="h-5 w-5 text-[#AFEB17]" />
                    <span className="font-semibold text-white">Paneles solares</span>
                  </div>
                  <CardContent className="pt-4 space-y-2">
                    <p className="text-3xl font-bold text-[#012928]">
                      {resultado.numeroPaneles} <span className="text-lg font-semibold text-gray-500">paneles</span>
                    </p>
                    {esExperto ? (
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Potencia del campo: <b>{fmt(resultado.panelesKwp)} kWp</b></p>
                        <p>Consumo diario: {fmt(resultado.energiaDiaKwh)} kWh/día</p>
                        <p>HSP: {parametros.hsp ?? CONSTANTES.HSP} · PR: {parametros.pr ?? CONSTANTES.PR}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        ~{fmt(resultado.panelesKwp)} kWp para generar tu consumo de {fmt(resultado.energiaDiaKwh)} kWh al día.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Resumen de consumo */}
              <Card className="mt-4 border-[#AFEB17]/25 bg-gradient-to-br from-[#AFEB17]/5 to-[#F2C300]/5">
                <CardContent className="py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Equipos</p>
                    <p className="text-xl font-bold text-gray-900">{totalEquipos}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Potencia instalada</p>
                    <p className="text-xl font-bold text-gray-900 flex items-center gap-1">
                      <Cpu className="h-4 w-4 text-[#012928]" />
                      {fmt(resultado.potenciaInstaladaKw)} kW
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Consumo diario</p>
                    <p className="text-xl font-bold text-gray-900 flex items-center gap-1">
                      <Zap className="h-4 w-4 text-[#012928]" />
                      {fmt(resultado.energiaDiaKwh)} kWh
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Consumo mensual aprox.</p>
                    <p className="text-xl font-bold text-gray-900">{fmt(resultado.energiaDiaKwh * 30, 0)} kWh</p>
                  </div>
                </CardContent>
              </Card>

              <p className="text-xs text-gray-500 mt-3 flex items-start gap-1.5">
                <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                Resultado estimado de referencia. El dimensionamiento final debe confirmarlo un técnico de Suncar según tus equipos reales y la ubicación.
              </p>
            </div>
          ) : (
            <Card className="border-dashed border-[#AFEB17]/30 bg-white">
              <CardContent className="py-8 text-center">
                <Sun className="h-10 w-10 text-[#F2C300] mx-auto mb-3" />
                <p className="text-gray-700 font-medium">Agrega tus equipos para ver qué sistema necesitas</p>
                <p className="text-sm text-gray-500 mt-1">Búscalos abajo o créalos con el botón “Crear”.</p>
              </CardContent>
            </Card>
          )}

          {/* Buscador de equipos */}
          <Card className="border-[#AFEB17]/25">
            <CardContent className="pt-4 sm:pt-6">
              <Popover open={openBuscador} onOpenChange={setOpenBuscador}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openBuscador}
                    className="w-full justify-start text-left font-normal border-[#AFEB17]/25 hover:bg-[#AFEB17]/5"
                  >
                    <Search className="mr-2 h-4 w-4 shrink-0 text-[#012928]" />
                    <span className="text-gray-500">Buscar equipos...</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[90vw] sm:w-[600px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar por nombre o categoría..." value={busqueda} onValueChange={setBusqueda} />
                    <CommandList>
                      <CommandEmpty>Sin resultados para la búsqueda.</CommandEmpty>
                      {Array.from(categoriasPorNombre.entries()).map(([categoriaNombre, equipos]) => {
                        const equiposFiltrados = equipos.filter((equipo) => {
                          if (!busqueda.trim()) return true
                          const q = busqueda.toLowerCase()
                          return equipo.nombre.toLowerCase().includes(q) || categoriaNombre.toLowerCase().includes(q)
                        })
                        if (equiposFiltrados.length === 0) return null

                        return (
                          <CommandGroup key={categoriaNombre} heading={categoriaNombre}>
                            {equiposFiltrados.map((equipo) => {
                              const yaAgregado = equiposCantidad.has(equipo.key)
                              const cantidadActual = cantidadBuscador.get(equipo.key) || 1
                              return (
                                <CommandItem
                                  key={equipo.key}
                                  value={equipo.key}
                                  onSelect={() => agregarDesdeBuscador(equipo.key)}
                                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2 py-3"
                                >
                                  <div className="flex-1 w-full">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                          {equipo.nombre}
                                          {equipo.isLocal && <Badge variant="secondary" className="text-xs">Personalizado</Badge>}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {Math.round(equipo.potencia_kw * 1000)} W · consumo medio {Math.round(equipo.energia_kwh * 1000)} W
                                        </p>
                                      </div>
                                      {yaAgregado && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">Agregado</Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <div className="flex items-center gap-1">
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          actualizarCantidadBuscador(equipo.key, Math.max(1, cantidadActual - 1))
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="h-7 w-7 p-0"
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <Input
                                        type="number"
                                        min="1"
                                        value={cantidadActual}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                          e.stopPropagation()
                                          const valor = parseInt(e.target.value, 10) || 1
                                          actualizarCantidadBuscador(equipo.key, Math.max(1, valor))
                                        }}
                                        className="w-14 h-7 text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      />
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          actualizarCantidadBuscador(equipo.key, cantidadActual + 1)
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="h-7 w-7 p-0"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        agregarDesdeBuscador(equipo.key)
                                      }}
                                      size="sm"
                                      className="bg-[#012928] hover:bg-[#011818] h-7"
                                    >
                                      Agregar
                                    </Button>
                                  </div>
                                </CommandItem>
                              )
                            })}
                          </CommandGroup>
                        )
                      })}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          {categoriasError && (
            <div className="rounded-lg border border-[#AFEB17]/20 bg-red-50 px-4 py-3 text-sm text-red-700">
              {categoriasError}
            </div>
          )}

          {/* Catálogo de equipos */}
          {noEquiposRegistrados && !loadingCategorias ? (
            <Card className="border-dashed border-[#AFEB17]/25">
              <CardContent className="py-10 text-center">
                <p className="text-gray-600">No hay equipos disponibles.</p>
                <p className="text-sm text-gray-500 mt-2">Usa el botón “Crear” para agregar equipos personalizados.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Array.from(categoriasPorNombre.entries()).map(([categoriaNombre, equipos]) => {
                const icono = categoriaIconos[categoriaNombre] || "⚡️"
                return (
                  <Card key={categoriaNombre} className="border-[#AFEB17]/15">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <span>{icono}</span>
                        {categoriaNombre}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {equipos.map((equipo) => {
                          const cantidad = equiposCantidad.get(equipo.key) || 0
                          const seleccionado = cantidad > 0
                          const horasUso = getHorasUso(equipo)
                          return (
                            <div
                              key={equipo.key}
                              className={`p-3 rounded-lg border transition-colors ${
                                seleccionado ? "border-[#AFEB17]/40 bg-[#AFEB17]/5" : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                                    {equipo.nombre}
                                    {equipo.tipo_carga === "motor" && (
                                      <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-200">
                                        Motor
                                      </Badge>
                                    )}
                                    {equipo.isLocal && <Badge variant="secondary" className="text-xs">Personalizado</Badge>}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {Math.round(equipo.potencia_kw * 1000)} W · consumo medio {Math.round(equipo.energia_kwh * 1000)} W
                                  </p>
                                </div>
                                {equipo.isLocal && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                                    onClick={() => eliminarEquipoLocal(equipo.key)}
                                    aria-label={`Eliminar ${equipo.nombre}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>

                              {!seleccionado ? (
                                <Button
                                  onClick={() => agregarEquipo(equipo.key, 1)}
                                  size="sm"
                                  variant="outline"
                                  className="w-full border-[#AFEB17]/25 hover:bg-[#AFEB17]/15"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Agregar
                                </Button>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 w-16">Cantidad</span>
                                    <Button onClick={() => decrementarCantidad(equipo.key)} size="sm" variant="outline" className="h-8 w-8 p-0">
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <div className="flex-1 text-center">
                                      <span className="text-sm font-semibold">{cantidad}</span>
                                    </div>
                                    <Button onClick={() => incrementarCantidad(equipo.key)} size="sm" variant="outline" className="h-8 w-8 p-0">
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      onClick={() => eliminarEquipo(equipo.key)}
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 w-16">Horas/día</span>
                                    <Button
                                      onClick={() => actualizarHorasUso(equipo.key, horasUso - 1)}
                                      size="sm"
                                      variant="outline"
                                      className="h-8 w-8 p-0"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <div className="flex-1 text-center">
                                      <span className="text-sm font-semibold">{horasUso}</span>
                                      <span className="text-xs text-gray-400"> h</span>
                                    </div>
                                    <Button
                                      onClick={() => actualizarHorasUso(equipo.key, horasUso + 1)}
                                      size="sm"
                                      variant="outline"
                                      className="h-8 w-8 p-0"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                    <div className="h-8 w-8" />
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </main>

        {/* Crear equipo local */}
        <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogChange}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Crear equipo personalizado</DialogTitle>
              <DialogDescription>
                Este equipo solo estará disponible en esta sesión y no se guardará de forma permanente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nuevo-equipo-nombre">Nombre del equipo</Label>
                <Input
                  id="nuevo-equipo-nombre"
                  placeholder="Ej: Refrigerador Samsung 2023"
                  value={createForm.nombre}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, nombre: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nuevo-equipo-potencia">Potencia (kW)</Label>
                  <Input
                    id="nuevo-equipo-potencia"
                    type="number"
                    inputMode="decimal"
                    placeholder="Ej: 0.15"
                    min="0"
                    step="0.01"
                    value={createForm.potencia_kw}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, potencia_kw: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">1 kW = 1000 Watts</p>
                </div>
                <div>
                  <Label htmlFor="nuevo-equipo-energia">Consumo medio (kWh/h)</Label>
                  <Input
                    id="nuevo-equipo-energia"
                    type="number"
                    inputMode="decimal"
                    placeholder="Ej: 0.06"
                    min="0"
                    step="0.01"
                    value={createForm.energia_kwh}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, energia_kwh: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Consumo real por hora de uso</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nuevo-equipo-horas">Horas de uso al día</Label>
                  <Input
                    id="nuevo-equipo-horas"
                    type="number"
                    inputMode="decimal"
                    placeholder="Ej: 4"
                    min="0"
                    max="24"
                    step="0.5"
                    value={createForm.horas_uso_dia}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, horas_uso_dia: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Tipo de carga</Label>
                  <Select
                    value={createForm.tipo_carga}
                    onValueChange={(v) => setCreateForm((prev) => ({ ...prev, tipo_carga: v as TipoCarga }))}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resistiva">Resistiva (luces, TV, cargadores)</SelectItem>
                      <SelectItem value="electronica">Electrónica</SelectItem>
                      <SelectItem value="motor">Motor (aire, nevera, bomba)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Categoría</Label>
                <Select
                  value={createForm.categoria}
                  onValueChange={(value) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      categoria: value,
                      categoriaPersonalizada: value === "otro" ? prev.categoriaPersonalizada : "",
                    }))
                  }
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriaOptions.map((nombre) => (
                      <SelectItem key={nombre} value={nombre}>
                        {nombre}
                      </SelectItem>
                    ))}
                    <SelectItem value="otro">Otra categoría</SelectItem>
                  </SelectContent>
                </Select>
                {createForm.categoria === "otro" && (
                  <Input
                    className="mt-3"
                    placeholder="Nombre de la nueva categoría"
                    value={createForm.categoriaPersonalizada}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, categoriaPersonalizada: e.target.value }))}
                  />
                )}
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => handleCreateDialogChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateEquipoLocal} className="bg-[#012928] hover:bg-[#011818]">
                Crear Equipo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster />

        {isChristmas ? <FooterChristmas /> : <Footer />}
      </div>
    </>
  )
}
