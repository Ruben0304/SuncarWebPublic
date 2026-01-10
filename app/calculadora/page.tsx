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
  Lightbulb,
  Minus,
  Search,
  Loader2,
  Trash2,
  ArrowLeft
} from "lucide-react"
import { calculoEnergeticoService } from "@/services/api/calculoEnergeticoService"
import type { CalculoEnergeticoCategoria, CalculoEnergeticoEquipo } from "@/services/api/calculoEnergeticoService"
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

const getEquipoKey = (categoriaId: string, equipoNombre: string) => `${categoriaId}::${equipoNombre}`

type EquipoWithMeta = {
  key: string
  categoriaId: string
  categoriaNombre: string
  nombre: string
  potencia_kw: number
  energia_kwh: number
  isLocal?: boolean // Marca si es un equipo creado localmente
}

interface CreateEquipoForm {
  nombre: string
  potencia_kw: string
  energia_kwh: string
  categoria: string
  categoriaPersonalizada: string
}

const createEmptyCreateForm = (): CreateEquipoForm => ({
  nombre: "",
  potencia_kw: "",
  energia_kwh: "",
  categoria: "",
  categoriaPersonalizada: "",
})

export default function CalculadoraPage() {
  const { toast } = useToast()

  const [categorias, setCategorias] = useState<CalculoEnergeticoCategoria[]>([])
  const [equiposLocales, setEquiposLocales] = useState<Map<string, EquipoWithMeta>>(new Map())
  const [equiposCantidad, setEquiposCantidad] = useState<Map<string, number>>(new Map())
  const [showRecomendaciones, setShowRecomendaciones] = useState(false)
  const [bateriaKwh, setBateriaKwh] = useState([0])
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

  // Combinar equipos del backend con equipos locales
  const equiposConMeta = useMemo<EquipoWithMeta[]>(() => {
    const equiposBackend = categorias.flatMap((categoria) =>
      (categoria.equipos || []).map((equipo) => ({
        key: getEquipoKey(categoria.id, equipo.nombre),
        categoriaId: categoria.id,
        categoriaNombre: categoria.nombre,
        nombre: equipo.nombre,
        potencia_kw: equipo.potencia_kw,
        energia_kwh: equipo.energia_kwh,
        isLocal: false,
      }))
    )

    const equiposLocalesArray = Array.from(equiposLocales.values())

    return [...equiposBackend, ...equiposLocalesArray]
  }, [categorias, equiposLocales])

  const equiposIndex = useMemo(() => {
    const map = new Map<string, EquipoWithMeta>()
    equiposConMeta.forEach((equipo) => map.set(equipo.key, equipo))
    return map
  }, [equiposConMeta])

  // Organizar equipos por categoría (incluyendo locales)
  const categoriasPorNombre = useMemo(() => {
    const map = new Map<string, EquipoWithMeta[]>()

    equiposConMeta.forEach((equipo) => {
      const categoria = equipo.categoriaNombre
      if (!map.has(categoria)) {
        map.set(categoria, [])
      }
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
        if (validKeys.has(key)) {
          next.set(key, value)
        } else {
          changed = true
        }
      })

      if (!changed && source.size === next.size) {
        let identical = true
        source.forEach((value, key) => {
          if (next.get(key) !== value) {
            identical = false
          }
        })
        if (identical) {
          return source
        }
      }
      return next
    }

    setEquiposCantidad((prev) => pruneMap(prev))
    setCantidadBuscador((prev) => pruneMap(prev))
  }, [equiposConMeta])

  const potenciaTotalKw = useMemo(() => {
    let total = 0
    equiposCantidad.forEach((cantidad, key) => {
      const equipo = equiposIndex.get(key)
      if (equipo) {
        total += equipo.potencia_kw * cantidad
      }
    })
    return total
  }, [equiposCantidad, equiposIndex])

  const consumoRealKwh = useMemo(() => {
    let total = 0
    equiposCantidad.forEach((cantidad, key) => {
      const equipo = equiposIndex.get(key)
      if (equipo) {
        total += equipo.energia_kwh * cantidad
      }
    })
    return total
  }, [equiposCantidad, equiposIndex])

  const inversorRecomendado = potenciaTotalKw * 1.25
  const bateriaRecomendada5h = consumoRealKwh * 5
  const duracionConBateria = consumoRealKwh > 0 ? bateriaKwh[0] / consumoRealKwh : 0
  const totalEquipos = equiposCantidad.size

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
      const actual = next.get(equipoKey) || 0
      next.set(equipoKey, actual + 1)
      return next
    })
  }

  const decrementarCantidad = (equipoKey: string) => {
    setEquiposCantidad((prev) => {
      const next = new Map(prev)
      const actual = next.get(equipoKey) || 0
      if (actual > 1) {
        next.set(equipoKey, actual - 1)
      } else {
        next.delete(equipoKey)
      }
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
      if (cantidad > 0) {
        next.set(equipoKey, cantidad)
      } else {
        next.delete(equipoKey)
      }
      return next
    })
  }

  const handleOpenRecomendaciones = () => {
    setBateriaKwh([parseFloat(bateriaRecomendada5h.toFixed(2))])
    setShowRecomendaciones(true)
  }

  const handleCreateDialogChange = (open: boolean) => {
    setIsCreateDialogOpen(open)
    if (!open) {
      setCreateForm(createEmptyCreateForm())
    }
  }

  const handleCreateEquipoLocal = () => {
    const nombre = createForm.nombre.trim()
    const potencia = parseFloat(createForm.potencia_kw)
    const energia = parseFloat(createForm.energia_kwh)
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
      toast({
        title: "Dato inválido",
        description: "La potencia debe ser un número positivo en kW.",
        variant: "destructive",
      })
      return
    }

    if (Number.isNaN(energia) || energia <= 0) {
      toast({
        title: "Dato inválido",
        description: "La energía debe ser un número positivo en kWh.",
        variant: "destructive",
      })
      return
    }

    // Crear equipo local (no persistente)
    const categoriaId = `local-${categoriaSeleccionada.toLowerCase().replace(/\s+/g, "-")}`
    const equipoKey = getEquipoKey(categoriaId, nombre)

    // Verificar si ya existe
    if (equiposLocales.has(equipoKey) || equiposIndex.has(equipoKey)) {
      toast({
        title: "Equipo duplicado",
        description: "Ya existe un equipo con ese nombre en esta categoría.",
        variant: "destructive",
      })
      return
    }

    const nuevoEquipo: EquipoWithMeta = {
      key: equipoKey,
      categoriaId,
      categoriaNombre: categoriaSeleccionada,
      nombre,
      potencia_kw: potencia,
      energia_kwh: energia,
      isLocal: true,
    }

    setEquiposLocales((prev) => {
      const next = new Map(prev)
      next.set(equipoKey, nuevoEquipo)
      return next
    })

    toast({
      title: "Equipo agregado",
      description: "El equipo se agregó a tu calculadora (solo visible en esta sesión)."
    })
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

  if (initialLoading) {
    return (
      <>
        {/* Back Button */}
        <Link
          href="/"
          className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full border border-orange-200 text-gray-700 hover:bg-white transition-all duration-300 group shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold">Volver</span>
        </Link>

        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
          {/* Barra superior compacta */}
          <header className="bg-white border-b border-orange-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-orange-200 flex-shrink-0">
                  <img
                    src="/images/suncar-logo.jpeg"
                    alt="Suncar Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-orange-600" />
                    Calculadora Solar
                  </h1>
                </div>
              </Link>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 60px)' }}>
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando calculadora...</p>
          </div>
        </div>
        {isChristmas ? <FooterChristmas /> : <Footer />}
        </div>
      </>
    )
  }

  return (
    <>
      {/* Back Button */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full border border-orange-200 text-gray-700 hover:bg-white transition-all duration-300 group shadow-lg"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-semibold">Volver</span>
      </Link>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
        {/* Barra superior compacta */}
        <header className="bg-white border-b border-orange-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-orange-200 flex-shrink-0">
                <img
                  src="/images/suncar-logo.jpeg"
                  alt="Suncar Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-orange-600" />
                  Calculadora Solar
                </h1>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {loadingCategorias && (
                <span className="hidden md:flex items-center gap-2 text-sm text-orange-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Actualizando</span>
                </span>
              )}
              <Button
                onClick={restablecerParametros}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                disabled={totalEquipos === 0 && equiposLocales.size === 0}
              >
                <RotateCcw className="h-4 w-4 text-orange-600" />
                <span className="hidden sm:inline">Limpiar</span>
              </Button>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                size="sm"
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Crear</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Panel de consumo total */}
        <div className="sticky top-16 z-10 bg-gradient-to-br from-orange-50 to-yellow-50 pb-4 sm:pb-6">
          <Card className="bg-white border-orange-200 shadow-lg">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <div className="flex-1 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Potencia Total (Inversor)</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Cpu className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                        {potenciaTotalKw.toFixed(2)} kW
                      </p>
                      <p className="text-xs text-gray-500 mt-1">= {(potenciaTotalKw * 1000).toFixed(0)} Watts</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Consumo Real por Hora</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                        {consumoRealKwh.toFixed(3)} kWh
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Diario (24h): {(consumoRealKwh * 24).toFixed(2)} kWh
                      </p>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-base sm:text-lg px-3 sm:px-4 py-2 bg-white">
                  {totalEquipos} {totalEquipos === 1 ? "equipo" : "equipos"}
                </Badge>
              </div>

              {totalEquipos > 0 && (
                <div className="border-t border-orange-200 pt-4">
                  <Button
                    onClick={handleOpenRecomendaciones}
                    className="w-full bg-orange-600 hover:bg-orange-700 flex items-center justify-center gap-2"
                  >
                    <Lightbulb className="h-5 w-5" />
                    Dimensionar Sistema Solar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Buscador de equipos */}
        <div className="mb-6">
          <Card className="border-orange-200">
            <CardContent className="pt-4 sm:pt-6">
              <Popover open={openBuscador} onOpenChange={setOpenBuscador}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openBuscador}
                    className="w-full justify-start text-left font-normal border-orange-200 hover:bg-orange-50"
                  >
                    <Search className="mr-2 h-4 w-4 shrink-0 text-orange-600" />
                    <span className="text-gray-500">Buscar equipos...</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[90vw] sm:w-[600px] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Buscar por nombre o categoría..."
                      value={busqueda}
                      onValueChange={setBusqueda}
                    />
                    <CommandList>
                      <CommandEmpty>Sin resultados para la búsqueda.</CommandEmpty>
                      {Array.from(categoriasPorNombre.entries()).map(([categoriaNombre, equipos]) => {
                        const equiposFiltrados = equipos.filter((equipo) => {
                          if (!busqueda.trim()) return true
                          const busquedaLower = busqueda.toLowerCase()
                          return (
                            equipo.nombre.toLowerCase().includes(busquedaLower) ||
                            categoriaNombre.toLowerCase().includes(busquedaLower)
                          )
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
                                          {equipo.isLocal && (
                                            <Badge variant="secondary" className="text-xs">
                                              Personalizado
                                            </Badge>
                                          )}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {Math.round(equipo.potencia_kw * 1000)} W •{" "}
                                          {Math.round(equipo.energia_kwh * 1000)} W real/h
                                        </p>
                                      </div>
                                      {yaAgregado && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                          Agregado
                                        </Badge>
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
                                      className="bg-orange-600 hover:bg-orange-700 h-7"
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
        </div>

        {categoriasError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {categoriasError}
          </div>
        )}

        {/* Contenido principal */}
        <div className="space-y-6">
          {noEquiposRegistrados && !loadingCategorias ? (
            <Card className="border-dashed border-orange-200">
              <CardContent className="py-10 text-center">
                <p className="text-gray-600">No hay equipos disponibles.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Usa el botón &quot;Crear equipo&quot; para agregar equipos personalizados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Array.from(categoriasPorNombre.entries()).map(([categoriaNombre, equipos]) => {
                const icono = categoriaIconos[categoriaNombre] || "⚡️"

                return (
                  <Card key={categoriaNombre} className="border-orange-100">
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

                          return (
                            <div
                              key={equipo.key}
                              className={`p-3 rounded-lg border transition-colors ${
                                seleccionado ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                                    {equipo.nombre}
                                    {equipo.isLocal && (
                                      <Badge variant="secondary" className="text-xs">
                                        Personalizado
                                      </Badge>
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {Math.round(equipo.potencia_kw * 1000)} W •{" "}
                                    {Math.round(equipo.energia_kwh * 1000)} W real/h
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
                                  className="w-full border-orange-200 hover:bg-orange-100"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Agregar
                                </Button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Button
                                    onClick={() => decrementarCantidad(equipo.key)}
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <div className="flex-1 text-center">
                                    <span className="text-sm font-semibold">{cantidad}</span>
                                  </div>
                                  <Button
                                    onClick={() => incrementarCantidad(equipo.key)}
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                  >
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
        </div>
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
                <Label htmlFor="nuevo-equipo-potencia">Potencia instantánea (kW)</Label>
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
                <Label htmlFor="nuevo-equipo-energia">Consumo real por hora (kWh)</Label>
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
                <p className="text-xs text-gray-500 mt-1">Energía consumida por hora</p>
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
            <Button onClick={handleCreateEquipoLocal} className="bg-orange-600 hover:bg-orange-700">
              Crear Equipo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Recomendaciones */}
      <Dialog open={showRecomendaciones} onOpenChange={setShowRecomendaciones}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 pt-6 pb-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-orange-600" />
                Dimensionamiento de Sistema Solar
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              <Card className="border-orange-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-orange-600" />
                    Inversor Recomendado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Potencia del Inversor</p>
                    <p className="text-xl sm:text-2xl font-bold text-orange-600">{inversorRecomendado.toFixed(2)} kW</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Potencia base: {potenciaTotalKw.toFixed(2)} kW + 25% de margen
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">
                    ℹ️ El margen del 25% cubre picos de arranque de motores (aires acondicionados, refrigeradores) y
                    permite expansión futura.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Battery className="h-5 w-5 text-orange-600" />
                    Banco de Baterías
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Capacidad Recomendada (5 horas)</p>
                    <p className="text-xl sm:text-2xl font-bold text-orange-600">{bateriaRecomendada5h.toFixed(2)} kWh</p>
                    <p className="text-xs text-gray-500 mt-2">{consumoRealKwh.toFixed(3)} kWh/h × 5 horas de autonomía</p>
                  </div>
                  <div className="border-t border-orange-200 pt-4">
                    <Label htmlFor="bateria-kwh" className="text-xs sm:text-sm font-medium">
                      Ajustar Capacidad de Batería: {bateriaKwh[0].toFixed(2)} kWh
                    </Label>
                    <Slider
                      id="bateria-kwh"
                      min={0.5}
                      max={50}
                      step={0.5}
                      value={bateriaKwh}
                      onValueChange={setBateriaKwh}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0.5 kWh</span>
                      <span>50 kWh</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">
                      ⏱️ Duración con {bateriaKwh[0].toFixed(2)} kWh
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">{duracionConBateria.toFixed(1)} horas</p>
                    <p className="text-xs text-gray-600 mt-2">
                      Con {bateriaKwh[0].toFixed(2)} kWh de batería y un consumo real de {consumoRealKwh.toFixed(3)} kWh/h,
                      el sistema funcionará aproximadamente {duracionConBateria.toFixed(1)} horas sin red eléctrica.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="border-t border-gray-200 px-6 py-4 bg-white">
            <div className="flex justify-end">
              <Button onClick={() => setShowRecomendaciones(false)} variant="outline">
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />

      {isChristmas ? <FooterChristmas /> : <Footer />}
      </div>
    </>
  )
}
