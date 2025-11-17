"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Battery, ChevronRight, PlayCircle, Star, Sun, Target, Trophy, Zap } from 'lucide-react'

export default function SuncarInteractiveGame() {
  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-32 right-20 animate-bounce animation-delay-1000">
          <Sun className="w-6 h-6 text-yellow-400/40" />
        </div>
        <div className="absolute bottom-32 left-20 animate-bounce animation-delay-1500">
          <Battery className="w-6 h-6 text-green-400/40" />
        </div>
        <div className="absolute top-1/2 right-1/4 animate-bounce animation-delay-500">
          <Zap className="w-6 h-6 text-blue-400/40" />
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            La Solución de Suncar
            <span className="block bg-gradient-to-r from-[#FDB813] to-[#F26729] bg-clip-text text-transparent">
              Contra los Apagones
            </span>
          </h2>
          <p className="text-lg text-blue-100/90 max-w-3xl mx-auto mb-8">
            Tu hogar puede mantenerse iluminado, fresco y seguro aun cuando la red eléctrica falle. Diseñamos
            sistemas solares personalizados con almacenamiento inteligente para que disfrutes electricidad 24/7.
          </p>
        </div>

        <div className="max-w-6xl mx-auto mb-16 lg:mb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1 space-y-8">
              <div>
                <h3 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
                  ⚡ Descubre Cómo
                  <span className="block bg-gradient-to-r from-[#FDB813] to-[#F26729] bg-clip-text text-transparent">
                    VENCER los Apagones
                  </span>
                </h3>
                <p className="text-blue-100/90 mb-8 text-lg lg:text-xl leading-relaxed">
                  Somos tu equipo aliado para lograr independencia energética. Te acompañamos desde el estudio
                  inicial hasta la instalación y monitoreo, con soluciones pensadas para el clima cubano.
                </p>

                <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                  <div className="text-center">
                    <Target className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                    <div className="text-sm text-white font-semibold">Estudio Personalizado</div>
                  </div>
                  <div className="text-center">
                    <Trophy className="w-10 h-10 text-[#FDB813] mx-auto mb-3" />
                    <div className="text-sm text-white font-semibold">Instalación Express</div>
                  </div>
                  <div className="text-center">
                    <Star className="w-10 h-10 text-green-400 mx-auto mb-3" />
                    <div className="text-sm text-white font-semibold">Garantía Integral</div>
                  </div>
                </div>
              </div>

              <Link
                href="/solar-survivor"
                className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 text-xl flex items-center gap-3 mx-auto lg:mx-0 overflow-hidden hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 animate-pulse"></div>
                <div className="relative flex items-center gap-3 z-10">
                  <span className="relative">
                    🎮 Jugar Simulador
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>
                  </span>
                  <svg className="w-6 h-6 transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Link>
            </div>

            <div className="flex justify-center lg:justify-end order-1 lg:order-2">
              <div className="relative">
                <div className="relative w-80 h-80 sm:w-96 sm:h-96 lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem]">
                  <img
                    src="https://s3.suncarsrl.com/web/logo-juego.png"
                    alt="Solución anti-apagones de Suncar"
                    className="object-contain animate-float drop-shadow-2xl"
            
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#F26729]/20 to-[#FDB813]/20 rounded-full blur-3xl scale-75 animate-pulse" />
                <div className="absolute top-1/4 -right-8 w-3 h-3 bg-[#FDB813] rounded-full animate-bounce opacity-70" />
                <div className="absolute bottom-1/4 -left-8 w-2 h-2 bg-[#F26729] rounded-full animate-bounce animation-delay-1000 opacity-60" />
                <div className="absolute top-1/2 -right-4 w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-500 opacity-50" />
                <div className="absolute bottom-1/3 left-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse animation-delay-1500 opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
