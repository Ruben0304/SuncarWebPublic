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
import { ScrollProgress } from "@/components/ui/scroll-progress"

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

// WhatsApp Icon Component
const WhatsAppIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
)

// Google Maps Icon Component
const GoogleMapsIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C7.802 0 4.403 3.403 4.403 7.602c0 1.7.577 3.261 1.547 4.516l5.536 8.906c.18.29.51.476.864.476h.002c.354 0 .684-.186.864-.477l5.535-8.906c.97-1.255 1.547-2.816 1.547-4.516C19.597 3.403 16.198 0 12 0zm0 11.25c-2.004 0-3.631-1.627-3.631-3.631S9.996 3.988 12 3.988s3.631 1.627 3.631 3.631S14.004 11.25 12 11.25z"/>
  </svg>
)

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
      <ScrollProgress />
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

      {/* Trusted Partners Section */}
      <section className="py-16 sm:py-20 lg:py-28 bg-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-50/40 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-12 lg:mb-20">
            {/* <div className="inline-block px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-blue-100 to-orange-50 text-primary text-sm lg:text-base font-semibold rounded-full mb-4 lg:mb-6">
              Nuestros Clientes
            </div> */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 lg:mb-6">
              Confían en Nosotros
            </h2>
            <div className="h-1 w-24 bg-secondary-gradient rounded-full mx-auto mb-4"></div>
            <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Empresas líderes que han confiado en nuestra experiencia y tecnología solar de vanguardia
            </p>
          </div>

          {/* Partners Carousel */}
          <div className="relative max-w-7xl mx-auto">
            <div className="overflow-hidden">
              <div className="flex gap-8 md:gap-12 lg:gap-16 animate-scroll-infinite">
                {/* First set of logos */}
                {/* ONU */}
                <div className="flex items-center justify-center min-w-[200px] sm:min-w-[240px] lg:min-w-[280px]">
                  <div className="relative w-full h-32 sm:h-36 md:h-40 lg:h-48">
                    <img
                      src="https://s3.suncarsrl.com/partners/onu.png"
                      alt="ONU - Cliente de Suncar"
                      className="w-full h-full object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                    />
                  </div>
                </div>

                {/* Fadiar */}
                <div className="flex items-center justify-center min-w-[200px] sm:min-w-[240px] lg:min-w-[280px]">
                  <div className="relative w-full h-32 sm:h-36 md:h-40 lg:h-48">
                    <img
                      src="https://s3.suncarsrl.com/partners/fadiar.png"
                      alt="Fadiar - Cliente de Suncar"
                      className="w-full h-full object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                    />
                  </div>
                </div>

                {/* Milexus */}
                <div className="flex items-center justify-center min-w-[200px] sm:min-w-[240px] lg:min-w-[280px]">
                  <div className="relative w-full h-32 sm:h-36 md:h-40 lg:h-48">
                    <img
                      src="https://s3.suncarsrl.com/partners/milexus.png"
                      alt="Milexus - Cliente de Suncar"
                      className="w-full h-full object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                    />
                  </div>
                </div>

                {/* Mercazon */}
                <div className="flex items-center justify-center min-w-[200px] sm:min-w-[240px] lg:min-w-[280px]">
                  <div className="relative w-full h-32 sm:h-36 md:h-40 lg:h-48">
                    <img
                      src="https://s3.suncarsrl.com/partners/mercazon.png"
                      alt="Mercazon - Cliente de Suncar"
                      className="w-full h-full object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                    />
                  </div>
                </div>

                {/* Nacional */}
                <div className="flex items-center justify-center min-w-[200px] sm:min-w-[240px] lg:min-w-[280px]">
                  <div className="relative w-full h-32 sm:h-36 md:h-40 lg:h-48">
                    <img
                      src="https://s3.suncarsrl.com/partners/nacional.png"
                      alt="Nacional - Cliente de Suncar"
                      className="w-full h-full object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                    />
                  </div>
                </div>

                {/* Fournier */}
                <div className="flex items-center justify-center min-w-[200px] sm:min-w-[240px] lg:min-w-[280px]">
                  <div className="relative w-full h-32 sm:h-36 md:h-40 lg:h-48">
                    <img
                      src="https://s3.suncarsrl.com/partners/fournier.png"
                      alt="Fournier - Cliente de Suncar"
                      className="w-full h-full object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                    />
                  </div>
                </div>

                {/* Supermarket 23 */}
                <div className="flex items-center justify-center min-w-[200px] sm:min-w-[240px] lg:min-w-[280px]">
                  <div className="relative w-full h-32 sm:h-36 md:h-40 lg:h-48">
                    <img
                      src="https://s3.suncarsrl.com/partners/supermarket23.png"
                      alt="Supermarket 23 - Cliente de Suncar"
                      className="w-full h-full object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                    />
                  </div>
                </div>

                {/* Humidores */}
                <div className="flex items-center justify-center min-w-[200px] sm:min-w-[240px] lg:min-w-[280px]">
                  <div className="relative w-full h-32 sm:h-36 md:h-40 lg:h-48">
                    <img
                      src="https://s3.suncarsrl.com/partners/humidores.png"
                      alt="Humidores - Cliente de Suncar"
                      className="w-full h-full object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                    />
                  </div>
                </div>

                {/* Duplicate set for infinite scroll effect */}
                {/* ONU */}
                <div className="flex items-center justify-center min-w-[200px] sm:min-w-[240px] lg:min-w-[280px]">
                  <div className="relative w-full h-32 sm:h-36 md:h-40 lg:h-48">
                    <img
                      src="https://s3.suncarsrl.com/partners/onu.png"
                      alt="ONU - Cliente de Suncar"
                      className="w-full h-full object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                    />
                  </div>
                </div>

                {/* Fadiar */}
                <div className="flex items-center justify-center min-w-[200px] sm:min-w-[240px] lg:min-w-[280px]">
                  <div className="relative w-full h-32 sm:h-36 md:h-40 lg:h-48">
                    <img
                      src="https://s3.suncarsrl.com/partners/fadiar.png"
                      alt="Fadiar - Cliente de Suncar"
                      className="w-full h-full object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                    />
                  </div>
                </div>

                {/* Milexus */}
                <div className="flex items-center justify-center min-w-[200px] sm:min-w-[240px] lg:min-w-[280px]">
                  <div className="relative w-full h-32 sm:h-36 md:h-40 lg:h-48">
                    <img
                      src="https://s3.suncarsrl.com/partners/milexus.png"
                      alt="Milexus - Cliente de Suncar"
                      className="w-full h-full object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                    />
                  </div>
                </div>

                {/* Mercazon */}
                <div className="flex items-center justify-center min-w-[200px] sm:min-w-[240px] lg:min-w-[280px]">
                  <div className="relative w-full h-32 sm:h-36 md:h-40 lg:h-48">
                    <img
                      src="https://s3.suncarsrl.com/partners/mercazon.png"
                      alt="Mercazon - Cliente de Suncar"
                      className="w-full h-full object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                    />
                  </div>
                </div>

                {/* Nacional */}
                <div className="flex items-center justify-center min-w-[200px] sm:min-w-[240px] lg:min-w-[280px]">
                  <div className="relative w-full h-32 sm:h-36 md:h-40 lg:h-48">
                    <img
                      src="https://s3.suncarsrl.com/partners/nacional.png"
                      alt="Nacional - Cliente de Suncar"
                      className="w-full h-full object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                    />
                  </div>
                </div>

                {/* Fournier */}
                <div className="flex items-center justify-center min-w-[200px] sm:min-w-[240px] lg:min-w-[280px]">
                  <div className="relative w-full h-32 sm:h-36 md:h-40 lg:h-48">
                    <img
                      src="https://s3.suncarsrl.com/partners/fournier.png"
                      alt="Fournier - Cliente de Suncar"
                      className="w-full h-full object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                    />
                  </div>
                </div>

                {/* Supermarket 23 */}
                <div className="flex items-center justify-center min-w-[200px] sm:min-w-[240px] lg:min-w-[280px]">
                  <div className="relative w-full h-32 sm:h-36 md:h-40 lg:h-48">
                    <img
                      src="https://s3.suncarsrl.com/partners/supermarket23.png"
                      alt="Supermarket 23 - Cliente de Suncar"
                      className="w-full h-full object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                    />
                  </div>
                </div>

                {/* Humidores */}
                <div className="flex items-center justify-center min-w-[200px] sm:min-w-[240px] lg:min-w-[280px]">
                  <div className="relative w-full h-32 sm:h-36 md:h-40 lg:h-48">
                    <img
                      src="https://s3.suncarsrl.com/partners/humidores.png"
                      alt="Humidores - Cliente de Suncar"
                      className="w-full h-full object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom decorative line */}
          <div className="mt-12 lg:mt-20 flex items-center justify-center gap-2">
            <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-gray-300"></div>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-primary/30"></div>
              <div className="w-2 h-2 rounded-full bg-secondary-gradient"></div>
              <div className="w-2 h-2 rounded-full bg-primary/30"></div>
            </div>
            <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 sm:py-16 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-20 items-center">
            {/* Lottie Animation - Left side */}
            <div className="order-2 lg:order-1 lg:col-span-3">
              <LottieAnimation />
            </div>

            {/* Services Cards - Right side */}
            <div className="order-1 lg:order-2 lg:col-span-2 space-y-4 lg:space-y-6">
              <Link
                href="/productos"
                className="group block bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100 hover:border-orange-200"
              >
                <h3 className="font-bold text-primary text-xl lg:text-2xl mb-3 group-hover:text-orange-600 transition-colors">
                  Venta de Productos
                </h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                  Paneles solares, baterías, inversores y accesorios de las mejores marcas
                </p>
              </Link>

              <Link
                href="/ofertas"
                className="group block bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100 hover:border-orange-200"
              >
                <h3 className="font-bold text-primary text-xl lg:text-2xl mb-3 group-hover:text-orange-600 transition-colors">
                  Kits Completos con Instalación
                </h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                  Sistemas fotovoltaicos completos listos para instalar, con todo incluido
                </p>
              </Link>

              <div className="block bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100">
                <h3 className="font-bold text-primary text-xl lg:text-2xl mb-3">
                  Mantenimiento y Reparación
                </h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                  Servicio técnico especializado para mantener tu sistema al 100%
                </p>
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

      {/* Brands We Sell Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-white via-gray-50/50 to-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl -translate-x-1/2"></div>
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-orange-100/20 rounded-full blur-3xl translate-x-1/2"></div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left Content */}
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-4">
                <div className="inline-block px-4 py-2 bg-secondary-gradient text-white text-sm font-semibold rounded-full">
                  Tecnología Premium
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight">
                  Marcas que
                  <span className="block bg-secondary-gradient bg-clip-text text-transparent">
                    Instalamos
                  </span>
                </h2>
                <div className="h-1 w-20 bg-secondary-gradient rounded-full"></div>
              </div>

              <p className="text-base lg:text-lg text-gray-600 leading-relaxed max-w-lg">
                Trabajamos exclusivamente con las marcas líderes mundiales en tecnología solar
              </p>

              <Link
                href="/ofertas"
                className="inline-flex items-center gap-3 px-8 py-4 bg-secondary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                Ver Precios
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Right - Brands Grid with animations */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-10">
              {/* Felicity */}
              <div
                className="flex items-center justify-center opacity-0 translate-y-8"
                style={{animation: 'fade-in-up 0.8s ease-out 0.1s forwards'}}
              >
                <img
                  src="https://s3.suncarsrl.com/marcas/felicity.png"
                  alt="Felicity Solar"
                  className="w-full h-auto object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                  style={{maxHeight: '160px'}}
                />
              </div>

              {/* Must */}
              <div
                className="flex items-center justify-center opacity-0 translate-y-8"
                style={{animation: 'fade-in-up 0.8s ease-out 0.2s forwards'}}
              >
                <img
                  src="https://s3.suncarsrl.com/marcas/must.png"
                  alt="Must"
                  className="w-full h-auto object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                  style={{maxHeight: '160px'}}
                />
              </div>

              {/* Greenheiss */}
              <div
                className="flex items-center justify-center opacity-0 translate-y-8"
                style={{animation: 'fade-in-up 0.8s ease-out 0.3s forwards'}}
              >
                <img
                  src="https://s3.suncarsrl.com/marcas/greenheiss.png"
                  alt="Greenheiss"
                  className="w-full h-auto object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                  style={{maxHeight: '160px'}}
                />
              </div>

              {/* Pylontech */}
              <div
                className="flex items-center justify-center opacity-0 translate-y-8"
                style={{animation: 'fade-in-up 0.8s ease-out 0.4s forwards'}}
              >
                <img
                  src="https://s3.suncarsrl.com/marcas/pylontech.png"
                  alt="Pylontech"
                  className="w-full h-auto object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                  style={{maxHeight: '160px'}}
                />
              </div>

              {/* Huawei */}
              <div
                className="flex items-center justify-center opacity-0 translate-y-8"
                style={{animation: 'fade-in-up 0.8s ease-out 0.5s forwards'}}
              >
                <img
                  src="https://s3.suncarsrl.com/marcas/huawei.png"
                  alt="Huawei"
                  className="w-full h-auto object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                  style={{maxHeight: '160px'}}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Suncar Game Section */}
      <SuncarInteractiveGame />

      {/* Quick Contact Section */}
      <section className="py-16 lg:py-20 bg-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-orange-50/40 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
                ¿Listo para empezar?
              </h2>
              <div className="h-1 w-20 bg-secondary-gradient rounded-full mx-auto mb-4"></div>
              <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
                Contáctanos ahora y comienza tu viaje hacia la energía solar
              </p>
            </div>

            {/* Contact Cards */}
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {/* WhatsApp Card */}
              <a
                href="https://wa.me/5363962417"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-green-100"
              >
                <div className="flex items-start gap-5">
                  <div className="bg-green-500 p-4 rounded-xl text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <WhatsAppIcon size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-primary mb-2 group-hover:text-green-600 transition-colors">
                      WhatsApp
                    </h3>
                    <p className="text-gray-600 mb-3 text-sm">
                      Escríbenos directamente
                    </p>
                    <p className="text-2xl font-bold bg-secondary-gradient bg-clip-text text-transparent">
                      +53 6396 2417
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>

              {/* Location Card */}
              <a
                href="https://www.google.com/maps?q=23.123815,-82.424488"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-blue-100"
              >
                <div className="flex items-start gap-5">
                  <div className="bg-blue-500 p-4 rounded-xl text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <GoogleMapsIcon size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-primary mb-2 group-hover:text-blue-600 transition-colors">
                      Visítanos
                    </h3>
                    <p className="text-gray-600 mb-3 text-sm">
                      Ver en Google Maps
                    </p>
                    <p className="text-lg font-semibold text-primary leading-relaxed">
                      Calle 24 entre 1ra y 3ra<br />
                      Playa, La Habana
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-10">
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 text-primary hover:text-orange-600 font-semibold transition-colors duration-300 group"
              >
                <span>Ver más opciones de contacto</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
