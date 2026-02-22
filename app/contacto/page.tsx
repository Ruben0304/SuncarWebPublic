"use client"

import { useState, useEffect } from "react"
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react"
import Navigation from "@/components/navigation"
import NavigationChristmas from "@/components/navigation-christmas"
import Footer from "@/components/footer"
import FooterChristmas from "@/components/footer-christmas"
import dynamic from "next/dynamic"
import { isChristmasSeason } from "@/lib/christmas-utils"

// Importar el mapa dinámicamente para evitar problemas de SSR
const StaticLocationMap = dynamic(() => import('@/components/StaticLocationMap'), {
  ssr: false,
  loading: () => (
    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center text-gray-500">
        <MapPin className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">Cargando mapa...</p>
      </div>
    </div>
  )
})


export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isChristmas, setIsChristmas] = useState(false)

  useEffect(() => {
    setIsChristmas(isChristmasSeason())
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Crear mensaje para WhatsApp
    const message = `Hola! Me gustaría contactar con Suncar para:

*Nombre:* ${formData.name}
*Email:* ${formData.email}
*Teléfono:* ${formData.phone}
*Asunto:* ${formData.subject}

*Mensaje:*
${formData.message}

¡Espero su respuesta!`
    
    // Número de WhatsApp de Suncar
    const whatsappNumber = "5363962417"
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    
    setTimeout(() => {
      setIsSubmitting(false)
      // Abrir WhatsApp en una nueva ventana
      window.open(whatsappUrl, '_blank')
      setIsSubmitted(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    }, 1000)
  }

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Oficina Principal",
      content: "Calle 24 entre 1ra y 3ra, Playa\nLa Habana, Cuba",
      color: "bg-blue-500"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Teléfono",
      content: "+5363962417",
      color: "bg-green-500"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      content: "info@suncarsrl.com",
      color: "bg-purple-500"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Horarios",
      content: "Lun - Vie: 8:00 AM - 6:00 PM\nSáb: 9:00 AM - 2:00 PM",
      color: "bg-orange-500"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {isChristmas ? <NavigationChristmas /> : <Navigation />}
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-24 bg-gradient-to-br from-primary to-blue-800 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center text-white space-y-6" style={{ marginTop: '100px' }}>
            {/* <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4">
              Contáctanos
            </div> */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="block animate-fade-in-up">Hablemos Sobre</span>
              <span className="block bg-secondary-gradient bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
                Tu Proyecto Solar
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
              Nuestro equipo de expertos está listo para ayudarte a transformar tu hogar con energía solar limpia y renovable
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-white/30 rounded-full animate-bounce animation-delay-1000"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-white/20 rounded-full animate-bounce animation-delay-1200"></div>
        <div className="absolute bottom-40 left-20 w-1 h-1 bg-white/40 rounded-full animate-bounce animation-delay-800"></div>
      </section>

       {/*Contact Form & Info Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-gradient/5 rounded-full -translate-y-16 translate-x-16"></div>

              <div className="relative z-10">
                <div className="mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-primary mb-4">
                    ¿Qué necesitas?
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    Completa el formulario y te contactaremos en menos de 24 horas para ofrecerte una propuesta personalizada
                  </p>
                </div>

                {isSubmitted ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-primary mb-2">¡Mensaje Enviado!</h3>
                    <p className="text-gray-600 mb-6">
                      Gracias por contactarnos. Te responderemos muy pronto.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="px-6 py-3 bg-secondary-gradient text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                    >
                      Enviar Otro Mensaje
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                          placeholder="Tu nombre completo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Teléfono *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                          placeholder="+53 5 xxx-xxxx"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Asunto *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      >
                        <option value="">Selecciona un tema</option>
                        <option value="cotizacion">Solicitar Cotización</option>
                        <option value="instalacion">Información de Instalación</option>
                        <option value="mantenimiento">Soporte Técnico</option>
                        <option value="financiamiento">Opciones de Financiamiento</option>
                        <option value="otros">Otros</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mensaje *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 resize-none"
                        placeholder="Cuéntanos sobre tu proyecto solar, consumo eléctrico actual, ubicación de tu hogar, etc."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-6 py-4 bg-secondary-gradient text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-primary mb-4">
                  Información de Contacto
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Estamos aquí para ayudarte en cada paso hacia la independencia energética. Contáctanos por cualquiera de estos medios.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-6">
                {contactInfo.map((info, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${info.color} p-3 rounded-lg text-white flex-shrink-0`}>
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary mb-2">{info.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                          {info.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-primary mb-4">
              Nuestra Ubicación
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Visítanos en nuestra oficina principal en La Habana. Estamos ubicados estratégicamente para brindarte el mejor servicio.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <StaticLocationMap 
              lat={23.123815}
              lng={-82.424488}
              address="Calle 24, La Habana, Cuba"
              height="500px"
            />
          </div>
          
          {/* Address info below map */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 bg-gray-50 rounded-full px-6 py-3">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">Calle 24 entre 1ra y 3ra, Playa, La Habana, Cuba</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {/*<section className="py-16 lg:py-20 bg-white">*/}
      {/*  <div className="container mx-auto px-4 md:px-6 lg:px-8">*/}
      {/*    <div className="text-center mb-12">*/}
      {/*      <div className="inline-block px-4 py-2 bg-secondary-gradient text-white text-sm font-semibold rounded-full mb-4">*/}
      {/*        Preguntas Frecuentes*/}
      {/*      </div>*/}
      {/*      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">*/}
      {/*        Respuestas Rápidas*/}
      {/*      </h2>*/}
      {/*      <p className="text-gray-600 max-w-2xl mx-auto">*/}
      {/*        Las dudas más comunes sobre nuestros servicios de energía solar*/}
      {/*      </p>*/}
      {/*    </div>*/}

      {/*    <div className="max-w-3xl mx-auto space-y-4">*/}
      {/*      {[*/}
      {/*        {*/}
      {/*          question: "¿Cuánto tiempo toma la instalación?",*/}
      {/*          answer: "La instalación típica toma entre 1-3 días dependiendo del tamaño del sistema. Incluye evaluación, instalación y configuración completa."*/}
      {/*        },*/}
      {/*        {*/}
      {/*          question: "¿Qué garantía ofrecen?",*/}
      {/*          answer: "Ofrecemos 25 años de garantía en paneles solares, 10 años en inversores y 5 años en baterías. Además, garantía de instalación por 2 años."*/}
      {/*        },*/}
      {/*        {*/}
      {/*          question: "¿Funciona durante apagones?",*/}
      {/*          answer: "Sí, nuestros sistemas con baterías te permiten tener energía disponible 24/7, incluso durante cortes de electricidad."*/}
      {/*        },*/}
      {/*        {*/}
      {/*          question: "¿Cuánto puedo ahorrar?",*/}
      {/*          answer: "Nuestros clientes ahorran entre 70-90% en su factura eléctrica, dependiendo del consumo y tamaño del sistema instalado."*/}
      {/*        }*/}
      {/*      ].map((faq, index) => (*/}
      {/*        <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">*/}
      {/*          <h3 className="font-semibold text-primary mb-3">{faq.question}</h3>*/}
      {/*          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>*/}
      {/*        </div>*/}
      {/*      ))}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</section>*/}

      {isChristmas ? <FooterChristmas /> : <Footer />}
    </div>
  )
}
