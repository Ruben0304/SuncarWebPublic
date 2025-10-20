"use client"

import Link from "next/link"
import { useState } from "react"

interface ClientOfferPromptProps {
  initiallyShowDialog?: boolean
}

/**
 * CTA section inviting existing customers to unlock special offers.
 * Keep around for future marketing campaigns, but it is not rendered on the homepage right now.
 */
export function ClientOfferPrompt({ initiallyShowDialog = false }: ClientOfferPromptProps) {
  const [showOfferDialog, setShowOfferDialog] = useState(initiallyShowDialog)

  return (
    <>
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 lg:px-6 lg:py-3 bg-secondary-gradient text-white text-sm lg:text-base font-semibold rounded-full mb-6 animate-bounce">
              💰 Descuentos Especiales
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-primary">
              ¿Ya Eres Cliente de
              <span className="block bg-secondary-gradient bg-clip-text text-transparent">
                Suncar?
              </span>
            </h2>

            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Si ya has solicitado al menos un servicio con nosotros, tienes acceso a
              <span className="font-bold text-orange-600"> rebajas sustanciales</span> en
              casi todos nuestros productos y servicios.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link
                href="/cotizacion"
                className="px-6 py-3 lg:px-8 lg:py-4 bg-secondary-gradient text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm lg:text-base"
              >
                Solicitar Cotización
              </Link>
              <button
                type="button"
                className="text-primary hover:text-orange-600 font-semibold text-sm lg:text-base transition-colors duration-300"
                onClick={() => setShowOfferDialog(true)}
              >
                Soy cliente y quiero mis descuentos
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              * Descuentos válidos para clientes con al menos un servicio contratado
            </p>
          </div>
        </div>
      </section>

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
                  onClick={() => setShowOfferDialog(false)}
                >
                  🌟 Solicitar Cotización
                </Link>
                <button
                  onClick={() => setShowOfferDialog(false)}
                  className="text-gray-500 hover:text-gray-700 py-2"
                  type="button"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
