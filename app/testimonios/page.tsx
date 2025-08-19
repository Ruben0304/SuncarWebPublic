"use client"

import { useState } from "react"
import { Star, Quote, Users, Award, TrendingUp, Heart, Filter, Search } from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import Link from "next/link"

export default function TestimonialsPage() {
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")

  const testimonials = [
    {
      id: 1,
      name: "María González",
      location: "Vedado, La Habana",
      category: "residencial",
      comment: "Excelente servicio de principio a fin. Los paneles solares han reducido mi factura eléctrica en un 85%. El equipo de Suncar fue muy profesional durante toda la instalación y el seguimiento post-instalación ha sido impecable. Recomiendo totalmente sus servicios.",
      rating: 5,
      image: "/images/testimonial-1.jpg",
      systemSize: "6.5 kW",
      savings: "85%",
      installDate: "Marzo 2024"
    },
    {
      id: 2,
      name: "Carlos Mendoza",
      location: "Santiago de Cuba",
      category: "residencial", 
      comment: "La instalación fue rápida y eficiente. Ya llevo 8 meses ahorrando significativamente en electricidad. El sistema de baterías funciona perfectamente durante los apagones. Muy satisfecho con la inversión y el servicio de Suncar.",
      rating: 5,
      image: "/images/testimonial-2.jpg",
      systemSize: "4.2 kW",
      savings: "78%",
      installDate: "Enero 2024"
    },
    {
      id: 3,
      name: "Ana Rodríguez",
      location: "Camagüey",
      category: "residencial",
      comment: "Suncar cumplió todas sus promesas. El sistema de baterías funciona perfectamente y el soporte técnico es excepcional. Mi familia y yo estamos muy contentos con los resultados. La independencia energética que hemos logrado no tiene precio.",
      rating: 5,
      image: "/images/testimonial-3.jpg", 
      systemSize: "8.0 kW",
      savings: "92%",
      installDate: "Febrero 2024"
    },
    {
      id: 4,
      name: "Roberto Pérez",
      location: "Holguín",
      category: "comercial",
      comment: "Para mi pequeño negocio, la instalación solar de Suncar ha sido una excelente inversión. Los costos operativos han bajado drásticamente y la confiabilidad del sistema es extraordinaria. El retorno de inversión se está cumpliendo según lo proyectado.",
      rating: 5,
      image: "/images/testimonial-4.jpg",
      systemSize: "12.5 kW", 
      savings: "88%",
      installDate: "Diciembre 2023"
    },
    {
      id: 5,
      name: "Luisa Fernández",
      location: "Matanzas",
      category: "residencial",
      comment: "El equipo de Suncar es altamente profesional. Desde la evaluación inicial hasta la instalación final, todo fue perfecto. El monitoreo en tiempo real me permite ver exactamente cuánta energía estoy generando y ahorrando cada día.",
      rating: 5,
      image: "/images/testimonial-5.jpg",
      systemSize: "5.8 kW",
      savings: "81%",
      installDate: "Abril 2024"
    },
    {
      id: 6,
      name: "José Martínez",
      location: "Villa Clara",
      category: "residencial",
      comment: "Llevamos más de un año con nuestro sistema solar y estamos encantados. La calidad de los equipos es excelente y el mantenimiento ha sido mínimo. Suncar nos ofreció la mejor propuesta del mercado con un servicio post-venta excepcional.",
      rating: 5,
      image: "/images/testimonial-6.jpg",
      systemSize: "7.2 kW",
      savings: "86%",
      installDate: "Febrero 2023"
    },
    {
      id: 7,
      name: "Carmen López",
      location: "Cienfuegos", 
      category: "residencial",
      comment: "La experiencia con Suncar ha superado todas mis expectativas. No solo he reducido significativamente mis gastos en electricidad, sino que también contribuyo al cuidado del medio ambiente. El sistema funciona de maravilla incluso en días nublados.",
      rating: 5,
      image: "/images/testimonial-7.jpg",
      systemSize: "6.0 kW",
      savings: "79%",
      installDate: "Mayo 2024"
    },
    {
      id: 8,
      name: "Eduardo Silva",
      location: "Pinar del Río",
      category: "comercial",
      comment: "Como dueño de un taller mecánico, necesitaba una solución energética confiable y económica. Suncar me proporcionó exactamente lo que necesitaba. El sistema se paga solo con los ahorros generados y la productividad de mi negocio ha mejorado.",
      rating: 5,
      image: "/images/testimonial-8.jpg",
      systemSize: "15.0 kW",
      savings: "90%", 
      installDate: "Noviembre 2023"
    },
    {
      id: 9,
      name: "Isabel Hernández",
      location: "Granma",
      category: "residencial",
      comment: "Mi experiencia con Suncar ha sido fantástica. El proceso de instalación fue muy organizado y profesional. Los técnicos explicaron todo detalladamente y me enseñaron cómo monitorear el sistema. Estoy muy satisfecha con los resultados.",
      rating: 5,
      image: "/images/testimonial-9.jpg",
      systemSize: "4.8 kW",
      savings: "83%",
      installDate: "Junio 2024"
    }
  ]

  const stats = [
    {
      icon: <Users className="w-8 h-8" />,
      number: "500+",
      label: "Clientes Satisfechos",
      description: "Familias que confían en Suncar"
    },
    {
      icon: <Award className="w-8 h-8" />,
      number: "4.9/5",
      label: "Calificación Promedio", 
      description: "Basada en reseñas verificadas"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      number: "85%",
      label: "Ahorro Promedio",
      description: "Reducción en factura eléctrica"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      number: "98%", 
      label: "Recomendación",
      description: "Clientes que nos recomiendan"
    }
  ]

  const categories = [
    { id: "todos", label: "Todos", count: testimonials.length },
    { id: "residencial", label: "Residencial", count: testimonials.filter(t => t.category === "residencial").length },
    { id: "comercial", label: "Comercial", count: testimonials.filter(t => t.category === "comercial").length }
  ]

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesCategory = selectedCategory === "todos" || testimonial.category === selectedCategory
    const matchesSearch = testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.comment.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-24 bg-gradient-to-br from-primary to-blue-800 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center text-white space-y-6" style={{ marginTop: '100px' }}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="block animate-fade-in-up">Lo Que Dicen</span>
              <span className="block bg-secondary-gradient bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
                Nuestros Clientes
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
              Historias reales de familias cubanas que han transformado sus hogares con energía solar y han logrado independencia energética
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-white/30 rounded-full animate-bounce animation-delay-1000"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-white/20 rounded-full animate-bounce animation-delay-1200"></div>
        <div className="absolute bottom-40 left-20 w-1 h-1 bg-white/40 rounded-full animate-bounce animation-delay-800"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-secondary-gradient rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-800 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Categories */}
            <div className="flex flex-wrap gap-3">
              <Filter className="w-5 h-5 text-gray-500 mt-2" />
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-secondary-gradient text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full lg:w-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTestimonials.map((testimony) => (
              <div
                key={testimony.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-secondary-gradient rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {testimony.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-primary text-lg">{testimony.name}</div>
                      <div className="text-sm text-gray-500">{testimony.location}</div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimony.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="relative">
                    <Quote className="w-8 h-8 text-primary/20 absolute -top-2 -left-2" />
                    <p className="text-gray-700 leading-relaxed text-sm pl-6">
                      "{testimony.comment}"
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-gray-50 px-6 py-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary">{testimony.systemSize}</div>
                      <div className="text-xs text-gray-600">Sistema</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{testimony.savings}</div>
                      <div className="text-xs text-gray-600">Ahorro</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">{testimony.installDate}</div>
                      <div className="text-xs text-gray-600">Instalación</div>
                    </div>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    testimony.category === 'residencial' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {testimony.category === 'residencial' ? 'Residencial' : 'Comercial'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* No results */}
          {filteredTestimonials.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No se encontraron testimonios</h3>
              <p className="text-gray-500">Intenta con otros términos de búsqueda o filtros</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-primary">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              ¿Quieres Ser Nuestro Próximo Cliente Satisfecho?
            </h2>
            <p className="text-lg text-blue-100">
              Únete a cientos de familias cubanas que ya disfrutan de los beneficios de la energía solar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cotizacion">
                <button className="px-8 py-4 bg-secondary-gradient text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Solicitar Cotización
                </button>
              </Link>
              <Link href="/servicios">
                <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary transition-all duration-300">
                  Ver Servicios
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