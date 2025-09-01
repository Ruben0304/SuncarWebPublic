"use client"

import { 
  CheckCircle,
  Users,
  ArrowLeft
} from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import Link from "next/link"
import Image from "next/image"

export default function WebInfoPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-secondary-start/10 opacity-50"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-secondary-gradient rounded-full opacity-20 blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary/30 rounded-full opacity-30 blur-2xl animate-pulse animation-delay-1500"></div>
        
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white space-y-6" style={{ marginTop: '100px' }}>
            <div className="inline-block px-6 py-3 bg-secondary-gradient text-white text-sm font-semibold rounded-full mb-6 animate-fade-in-up glow-on-hover">
              Sobre el Sitio Web
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="block text-reveal animation-delay-200">Desarrollado con</span>
              <span className="block bg-secondary-gradient bg-clip-text text-transparent text-reveal animation-delay-400 attention-grabber">
                Next.js
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-600">
              Una experiencia web moderna y eficiente, creada con las últimas tecnologías para brindarte la mejor navegación
            </p>
          </div>
        </div>
        
        {/* Floating code symbols */}
        <div className="absolute top-1/4 left-10 text-secondary-start/20 text-6xl font-mono animate-float animation-delay-2000">&lt;/&gt;</div>
        <div className="absolute top-3/4 right-20 text-primary/20 text-4xl font-mono animate-float animation-delay-2500">{'{}'}</div>
        <div className="absolute bottom-1/4 left-1/4 text-secondary-end/20 text-5xl font-mono animate-float animation-delay-3000">( )</div>
      </section>

      {/* Technical Information and Team */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="items-center">


              {/* Desarrolladores */}
              <div className="space-y-6 animate-fade-in-right animation-delay-600">
                <div className="bg-gray-50 rounded-2xl p-6 hover-magnetic transition-all duration-300 hover:bg-gray-100 shadow-lg glow-on-hover">
                  <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    Equipo de Desarrollo
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Frontend Developer */}
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl hover:bg-gray-100 transition-all duration-300 animate-scale-in animation-delay-800 shadow-sm">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <Image 
                          src="https://github.com/Ruben0304.png" 
                          alt="Rubén Hernández Acevedo"
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-gray-900 font-semibold">Rubén Hernández Acevedo</h4>
                        <p className="text-gray-600 text-sm">Frontend Developer</p>
                      </div>
                      <a 
                        href="https://github.com/Ruben0304" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 glow-on-hover"
                      >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                    </div>

                    {/* Backend Developer */}
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl hover:bg-gray-100 transition-all duration-300 animate-scale-in animation-delay-1000 shadow-sm">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <Image 
                          src="https://github.com/Fabian1820.png" 
                          alt="Fabián Fernández Galvez"
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-gray-900 font-semibold">Fabián Fernández Galves</h4>
                        <p className="text-gray-600 text-sm">Backend Developer</p>
                      </div>
                      <a 
                        href="https://github.com/Fabian1820" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 glow-on-hover"
                      >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Message */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
              Diseñado Para La Excelencia
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Este sitio web ha sido cuidadosamente diseñado y desarrollado para ofrecer una experiencia excepcional, 
              combinando diseño moderno, rendimiento optimizado y funcionalidades avanzadas para conectar mejor con nuestros clientes.
            </p>
            <p className="text-base text-gray-600 leading-relaxed">
              Utilizamos las tecnologías más modernas del desarrollo web para garantizar una navegación fluida, 
              tiempos de carga rápidos y una experiencia de usuario excepcional en todos los dispositivos.
            </p>
            
            {/* Back to About Button */}
            <div className="pt-8">
              <Link href="/sobre-nosotros">
                <button className="px-8 py-4 bg-primary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 hover-magnetic mx-auto">
                  <ArrowLeft className="w-4 h-4" />
                  Volver a Sobre Nosotros
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}