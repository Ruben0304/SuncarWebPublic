"use client"

import dynamic from "next/dynamic"
import Link from "next/link"

const LottieAnimation = dynamic(() => import("@/components/lottie-animation"), {
    ssr: false,
    loading: () => (
        <div className="w-full min-h-[400px] sm:min-h-[500px] lg:min-h-[700px] xl:min-h-[800px] flex items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    )
})

export default function ServicesSection() {
    return (
        <section className="py-12 sm:py-16 lg:py-28 bg-gray-50">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-20 items-center">
                    {/* Lottie Animation - Left side */}
                    <div className="order-2 lg:order-1 lg:col-span-3">
                        <LottieAnimation />
                    </div>

                    {/* Services Cards - Right side */}
                    <div className="order-1 lg:order-2 lg:col-span-2 space-y-4 lg:space-y-6">
                        <Link
                            href="/productos"
                            className="group block bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100 hover:border-orange-200"
                        >
                            <h3 className="font-bold text-primary text-xl lg:text-2xl mb-3 group-hover:text-orange-600 transition-colors">
                                Venta de Productos
                            </h3>
                            <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                                Paneles solares, baterías, inversores y accesorios de las mejores marcas
                            </p>
                        </Link>

                        <Link
                            href="/ofertas"
                            className="group block bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100 hover:border-orange-200"
                        >
                            <h3 className="font-bold text-primary text-xl lg:text-2xl mb-3 group-hover:text-orange-600 transition-colors">
                                Kits Completos con Instalación
                            </h3>
                            <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                                Sistemas fotovoltaicos completos listos para instalar, con todo incluido
                            </p>
                        </Link>

                        <div className="block bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100">
                            <h3 className="font-bold text-primary text-xl lg:text-2xl mb-3">
                                Mantenimiento y Reparación
                            </h3>
                            <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                                Servicio técnico especializado para mantener tu sistema al 100%
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
