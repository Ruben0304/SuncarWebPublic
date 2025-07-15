import Image from "next/image"
import LottieAnimation from "@/components/lottie-animation"
import { Star } from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

export default function HomePage() {
  const testimonials = [
    {
      name: "María González",
      location: "Lima, Perú",
      comment:
        "Excelente servicio. Los paneles solares han reducido mi factura eléctrica en un 80%. El equipo de Suncar fue muy profesional.",
      rating: 5,
    },
    {
      name: "Carlos Mendoza",
      location: "Arequipa, Perú",
      comment:
        "La instalación fue rápida y eficiente. Ya llevo 6 meses ahorrando significativamente en electricidad. Muy recomendado.",
      rating: 5,
    },
    {
      name: "Ana Rodríguez",
      location: "Trujillo, Perú",
      comment:
        "Suncar cumplió todas sus promesas. El sistema de baterías funciona perfectamente y el soporte técnico es excepcional.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-4 py-20 md:px-6 lg:px-8 lg:py-0 overflow-hidden">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Hero Text */}
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-3 lg:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight">
                  <span className="inline-block animate-fade-in-up animation-delay-200">Energía Solar</span>
                  <span className="block bg-secondary-gradient bg-clip-text text-transparent animate-fade-in-up animation-delay-400">
                    Para Tu Hogar
                  </span>
                </h1>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 animate-fade-in-up animation-delay-800">
                <button className="px-6 py-3 lg:px-8 lg:py-4 bg-secondary-gradient text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm lg:text-base">
                  Cotizar Ahora
                </button>
                <button className="px-6 py-3 lg:px-8 lg:py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-300 text-sm lg:text-base">
                  Ver Proyectos
                </button>
              </div>

              <div className="flex items-center justify-between sm:justify-start sm:gap-6 lg:gap-8 pt-3 lg:pt-4 animate-fade-in-up animation-delay-1000">
                <div className="text-center">
                  <div className="text-xl lg:text-2xl font-bold text-primary">500+</div>
                  <div className="text-xs lg:text-sm text-gray-600">Hogares Transformados</div>
                </div>
                <div className="text-center">
                  <div className="text-xl lg:text-2xl font-bold text-primary">90%</div>
                  <div className="text-xs lg:text-sm text-gray-600">Ahorro Promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-xl lg:text-2xl font-bold text-primary">5★</div>
                  <div className="text-xs lg:text-sm text-gray-600">Satisfacción</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-fade-in-right animation-delay-400">
              {/* Mobile version - rounded */}
              <div className="lg:hidden relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent z-10"></div>
                <Image
                  src="/images/hero-suncar.png"
                  alt="Logo futurista Suncar - Energía Solar"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Desktop version - large with fade effect */}
              <div className="hidden lg:block relative w-full aspect-[3/2] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent z-10"></div>
                <Image
                  src="/images/hero-suncar.png"
                  alt="Logo futurista Suncar - Energía Solar"
                  fill
                  className="object-cover object-center"
                  priority
                />
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
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-16 items-center">
            {/* Lottie Animation - Now takes more space */}
            <div className="order-2 lg:order-1 lg:col-span-3">
              <LottieAnimation />
            </div>

            {/* Content - Now takes less space */}
            <div className="order-1 lg:order-2 lg:col-span-2 space-y-4 lg:space-y-6">
              <div className="space-y-3 lg:space-y-4">
                <div className="inline-block px-3 py-1 lg:px-4 lg:py-2 bg-secondary-gradient text-white text-xs lg:text-sm font-semibold rounded-full">
                  Sobre Suncar
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                  Especialistas en Energía Solar
                </h2>
                <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                  Transformamos hogares peruanos con tecnología solar de vanguardia.
                </p>
              </div>

              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-start gap-2 lg:gap-3">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-secondary-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 lg:w-4 lg:h-4 bg-white rounded-sm"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary text-xs lg:text-sm mb-1">Paneles Premium</h3>
                    <p className="text-gray-600 text-xs lg:text-sm">Máxima eficiencia energética</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 lg:gap-3">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-secondary-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 lg:w-4 lg:h-4 bg-white rounded-sm"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary text-xs lg:text-sm mb-1">Baterías Inteligentes</h3>
                    <p className="text-gray-600 text-xs lg:text-sm">Energía 24/7 disponible</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 lg:gap-3">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-secondary-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 lg:w-4 lg:h-4 bg-white rounded-sm"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary text-xs lg:text-sm mb-1">Soporte Técnico</h3>
                    <p className="text-gray-600 text-xs lg:text-sm">Mantenimiento especializado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-block px-3 py-1 lg:px-4 lg:py-2 bg-secondary-gradient text-white text-xs lg:text-sm font-semibold rounded-full mb-3 lg:mb-4">
              Testimonios
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 lg:mb-4">
              Lo Que Dicen Nuestros Clientes
            </h2>
            <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              Miles de familias peruanas ya disfrutan de los beneficios de la energía solar con Suncar
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center gap-1 mb-3 lg:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 lg:w-5 lg:h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 mb-4 lg:mb-6 leading-relaxed text-sm lg:text-base">
                  "{testimonial.comment}"
                </p>

                <div className="border-t pt-3 lg:pt-4">
                  <div className="font-semibold text-primary text-sm lg:text-base">{testimonial.name}</div>
                  <div className="text-xs lg:text-sm text-gray-500">{testimonial.location}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="px-8 py-4 bg-secondary-gradient text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Ver Más Testimonios
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-primary">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-6 lg:space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              ¿Listo Para Ahorrar en Tu Factura Eléctrica?
            </h2>
            <p className="text-lg lg:text-xl text-blue-100">
              Obtén una cotización gratuita y descubre cuánto puedes ahorrar con energía solar
            </p>
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center">
              <button className="px-6 py-3 lg:px-8 lg:py-4 bg-secondary-gradient text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm lg:text-base">
                Cotización Gratuita
              </button>
              <button className="px-6 py-3 lg:px-8 lg:py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary transition-all duration-300 text-sm lg:text-base">
                Llamar Ahora
              </button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
