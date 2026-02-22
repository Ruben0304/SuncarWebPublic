"use client"

import { useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { MapPin, Zap, TrendingUp } from "lucide-react"

const SolarHeatMap = dynamic(() => import("@/components/SolarHeatMap"), {
  ssr: false,
  loading: () => (
    <div
      className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl border border-white/10 bg-slate-900"
      style={{ height: "550px" }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-400 border-t-transparent" />
        <p className="text-white/70 text-sm font-medium">Cargando mapa</p>
      </div>
    </div>
  ),
})

export default function HeatMapSection() {
  const [municipios, setMunicipios] = useState(0)

  const handleStatsLoaded = useCallback((count: number) => {
    setMunicipios(count)
  }, [])

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 lg:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-orange-300 font-semibold text-sm mb-6">
            <MapPin className="w-4 h-4" />
            <span>Cobertura Nacional</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Nuestra Huella Solar{" "}
            <span className="bg-secondary-gradient bg-clip-text text-transparent">
              en Cuba
            </span>
          </h2>

          <p className="text-base lg:text-lg text-blue-200/70 max-w-2xl mx-auto leading-relaxed">
            Mapa en tiempo real de las instalaciones solares que hemos realizado
            a lo largo del país. Cada zona de calor representa la potencia
            instalada en cada municipio.
          </p>
        </div>

        {/* Map with floating stat hub */}
        <div className="max-w-6xl mx-auto relative">
          <SolarHeatMap onStatsLoaded={handleStatsLoaded} />

          {/* Floating municipios hub - uses inline z-index to beat Leaflet's z-index */}
          {municipios > 0 && (
            <div
              className="absolute -top-5 -right-3 sm:-top-6 sm:-right-4 lg:-top-7 lg:-right-5"
              style={{ zIndex: 1000 }}
            >
              <div className="relative group">
                {/* Pulsing ring */}
                <div className="absolute inset-0 rounded-2xl bg-orange-500/30 animate-ping" style={{ animationDuration: "2s" }} />
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-400 opacity-60 blur-sm group-hover:opacity-80 transition-opacity" />

                {/* Hub card */}
                <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-2xl shadow-orange-500/30 border border-orange-400/40">
                  <div className="text-center">
                    <p className="text-white/80 text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold leading-none mb-1">
                      Municipios
                    </p>
                    <p className="text-white text-2xl sm:text-3xl lg:text-4xl font-black leading-none">
                      {municipios}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feature highlights below map */}
        <div className="mt-10 lg:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: <Zap className="w-5 h-5" />,
              title: "Energía Limpia",
              description:
                "Cada kW instalado reduce la dependencia de combustibles fósiles",
            },
            {
              icon: <MapPin className="w-5 h-5" />,
              title: "Alcance Nacional",
              description:
                "Instalaciones en múltiples provincias de la isla",
            },
            {
              icon: <TrendingUp className="w-5 h-5" />,
              title: "Crecimiento Continuo",
              description: "Nuevas instalaciones solares cada semana",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-secondary-gradient rounded-lg flex items-center justify-center text-white">
                {item.icon}
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">
                  {item.title}
                </h3>
                <p className="text-blue-200/60 text-xs leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
