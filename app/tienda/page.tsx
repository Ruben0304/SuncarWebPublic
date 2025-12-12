"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import NavigationChristmas from "@/components/navigation-christmas"
import Footer from "@/components/footer"
import FooterChristmas from "@/components/footer-christmas"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useContactos } from "@/hooks/useContactos"
import TiendaAnimation from "@/components/TiendaAnimation"
import { isChristmasSeason } from "@/lib/christmas-utils"

export default function ProductosPage() {
  const { contactos, loading } = useContactos()
  const [isChristmas, setIsChristmas] = useState(false)

  useEffect(() => {
    setIsChristmas(isChristmasSeason())
  }, [])

  // Obtener el número de WhatsApp del primer contacto
  const defaultPhone = "+53 6 396 2417"
  const whatsappNumber = contactos.length > 0 ? contactos[0].telefono : defaultPhone

  // Limpiar el número de WhatsApp (quitar espacios y caracteres especiales)
  const cleanWhatsappNumber = whatsappNumber.replace(/\D/g, '')

  // Mensaje predefinido para WhatsApp
  const whatsappMessage = encodeURIComponent("Hola, quiero enterarme cuando abran la tienda de productos fotovoltaicos")
  const whatsappLink = `https://wa.me/${cleanWhatsappNumber}?text=${whatsappMessage}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      {isChristmas ? <NavigationChristmas /> : <Navigation />}
      <main className="pt-28 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Lottie Animation */}
          <div className="mb-12 flex justify-center">
            <div className="w-full max-w-md md:max-w-lg">
              <TiendaAnimation />
            </div>
          </div>

          {/* Content Card */}
          <div className="text-center bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-white/50 p-10 md:p-16">
            <Badge className="mx-auto mb-6 bg-secondary-gradient text-white px-4 py-1 text-sm">
              Próximamente
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              Nuestra tienda está casi lista
            </h1>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8">
            Estamos afinando los últimos detalles para abrir nuestra tienda de productos fotovoltaicos.
            Queremos ofrecerte equipos de calidad y componentes de alto rendimiento para
            que puedas impulsar tus proyectos con energía solar confiable. Muy pronto estará disponible en Esquina 42 y 21, Municipio Playa, Provincia La Habana 📍.
          </p>
          <div className="text-base text-gray-600 leading-relaxed mb-10">
            Mientras tanto, nuestro equipo está listo para asesorarte y diseñar soluciones a la medida.
            Si deseas recibir una notificación apenas abramos, escríbenos y con gusto te mantendremos al tanto.
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto rounded-2xl bg-secondary-gradient text-white font-semibold px-8 py-3 shadow-lg shadow-orange-200/60 transition-transform hover:scale-[1.02] text-center"
            >
              Avísame cuando esté listo
            </a>
            <Link
              href="/ofertas"
              className="w-full sm:w-auto rounded-2xl border border-primary/30 text-primary font-semibold px-8 py-3 hover:border-primary hover:bg-primary/5 transition-colors"
            >
              Ver kits completos
            </Link>
          </div>
          </div>
        </div>
      </main>
      {isChristmas ? <FooterChristmas /> : <Footer />}
    </div>
  )
}
