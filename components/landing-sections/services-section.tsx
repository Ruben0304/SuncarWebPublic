"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { ShoppingCart, Package, Store, ArrowRight, Sparkles } from "lucide-react"

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
        <section className="py-12 sm:py-16 lg:py-28 bg-gray-50 relative overflow-hidden">
            {/* Decorative gradient blobs */}
            <div className="absolute top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 -left-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    {/* Left Column - Lottie Animation */}
                    <div className="order-2 lg:order-1">
                        <LottieAnimation />
                    </div>

                    {/* Right Column - Content */}
                    <div className="order-1 lg:order-2 space-y-8">
                        {/* Header */}
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm animate-bounce">
                                <Sparkles className="w-4 h-4" />
                                <span>Encuentra tu solución</span>
                            </div>

                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary leading-tight">
                                ¿Cómo podemos ayudarte?
                            </h2>

                            <p className="text-xl text-gray-600 leading-relaxed">
                                Explora nuestras opciones y encuentra la solución solar perfecta para ti
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 max-w-lg">
                            {/* Kits Solares */}
                            <Link
                                href="/ofertas"
                                className="group flex items-center justify-between w-full px-5 py-3.5 bg-[#1a3d7a] text-white font-semibold rounded-xl hover:bg-[#153361] transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl shadow-lg relative overflow-hidden"
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-transparent to-white/10"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-base font-bold">Kits Solares</div>
                                        <div className="text-xs text-white/80">Sistemas completos con instalación llave en mano</div>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
                            </Link>

                            {/* Tienda Online */}
                            <Link
                                href="/tienda"
                                className="group flex items-center justify-between w-full px-5 py-3.5 bg-[#1a3d7a] text-white font-semibold rounded-xl hover:bg-[#153361] transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl shadow-lg relative overflow-hidden"
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-transparent to-white/10"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                                        <ShoppingCart className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-base font-bold">Tienda Online</div>
                                        <div className="text-xs text-white/80">Productos individuales con precios competitivos</div>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
                            </Link>

                            {/* Tienda Física */}
                            <Link
                                href="/productos"
                                className="group flex items-center justify-between w-full px-5 py-3.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl shadow-lg relative overflow-hidden"
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-transparent to-yellow-400/15"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                                        <Store className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-base font-bold flex items-center gap-2">
                                            Tienda Física
                                            <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">Pronto</span>
                                        </div>
                                        <div className="text-xs text-white/90">Visítanos y recibe asesoría personalizada</div>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
