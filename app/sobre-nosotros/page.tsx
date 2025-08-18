"use client"

export { metadata } from './metadata'

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
import Footer from "@/components/footer"

export default function SobreNosotrosPage() {
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
      <Navigation />
      
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
              <button className="px-8 py-4 bg-secondary-gradient text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 hover-magnetic glow-on-hover attention-grabber">
                Solicitar Cotización <ArrowRight className="w-4 h-4 animate-bounce-slow" />
              </button>
              <button className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-300 hover-magnetic">
                Contactar Ahora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre el Sitio Web */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-secondary-start/10 opacity-50"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-secondary-gradient rounded-full opacity-20 blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary/30 rounded-full opacity-30 blur-2xl animate-pulse animation-delay-1500"></div>
        
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block px-6 py-3 bg-secondary-gradient text-white text-sm font-semibold rounded-full mb-6 animate-fade-in-up glow-on-hover">
              Sobre el Sitio Web
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in-up animation-delay-200">
              Desarrollado con Next.js
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
              Una experiencia web moderna y eficiente, creada con las últimas tecnologías para brindarte la mejor navegación
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Información Técnica */}
              <div className="space-y-6 animate-fade-in-left animation-delay-600">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover-magnetic transition-all duration-300 hover:bg-white/15">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary-gradient rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold">⚡</span>
                    </div>
                    Tecnologías Modernas
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2 animate-fade-in-right animation-delay-800">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Next.js 15 con App Router
                    </li>
                    <li className="flex items-center gap-2 animate-fade-in-right animation-delay-900">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      React 19 con TypeScript
                    </li>
                    <li className="flex items-center gap-2 animate-fade-in-right animation-delay-1000">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Tailwind CSS con animaciones personalizadas
                    </li>
                    <li className="flex items-center gap-2 animate-fade-in-right animation-delay-1100">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Optimización SEO y rendimiento
                    </li>
                  </ul>
                </div>
              </div>

              {/* Desarrolladores */}
              <div className="space-y-6 animate-fade-in-right animation-delay-800">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover-magnetic transition-all duration-300 hover:bg-white/15 glow-on-hover">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    Equipo de Desarrollo
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Frontend Developer */}
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 animate-scale-in animation-delay-1000">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg animate-pulse-glow animation-delay-1200">
                        R
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">Rubén Hernández Acevedo</h4>
                        <p className="text-gray-400 text-sm">Frontend Developer</p>
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
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 animate-scale-in animation-delay-1200">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg animate-pulse-glow animation-delay-1400">
                        F
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">Fabián Fernández Galves</h4>
                        <p className="text-gray-400 text-sm">Backend Developer</p>
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

            {/* Mensaje final */}
            <div className="text-center mt-12 animate-fade-in-up animation-delay-1600">
              <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Este sitio web ha sido cuidadosamente diseñado y desarrollado para ofrecer una experiencia excepcional, 
                combinando diseño moderno, rendimiento optimizado y funcionalidades avanzadas para conectar mejor con nuestros clientes.
              </p>
            </div>
          </div>
        </div>

        {/* Floating code symbols */}
        <div className="absolute top-1/4 left-10 text-secondary-start/20 text-6xl font-mono animate-float animation-delay-2000">&lt;/&gt;</div>
        <div className="absolute top-3/4 right-20 text-primary/20 text-4xl font-mono animate-float animation-delay-2500">{'{}'}</div>
        <div className="absolute bottom-1/4 left-1/4 text-secondary-end/20 text-5xl font-mono animate-float animation-delay-3000">( )</div>
      </section>

      <Footer />
    </div>
  )
}