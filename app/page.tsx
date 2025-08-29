"use client"

import Image from "next/image"
import Link from "next/link"
import LottieAnimation from "@/components/lottie-animation"
import SuncarInteractiveGame from "@/components/SuncarInteractiveGame"
import { Star, Zap, Battery, Wrench } from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import React, { useEffect, useState } from "react"
import { useTypewriter } from "@/hooks/useTypewriter"
import { useLoadingContext } from "@/hooks/useLoadingContext"
import { useClient } from "@/hooks/useClient"

export default function HomePage() {
  const testimonials = [
    {
      name: "María González",
      location: "La Habana, Cuba",
      comment:
        "Excelente servicio. Los paneles solares han reducido mi factura eléctrica en un 80%. El equipo de Suncar fue muy profesional.",
      rating: 5,
    },
    {
      name: "Carlos Mendoza",
      location: "Santiago de Cuba, Cuba",
      comment:
        "La instalación fue rápida y eficiente. Ya llevo 6 meses ahorrando significativamente en electricidad. Muy recomendado.",
      rating: 5,
    },
    {
      name: "Ana Rodríguez",
      location: "Camagüey, Cuba",
      comment:
        "Suncar cumplió todas sus promesas. El sistema de baterías funciona perfectamente y el soporte técnico es excepcional.",
      rating: 5,
    },
  ]

  const [count, setCount] = useState(0);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const { isLoadingComplete } = useLoadingContext();
  const { isClient } = useClient();

  // Typewriter effects sincronizados con el loader
  const blueText = useTypewriter({ 
    text: "Energía Solar", 
    speed: 120, 
    delay: 300, // Inicia casi inmediatamente después del loader
    waitForLoading: true,
    isLoadingComplete
  });
  
  const orangeText = useTypewriter({ 
    text: "Para Tu Futuro", 
    speed: 120, 
    delay: blueText.isComplete ? 200 : 999999,
    waitForLoading: false, // No necesita esperar al loader ya que depende del blueText
    isLoadingComplete: true
  });

  useEffect(() => {
    // Solo iniciar el contador cuando el loading haya terminado y el typewriter esté completo
    if (!isLoadingComplete || !orangeText.isComplete) return;

    const startDelay = setTimeout(() => {
      let start = 0;
      const end = 1200;
      const incrementTime = 20; // ms
      const step = Math.ceil(end / 100); // velocidad
      
      const timer = setInterval(() => {
        start += step;
        if (start >= end) {
          start = end;
          clearInterval(timer);
        }
        setCount(start);
      }, incrementTime);
      
      return () => clearInterval(timer);
    }, 500); // Pequeño delay después de que termine el typewriter
    
    return () => clearTimeout(startDelay);
  }, [isLoadingComplete, orangeText.isComplete]);


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
                <button 
                  onClick={() => {
                    const gameUrl = process.env.NEXT_PUBLIC_GAME_URL;
                    if (gameUrl) {
                      window.open(gameUrl, '_blank');
                    }
                  }}
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
                </button>
              </div>

              {/*<div className="flex items-center justify-between sm:justify-start sm:gap-6 lg:gap-8 pt-3 lg:pt-4 opacity-0" style={{animation: 'subtle-fade-in 0.8s ease-out 1.1s forwards, gentle-float 8s ease-in-out 2.3s infinite'}}>*/}
              {/*  /!* Contador animado de kW instalados *!/*/}
              {/*  <div className="text-left w-full">*/}
              {/*    <div className="text-3xl lg:text-4xl font-bold text-primary">*/}
              {/*      {count} kW*/}
              {/*    </div>*/}
              {/*    <div className="text-xs lg:text-sm text-gray-600">Instalados hasta el momento</div>*/}
              {/*  </div>*/}
              {/*</div>*/}
            </div>

            {/* Hero Image */}
            <div className="relative opacity-0" style={{animation: 'subtle-fade-in 0.8s ease-out 0.4s forwards, gentle-float-image 10s ease-in-out 1.8s infinite'}}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent z-10"></div>
                <Image
                  src="/images/suncar hero.jpg"
                  alt="Logo futurista Suncar - Energía Solar"
                  width={600}
                  height={400}
                  className="w-full h-auto object-contain"
                  priority
                />
                
                {/* Magic stars rotating around image */}
                
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

      {/* Interactive Suncar Game Section */}
      <SuncarInteractiveGame />

      {/* Client Offers Marketing Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-block px-4 py-2 lg:px-6 lg:py-3 bg-secondary-gradient text-white text-sm lg:text-base font-semibold rounded-full mb-6 animate-bounce">
              💰 Descuentos Especiales
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-primary">
              ¿Ya Eres Cliente de 
              <span className="block bg-secondary-gradient bg-clip-text text-transparent">
                Suncar?
              </span>
            </h2>

            {/* Description */}
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Si ya has solicitado al menos un servicio con nosotros, tienes acceso a 
              <span className="font-bold text-orange-600"> rebajas sustanciales</span> en 
              casi todos nuestros productos y servicios.
            </p>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <div className="w-16 h-16 bg-secondary-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔧</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary">Mantenimiento</h3>
                <p className="text-gray-600">Hasta 40% OFF en servicios técnicos</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <div className="w-16 h-16 bg-secondary-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary">Expansiones</h3>
                <p className="text-gray-600">Descuentos especiales en ampliaciones</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <div className="w-16 h-16 bg-secondary-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔋</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary">Productos</h3>
                <p className="text-gray-600">Precios preferenciales en equipos</p>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => {
                if (isClient) {
                  window.location.href = '/ofertas';
                } else {
                  setShowOfferDialog(true);
                }
              }}
              className="group relative px-8 py-4 lg:px-12 lg:py-5 bg-secondary-gradient text-white font-bold text-lg lg:text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-3">
                <span>🎁</span>
                <span>ACCEDER A MIS DESCUENTOS</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </div>
            </button>

            {/* Small disclaimer */}
            <p className="text-sm text-gray-500 mt-4">
              * Descuentos válidos para clientes con al menos un servicio contratado
            </p>
          </div>
        </div>
      </section>

      {/* Offer Dialog for Non-Clients */}
      {showOfferDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">🔒 Descuentos para Clientes</h3>
              <p className="text-gray-600 mb-6">
                Para acceder a estos descuentos especiales necesitas haber contratado al menos un servicio con Suncar. 
                ¡Solicita tu primera cotización y únete a nuestra familia solar!
              </p>
              
              <div className="flex flex-col gap-3">
                <Link
                  href="/cotizacion"
                  className="bg-secondary-gradient text-white font-semibold py-3 px-6 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  🌟 Solicitar Cotización
                </Link>
                <button
                  onClick={() => setShowOfferDialog(false)}
                  className="text-gray-500 hover:text-gray-700 py-2"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials Section */}
      {/*<section className="py-16 lg:py-20 bg-white">*/}
      {/*  <div className="container mx-auto px-4 md:px-6 lg:px-8">*/}
      {/*    <div className="text-center mb-12 lg:mb-16">*/}
      {/*      <div className="inline-block px-3 py-1 lg:px-4 lg:py-2 bg-secondary-gradient text-white text-xs lg:text-sm font-semibold rounded-full mb-3 lg:mb-4">*/}
      {/*        Testimonios*/}
      {/*      </div>*/}
      {/*      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 lg:mb-4">*/}
      {/*        Lo Que Dicen Nuestros Clientes*/}
      {/*      </h2>*/}
      {/*                      <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">*/}
      {/*        Miles de familias y empresas cubanas ya disfrutan de los beneficios de la energía solar con Suncar*/}
      {/*      </p>*/}
      {/*    </div>*/}

      {/*    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">*/}
      {/*      {testimonials.map((testimonial, index) => (*/}
      {/*        <div*/}
      {/*          key={index}*/}
      {/*          className={`bg-gray-50 rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 hover-magnetic animate-scale-in animation-delay-${600 + index * 200}`}*/}
      {/*        >*/}
      {/*          <div className={`flex items-center gap-1 mb-3 lg:mb-4 animate-fade-in-up animation-delay-${800 + index * 200}`}>*/}
      {/*            {[...Array(testimonial.rating)].map((_, i) => (*/}
      {/*              <Star key={i} className={`w-4 h-4 lg:w-5 lg:h-5 fill-yellow-400 text-yellow-400 animate-bounce-slow animation-delay-${1000 + index * 200 + i * 100}`} />*/}
      {/*            ))}*/}
      {/*          </div>*/}

      {/*          <p className={`text-gray-700 mb-4 lg:mb-6 leading-relaxed text-sm lg:text-base animate-fade-in-up animation-delay-${1200 + index * 200}`}>*/}
      {/*            "{testimonial.comment}"*/}
      {/*          </p>*/}

      {/*          <div className={`border-t pt-3 lg:pt-4 animate-fade-in-up animation-delay-${1400 + index * 200}`}>*/}
      {/*            <div className="font-semibold text-primary text-sm lg:text-base">{testimonial.name}</div>*/}
      {/*            <div className="text-xs lg:text-sm text-gray-500">{testimonial.location}</div>*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*      ))}*/}
      {/*    </div>*/}

      {/*    <div className="text-center mt-12">*/}
      {/*      <button className="px-8 py-4 bg-secondary-gradient text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">*/}
      {/*        Ver Más Testimonios*/}
      {/*      </button>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</section>*/}

      {/* CTA Section */}
      {/*<section className="py-16 lg:py-20 bg-primary">*/}
      {/*  <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">*/}
      {/*    <div className="max-w-3xl mx-auto space-y-6 lg:space-y-8">*/}
      {/*      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">*/}
      {/*        ¿Listo Para Tu Independencia Energética?*/}
      {/*      </h2>*/}
      {/*      <p className="text-lg lg:text-xl text-blue-100">*/}
      {/*        Obtén una cotización gratuita y descubre cuánto pueden ahorrar tu hogar o empresa con energía solar*/}
      {/*      </p>*/}
      {/*      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center">*/}
      {/*        <button className="px-6 py-3 lg:px-8 lg:py-4 bg-secondary-gradient text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm lg:text-base hover-magnetic glow-on-hover attention-grabber">*/}
      {/*          Cotización Gratuita*/}
      {/*        </button>*/}
      {/*        <a */}
      {/*          href="tel:+5363962417" */}
      {/*          className="px-6 py-3 lg:px-8 lg:py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary transition-all duration-300 text-sm lg:text-base hover-magnetic inline-block text-center"*/}
      {/*        >*/}
      {/*          Llamar Ahora*/}
      {/*        </a>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</section>*/}
      <Footer />
    </div>
  )
}
