"use client"

import { useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { Zap, ZapOff } from "lucide-react"

const NightLightsMap = dynamic(() => import("@/components/NightLightsMap"), {
  ssr: false,
  loading: () => (
    <div
      className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl border border-white/10 bg-black"
      style={{ height: "500px" }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
        <p className="text-white/60 text-sm font-medium">Cargando mapa</p>
      </div>
    </div>
  ),
})

export default function BlackoutSection() {
  const [lightsOn, setLightsOn] = useState(false)
  const [municipios, setMunicipios] = useState(0)

  const handleStatsLoaded = useCallback((count: number) => {
    setMunicipios(count)
  }, [])

  return (
    <section className="py-16 lg:py-24 bg-black relative overflow-hidden">
      {/* Ambient glow when lights are on */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 pointer-events-none"
        style={{ opacity: lightsOn ? 1 : 0 }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header with switch */}
        <div className="text-center mb-10 lg:mb-14">
          {/* Title changes based on state */}
          <div className="mb-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight transition-colors duration-700">
              {lightsOn ? (
                <>
                  <span className="text-white">Cuba iluminada </span>
                  <span className="text-amber-400">con Suncar</span>
                </>
              ) : (
                <>
                  <span className="text-gray-500">Apagón </span>
                  <span className="text-gray-600">sin Suncar</span>
                </>
              )}
            </h2>
          </div>

          <p
            className="text-base lg:text-lg max-w-xl mx-auto leading-relaxed mb-8 transition-colors duration-700"
            style={{ color: lightsOn ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)" }}
          >
            {lightsOn
              ? `${municipios > 0 ? municipios + " municipios" : "Municipios"} con energía solar instalada por Suncar brillan en el mapa.`
              : "Sin energía solar, Cuba queda a oscuras. Activa el interruptor y mira el impacto de Suncar."
            }
          </p>

          {/* Power switch */}
          <div className="flex items-center justify-center gap-4">
            <ZapOff className={`w-5 h-5 transition-colors duration-500 ${lightsOn ? "text-gray-700" : "text-gray-400"}`} />

            <button
              onClick={() => setLightsOn(!lightsOn)}
              className="relative group focus:outline-none"
              aria-label={lightsOn ? "Apagar luces" : "Encender luces"}
            >
              {/* Glow behind switch when on */}
              <div
                className="absolute -inset-2 rounded-full transition-opacity duration-500"
                style={{
                  opacity: lightsOn ? 1 : 0,
                  background: "radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)",
                }}
              />

              {/* Switch track */}
              <div
                className={`relative w-20 h-10 rounded-full transition-all duration-500 border-2 ${
                  lightsOn
                    ? "bg-amber-500 border-amber-400 shadow-lg shadow-amber-500/40"
                    : "bg-gray-800 border-gray-600"
                }`}
              >
                {/* Switch knob */}
                <div
                  className={`absolute top-0.5 w-8 h-8 rounded-full transition-all duration-500 flex items-center justify-center ${
                    lightsOn
                      ? "left-[calc(100%-2.25rem)] bg-white shadow-lg"
                      : "left-0.5 bg-gray-500"
                  }`}
                >
                  <Zap
                    className={`w-4 h-4 transition-colors duration-500 ${
                      lightsOn ? "text-amber-500" : "text-gray-700"
                    }`}
                  />
                </div>
              </div>
            </button>

            <Zap className={`w-5 h-5 transition-colors duration-500 ${lightsOn ? "text-amber-400" : "text-gray-700"}`} />
          </div>
        </div>

        {/* Map */}
        <div className="max-w-6xl mx-auto">
          <NightLightsMap
            lightsOn={lightsOn}
            onStatsLoaded={handleStatsLoaded}
          />
        </div>
      </div>
    </section>
  )
}
