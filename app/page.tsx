"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { Star, Zap, Battery, Wrench } from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import React, { useEffect, useState } from "react"
import { useTypewriter } from "@/hooks/useTypewriter"
import { useLoadingContext } from "@/hooks/useLoadingContext"

const LottieAnimation = dynamic(() => import("@/components/lottie-animation"), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[400px] sm:min-h-[500px] lg:min-h-[700px] xl:min-h-[800px] flex items-center justify-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
})

const SuncarInteractiveGame = dynamic(() => import("@/components/SuncarInteractiveGame"), {
  ssr: false,
  loading: () => (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-3xl bg-white/5" />
      </div>
    </section>
  )
})

export default function HomePage() {
  const [count, setCount] = useState(0)
  const { isLoadingComplete } = useLoadingContext()

  // Typewriter effects sincronizados con el loader
  const blueText = useTypewriter({
    text: "Energía Solar",
    speed: 120,
    delay: 300, // Inicia casi inmediatamente después del loader
    waitForLoading: true,
    isLoadingComplete
  })

  const orangeText = useTypewriter({
    text: "Para Tu Futuro",
    speed: 120,
    delay: blueText.isComplete ? 200 : 999999,
    waitForLoading: false, // No necesita esperar al loader ya que depende del blueText
    isLoadingComplete: true
  })

  useEffect(() => {
    // Solo iniciar el contador cuando el loading haya terminado y el typewriter esté completo
    if (!isLoadingComplete || !orangeText.isComplete) return

    const startDelay = setTimeout(() => {
      let start = 0
      const end = 1200
      const incrementTime = 20 // ms
      const step = Math.ceil(end / 100) // velocidad

      const timer = setInterval(() => {
        start += step
        if (start >= end) {
          start = end
          clearInterval(timer)
        }
        setCount(start)
      }, incrementTime)

      return () => clearInterval(timer)
    }, 500) // Pequeño delay después de que termine el typewriter

    return () => clearTimeout(startDelay)
  }, [isLoadingComplete, orangeText.isComplete])

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navigation />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-4 py-24 md:px-6 lg:px-8 lg:py-0 overflow-hidden">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Hero Text */}
            <div className="space-y-6 lg:space-y-8 relative">
              <div className="space-y-3 lg:space-y-4 relative">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold text-primary leading-loose">
                  <span className="inline-block min-h-[1.2em]">
                    {blueText.displayText}
                    {!blueText.isComplete && <span className="animate-pulse">|</span>}
                  </span>
                  <span className="block bg-secondary-gradient bg-clip-text text-transparent pb-2 min-h-[1.2em]">
                    {orangeText.displayText}
                    {!orangeText.isComplete && <span className="animate-pulse text-orange-500">|</span>}
                  </span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg opacity-0" style={{animation: 'subtle-fade-in 0.8s ease-out 0.7s forwards, gentle-float 8s ease-in-out 1.9s infinite'}}>
                  Transforma tu hogar o negocio con energía limpia y renovable con
                  nuestros sistemas de paneles solares y baterías de última generación.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 opacity-0" style={{animation: 'subtle-fade-in 0.8s ease-out 0.9s forwards, gentle-float 8s ease-in-out 2.1s infinite'}}>
                <Link href="/cotizacion" className="px-6 py-3 lg:px-8 lg:py-4 bg-secondary-gradient text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm lg:text-base hover-magnetic glow-on-hover attention-grabber">
                  Cotizar Ahora
                </Link>
                <Link
                  href="/solar-survivor"
                  className="group relative px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 text-sm lg:text-base overflow-hidden transform hover:scale-105 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 animate-pulse"></div>
                  <div className="relative flex items-center gap-2 z-10">
                    <span className="relative">
                      🎮 Jugar Simulador
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>
                    </span>
                    <svg className="w-4 h-4 transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative opacity-0" style={{animation: 'subtle-fade-in 0.8s ease-out 0.4s forwards, gentle-float-image 10s ease-in-out 1.8s infinite'}}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent z-10"></div>
                <img
                  src="https://s3.suncarsrl.com/web/suncar hero.jpg"
                  alt="Logo futurista Suncar - Energía Solar"
                  width={600}
                  height={400}
                  className="w-full h-auto object-contain"
                />

                {/* Floating particles around image */}
                <div className="floating-particle particle-1" style={{ top: '10%', left: '20%' }}></div>
                <div className="floating-particle particle-2" style={{ top: '30%', right: '15%' }}></div>
                <div className="floating-particle particle-3" style={{ bottom: '20%', left: '10%' }}></div>
                <div className="floating-particle particle-4" style={{ bottom: '40%', right: '20%' }}></div>
                <div className="floating-particle particle-5" style={{ top: '60%', left: '5%' }}></div>
                <div className="floating-particle particle-6" style={{ top: '20%', right: '5%' }}></div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary-gradient rounded-full opacity-20 blur-xl animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse animation-delay-500"></div>
            </div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-secondary-gradient rounded-full animate-bounce animation-delay-1000"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-primary/30 rounded-full animate-bounce animation-delay-1200"></div>
        <div className="absolute bottom-40 left-20 w-1 h-1 bg-secondary-gradient rounded-full animate-bounce animation-delay-800"></div>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-16 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-20 items-center">
            {/* Lottie Animation - Now takes more space */}
            <div className="order-2 lg:order-1 lg:col-span-3">
              <LottieAnimation />
            </div>

            {/* Content - Now takes less space */}
            <div className="order-1 lg:order-2 lg:col-span-2 space-y-6 lg:space-y-8">
              <div className="space-y-4 lg:space-y-6">
                <div className="inline-block px-4 py-2 lg:px-6 lg:py-3 bg-secondary-gradient text-white text-sm lg:text-base font-semibold rounded-full">
                  Sobre Suncar
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight">
                  Especialistas en Energía Solar
                </h2>
                <p className="text-base lg:text-lg xl:text-xl text-gray-600 leading-relaxed">
                  Transformamos hogares y negocios cubanos con tecnología solar de vanguardia.
                </p>
              </div>

              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 bg-secondary-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary text-sm lg:text-base xl:text-lg mb-1">Paneles Premium</h3>
                    <p className="text-gray-600 text-sm lg:text-base xl:text-lg">Máxima eficiencia energética</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 bg-secondary-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                    <Battery className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary text-sm lg:text-base xl:text-lg mb-1">Baterías Inteligentes</h3>
                    <p className="text-gray-600 text-sm lg:text-base xl:text-lg">Energía 24/7 disponible</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 bg-secondary-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary text-sm lg:text-base xl:text-lg mb-1">Soporte Técnico</h3>
                    <p className="text-gray-600 text-sm lg:text-base xl:text-lg">Mantenimiento especializado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Felicity Solar Partnership Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-100/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Image Section - Left Side on Desktop */}
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                {/* Gradient overlay for elegance */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent z-10"></div>

                <img
                  src="https://s3.suncarsrl.com/web/felicityFernandoAndy.jpg"
                  alt="Colaboración Suncar con Felicity Solar - Líderes en energía fotovoltaica"
                  width={700}
                  height={500}
                  className="w-full h-auto object-cover"
                />

                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-gradient opacity-20 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 opacity-30 blur-2xl"></div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4 transform rotate-3 hover:rotate-0 transition-transform duration-300 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary-gradient rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-500">Alianza</p>
                    <p className="text-sm font-bold text-primary">Internacional</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section - Right Side on Desktop */}
            <div className="space-y-6 lg:space-y-8 order-1 lg:order-2">
              {/* Main Heading */}
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-primary leading-tight">
                  Colaboración con
                  <span className="block bg-secondary-gradient bg-clip-text text-transparent mt-2">
                    Felicity Solar
                  </span>
                </h2>
                <div className="h-1 w-24 bg-secondary-gradient rounded-full"></div>
              </div>

              {/* Description */}
              <div className="space-y-6">
                <p className="text-base lg:text-lg xl:text-xl text-gray-700 leading-relaxed">
                  Suncar ha establecido una colaboración estratégica con
                  <span className="font-bold text-primary"> Felicity Solar</span>,
                  líder mundial en soluciones de energía fotovoltaica con presencia en más de 100 países.
                  Esta alianza nos permite ofrecer a nuestros clientes acceso a tecnología de vanguardia
                  y estándares de calidad reconocidos internacionalmente.
                </p>

                <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                  Felicity Solar cuenta con más de 15 años de experiencia en la industria,
                  con capacidad de producción de 20GW y certificaciones internacionales que
                  garantizan la máxima eficiencia y durabilidad de sus productos.
                </p>

                {/* Felicity Solar Link */}
                <div className="pt-2">
                  <a
                    href="https://felicitysolar.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-orange-600 font-semibold text-base lg:text-lg transition-colors duration-300 group"
                  >
                    <span>Conocer más sobre Felicity Solar</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Suncar Game Section */}
      <SuncarInteractiveGame />

      <Footer />
    </div>
  )
}
