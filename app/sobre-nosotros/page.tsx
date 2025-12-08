"use client"

import { useState, useEffect } from "react"
import {
  Sun,
  Target,
  Heart,
  Users,
  Award,
  CheckCircle,
  Home,
  Building,
  Factory,
  Sprout,
  ArrowRight,
  MapPin,
  TrendingUp
} from "lucide-react"
import Navigation from "@/components/navigation"
import NavigationChristmas from "@/components/navigation-christmas"
import Footer from "@/components/footer"
import FooterChristmas from "@/components/footer-christmas"
import Link from "next/link"
import { isChristmasSeason } from "@/lib/christmas-utils"

export default function SobreNosotrosPage() {
  const [isChristmas, setIsChristmas] = useState(false)

  useEffect(() => {
    setIsChristmas(isChristmasSeason())
  }, [])
  const targetAudiences = [
    {
      icon: <Home className="w-8 h-8" />,
      title: "Hogares Familiares",
      description: "Familias que desean independencia energética y ahorro económico ante los apagones.",
      features: [
        "Seguridad energética durante apagones",
        "Ahorro a largo plazo en electricidad", 
        "Mejora de la calidad de vida",
        "Solución sostenible y duradera"
      ],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Building className="w-8 h-8" />,
      title: "Pequeñas y Medianas Empresas",
      description: "Mipymes que requieren estabilidad eléctrica para operar: cafeterías, talleres, panaderías.",
      features: [
        "Eficiencia energética para el negocio",
        "Reducción de costos operativos",
        "Respaldo ante interrupciones eléctricas",
        "Mayor productividad empresarial"
      ],
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Factory className="w-8 h-8" />,
      title: "Industrias de Alto Consumo",
      description: "Empresas con procesos que demandan gran carga energética (≥50 kVA).",
      features: [
        "Reducción de dependencia de la red",
        "Optimización operacional industrial",
        "Responsabilidad ambiental corporativa",
        "Ahorro significativo en energía"
      ],
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Sprout className="w-8 h-8" />,
      title: "Emprendedores Rurales",
      description: "Productores agrícolas, fincas y cooperativas que buscan autonomía energética.",
      features: [
        "Autonomía para maquinarias agrícolas",
        "Sistemas de riego independientes",
        "Refrigeración para productos",
        "Procesamiento sostenible"
      ],
      color: "from-orange-500 to-orange-600"
    }
  ]


  const values = [
    {
      icon: <Sun className="w-12 h-12" />,
      title: "Sostenibilidad",
      description: "Implementamos soluciones energéticas donde la sostenibilidad es nuestra operativa diaria: limpia, consciente y orientada al futuro."
    },
    {
      icon: <CheckCircle className="w-12 h-12" />,
      title: "Honestidad", 
      description: "Guiados por la honestidad en cada estudio y solución que ofrecemos a nuestros clientes."
    },
    {
      icon: <Award className="w-12 h-12" />,
      title: "Responsabilidad",
      description: "Compromiso con instalaciones precisas y mantenimiento permanente de todos nuestros sistemas."
    },
    {
      icon: <Heart className="w-12 h-12" />,
      title: "Pasión",
      description: "Integramos tecnología y creatividad con pasión para evolucionar con las necesidades reales de Cuba."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {isChristmas ? <NavigationChristmas /> : <Navigation />}
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-24 bg-gradient-to-br from-primary to-blue-800 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center text-white space-y-6" style={{ marginTop: '100px' }}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="block text-reveal animation-delay-200">Sobre</span>
              <span className="block bg-secondary-gradient bg-clip-text text-transparent text-reveal animation-delay-400 attention-grabber">
                SUNCAR
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-600">
              Instala el futuro. Somos una empresa cubana líder en soluciones de energía solar, descendiente de una compañía española con más de 5 años transformando hogares y negocios cubanos.
            </p>
          </div>
        </div>
        
        {/* Enhanced Decorative elements */}
        <div className="floating-decoration floating-decoration-1 w-4 h-4 morphing-shape opacity-30"></div>
        <div className="floating-decoration floating-decoration-2 w-6 h-6 morphing-shape opacity-20"></div>
        <div className="floating-decoration floating-decoration-3 w-3 h-3 morphing-shape opacity-40"></div>
        
        {/* Additional floating particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-white/30 rounded-full animate-bounce-slow animation-delay-1000"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-white/20 rounded-full animate-bounce-slow animation-delay-1200"></div>
        <div className="absolute bottom-40 left-20 w-1 h-1 bg-white/40 rounded-full animate-bounce-slow animation-delay-800"></div>
        <div className="absolute top-60 left-1/4 w-2 h-2 bg-secondary-gradient rounded-full animate-pulse-glow animation-delay-1400"></div>
        <div className="absolute bottom-60 right-1/3 w-4 h-4 bg-secondary-gradient rounded-full animate-pulse-glow animation-delay-1600"></div>
      </section>

      {/* Quiénes Somos Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block px-4 py-2 bg-secondary-gradient text-white text-sm font-semibold rounded-full mb-4">
              Quiénes Somos
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-6">
              Construimos Sostenibilidad, Tecnología y Futuro
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Somos SUNCAR, una empresa cubana, descendiente de una compañía española con más de cinco años de experiencia en energías renovables. Ofrecemos soluciones integrales en energía solar para hogares y negocios, trabajando con marcas líderes que garantizan tecnología confiable, eficiente y segura.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Nuestro equipo altamente capacitado y la cobertura nacional nos permiten brindar un servicio ágil y profesional en todo el país. Más que instalar sistemas, construimos sostenibilidad, tecnología y futuro. Nos distinguimos por la excelencia operativa, la atención personalizada y una visión clara: mejorar la calidad de vida mientras cuidamos del planeta.
            </p>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Misión */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover-magnetic glow-on-hover animate-fade-in-left animation-delay-400">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 animate-pulse-glow animation-delay-600">
                <Target className="w-8 h-8 animate-rotate-slow" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4 animate-fade-in-up animation-delay-800">Nuestra Misión</h3>
              <p className="text-gray-600 leading-relaxed animate-fade-in-up animation-delay-1000">
                Impulsar el uso de energías renovables en Cuba, conectando hogares y negocios con soluciones solares inteligentes, personalizadas y sostenibles; combinar tecnología, agilidad y excelencia operativa con el compromiso de colaboradores comprometidos, para ofrecer una experiencia única que transforme y eleve la calidad de vida de cada cliente.
              </p>
            </div>

            {/* Visión */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover-magnetic glow-on-hover animate-fade-in-right animation-delay-400">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white mb-6 animate-pulse-glow animation-delay-800">
                <TrendingUp className="w-8 h-8 animate-bounce-slow" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4 animate-fade-in-up animation-delay-1000">Nuestra Visión</h3>
              <p className="text-gray-600 leading-relaxed animate-fade-in-up animation-delay-1200">
                Establecer en Cuba soluciones solares inteligentes como inversión estratégica, transformando el gasto energético en rentabilidad para hogares y empresas. Encabezar el futuro energético a nivel nacional siendo líderes en soluciones renovables, inteligentes, accesibles y sostenibles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-secondary-gradient text-white text-sm font-semibold rounded-full mb-4">
              Nuestros Valores
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">
              Los Principios Que Nos Guían
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              SUNCAR implementa soluciones energéticas con valores sólidos que definen nuestra forma de trabajo y compromiso con Cuba
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center hover-magnetic">
                <div className={`w-20 h-20 bg-secondary-gradient rounded-2xl flex items-center justify-center text-white mx-auto mb-6 glow-on-hover animate-scale-in animation-delay-${200 + index * 200}`}>
                  {value.icon}
                </div>
                <h3 className={`text-lg font-bold text-primary mb-3 animate-fade-in-up animation-delay-${400 + index * 200}`}>{value.title}</h3>
                <p className={`text-gray-600 text-sm leading-relaxed animate-fade-in-up animation-delay-${600 + index * 200}`}>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Público Objetivo */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-secondary-gradient text-white text-sm font-semibold rounded-full mb-4">
              Nuestros Clientes
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">
              ¿A Quién Servimos?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ofrecemos soluciones energéticas especializadas para diferentes sectores de la economía cubana
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {targetAudiences.map((audience, index) => (
              <div key={index} className={`bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover-magnetic animate-scale-in animation-delay-${800 + index * 300}`}>
                <div className={`w-16 h-16 bg-gradient-to-br ${audience.color} rounded-2xl flex items-center justify-center text-white mb-6 glow-on-hover animate-wiggle animation-delay-${1000 + index * 300}`}>
                  {audience.icon}
                </div>
                
                <h3 className={`text-xl font-bold text-primary mb-4 animate-fade-in-up animation-delay-${1200 + index * 300}`}>{audience.title}</h3>
                <p className={`text-gray-600 mb-6 leading-relaxed animate-fade-in-up animation-delay-${1400 + index * 300}`}>{audience.description}</p>
                
                <div className="space-y-3">
                  {audience.features.map((feature, idx) => (
                    <div key={idx} className={`flex items-center gap-3 animate-fade-in-left animation-delay-${1600 + index * 300 + idx * 100}`}>
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 animate-bounce-slow" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
              ¿Quieres Formar Parte del Futuro Solar de Cuba?
            </h2>
            <p className="text-lg text-gray-600">
              Únete a las familias y empresas que ya confían en SUNCAR para su independencia energética
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cotizacion">
                <button className="px-8 py-4 bg-secondary-gradient text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 hover-magnetic glow-on-hover attention-grabber">
                  Solicitar Cotización <ArrowRight className="w-4 h-4 animate-bounce-slow" />
                </button>
              </Link>
              <Link href="/contacto">
                <button className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-300 hover-magnetic">
                  Contactar Ahora
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Link to Web Info */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
              ¿Quieres Conocer Más Sobre Este Sitio Web?
            </h2>
            <p className="text-lg text-gray-600">
              Descubre las tecnologías y el equipo detrás de este sitio web moderno
            </p>
            <Link href="/webinfo">
              <button className="px-8 py-4 bg-secondary-gradient text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 hover-magnetic glow-on-hover mx-auto">
                Ver Información del Sitio Web <ArrowRight className="w-4 h-4 animate-bounce-slow" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {isChristmas ? <FooterChristmas /> : <Footer />}
    </div>
  )
}