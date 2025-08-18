"use client"

import { 
  Sun, 
  Battery, 
  Wrench, 
  Calculator, 
  Home, 
  Zap, 
  Shield, 
  Clock, 
  Users, 
  Award,
  CheckCircle,
  ArrowRight
} from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import SolarCellAnimation from "@/components/SolarCellAnimation"

export default function ServicesPage() {
  const services = [
    {
      icon: <Sun className="w-8 h-8" />,
      title: "Instalación de Sistemas Fotovoltaicos",
      description: "Instalamos sistemas completos de paneles solares con inversores y baterías de almacenamiento de alta eficiencia.",
      features: [
        "Paneles monocristalinos y policristalinos de última generación",
        "Garantía en paneles de fabricantes",
        "Dos años de garantía sobre la instalación",
        "Eficiencia superior al 20%",
        "Instalación profesional certificada",
        "Tenemos equipos de 3kW, 5kW, 10kW, 25kW, 50kW",
        "Comercializamos marcas líderes como Huawei, Greenheiss, JSMCH2, Sungrow"
      ],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Battery className="w-8 h-8" />,
      title: "Sistemas de Baterías Completas",
      description: "Almacena la energía solar para tener electricidad disponible las 24 horas, incluso durante cortes de luz.",
      features: [
        "Baterías de larga duración con tecnología LiFePO4 (Litio Hierro Fosfato)",
        "Sistema de gestión inteligente",
        "Respaldo automático durante apagones",
        "Monitoreo en tiempo real",
        "Ampliable modularmente: comienza con 5kWh y escala según tus necesidades",
        "Diseñadas para operar en climas extremos (-20°C a 60°C)",
        "Incluyen software de gestión para optimizar autoconsumo y ahorro"
      ],
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: "Mantenimiento y Soporte Preventivo",
      description: "Prestamos asistencia técnica para mantener tu sistema solar funcionando a máxima capacidad.",
      features: [
        "Mantenimiento preventivo programado",
        "Limpieza profesional de paneles",
        "Diagnóstico y reparaciones",
        "Soporte técnico 24/7",
        "Atención a quejas y solicitudes"
      ],
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: <Calculator className="w-8 h-8" />,
      title: "Consultoría Energética",
      description: "Análisis completo de tu consumo eléctrico para diseñar el sistema solar perfecto para tus necesidades.",
      features: [
        "Evaluación energética personalizada",
        "Diseño de sistema optimizado",
        "Análisis de retorno de inversión",
        "Asesoría en financiamiento"
      ],
      price: "Consulta Gratuita",
      color: "from-purple-500 to-purple-600"
    }
  ]

  const processSteps = [
    {
      step: "01",
      title: "Consulta Inicial",
      description: "Evaluamos tu consumo energético y analizamos las condiciones de tu hogar para diseñar la solución perfecta."
    },
    {
      step: "02", 
      title: "Diseño del Sistema",
      description: "Creamos un diseño personalizado con la cantidad óptima de paneles y baterías dependiendo de las capacidades financieras y capacidades reales"
    },
    {
      step: "03",
      title: "Instalación Profesional", 
      description: "Nuestro equipo certificado realiza la instalación completa en dependencia de la magnitud de la instalación, cumpliendo todos los estándares de seguridad."
    },
    {
      step: "04",
      title: "Puesta en Marcha",
      description: "Configuramos y probamos todo el sistema, te enseñamos su funcionamiento y activamos las garantías."
    }
  ]

  const benefits = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Garantía Extendida",
      description: "Respaldamos tu inversión con garantías de fabricante: 25 años en paneles (JSMCH2/Greenheiss) y 10-12 años en inversores (Huawei/Sungrow)."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Equipo Certificado", 
      description: "Técnicos especializados y certificados"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Calidad Premium",
      description: "Equipos de marcas reconocidas mundialmente"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Soporte 24/7",
      description: "Asistencia técnica disponible siempre"
    }
  ]

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-8 sm:pt-24 sm:pb-12 lg:py-32 bg-gradient-to-br from-primary to-blue-800 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-16 items-center min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-96px)] lg:min-h-[85vh]">
            {/* Text Content */}
            <div className="text-center lg:text-left text-white space-y-4 sm:space-y-6 lg:space-y-8 order-1 lg:order-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="block animate-fade-in-up">Nuestros</span>
                <span className="block bg-secondary-gradient bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
                  Servicios Solares
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-blue-100 max-w-2xl mx-auto lg:mx-0 lg:max-w-none leading-relaxed animate-fade-in-up animation-delay-400">
                Energía solar integral: sistemas eficientes y sostenibles para hogares, negocios y espacios que buscan autonomía y ahorro con energía limpia, eficiente y sostenible. Maximiza el ahorro con sistemas personalizados para cada necesidad.              </p>
            </div>
            
            {/* Lottie Animation */}
            <div className="flex justify-center lg:justify-end animate-fade-in-up animation-delay-600 order-2 lg:order-2 w-full">
              <div className="relative w-full max-w-lg sm:max-w-xl lg:max-w-2xl xl:max-w-3xl">
                <SolarCellAnimation />
                {/* Glow effect behind animation */}
                <div className="absolute inset-0 bg-secondary-gradient rounded-full blur-3xl opacity-30 scale-125 -z-10"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-white/30 rounded-full animate-bounce animation-delay-1000"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-white/20 rounded-full animate-bounce animation-delay-1200"></div>
        <div className="absolute bottom-40 left-20 w-1 h-1 bg-white/40 rounded-full animate-bounce animation-delay-800"></div>
      </section>

      {/* Services Grid */}
      <section className="py-8 sm:py-12 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-secondary-gradient text-white text-sm font-semibold rounded-full mb-4">
              Servicios Principales
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">
              Todo lo que Necesitas para Tu Sistema Solar
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Desde la consulta inicial hasta el mantenimiento continuo, ofrecemos servicios completos para tu transición a la energía solar
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center text-white mb-6`}>
                  {service.icon}
                </div>
                
                <h3 className="text-xl font-bold text-primary mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                
                <div className="space-y-3 mb-6">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-primary">{service.price}</div>
                  <button className="px-6 py-3 bg-secondary-gradient text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
                    Solicitar <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-secondary-gradient text-white text-sm font-semibold rounded-full mb-4">
              Proceso de Instalación
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">
              ¿Cómo Trabajamos?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Un proceso simple y transparente que te lleva desde la consulta inicial hasta disfrutar de tu nuevo sistema solar
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-secondary-gradient rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    {step.step}
                  </div>
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gray-300 -translate-x-10"></div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-primary mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-20 bg-primary">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Por Qué Elegir Suncar?
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Más de 5 años de experiencia transformando hogares cubanos con energía solar de calidad
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-secondary-gradient rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-blue-100 text-sm">{benefit.description}</p>
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
              ¿Listo Para Comenzar Tu Transición Solar?
            </h2>
            <p className="text-lg text-gray-600">
              Obtén una consulta gratuita y descubre cómo la energía solar puede transformar tu hogar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-secondary-gradient text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Consulta Gratuita
              </button>
              <button className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-300">
                Ver Proyectos
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}