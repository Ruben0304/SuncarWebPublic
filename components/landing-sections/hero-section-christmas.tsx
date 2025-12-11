"use client"

import Link from "next/link"
import dynamic from "next/dynamic"

const SolarHouseModel = dynamic(() => import("@/components/solar-house-model"), {
    ssr: false,
    loading: () => (
        <div className="w-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px]" />
    )
})

interface HeroSectionProps {
    blueText: {
        displayText: string
        isComplete: boolean
    }
    orangeText: {
        displayText: string
        isComplete: boolean
    }
}

export default function HeroSectionChristmas({ blueText, orangeText }: HeroSectionProps) {
    return (
        <section className="relative min-h-screen flex items-center px-4 py-24 md:px-6 lg:px-8 lg:py-0 overflow-hidden bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-950">
            <div className="container mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Hero Text - Elegant Christmas themed */}
                    <div className="space-y-6 lg:space-y-8 relative">
                        {/* Christmas greeting badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 backdrop-blur-sm border border-red-400/20 rounded-full text-sm text-yellow-200 font-medium">
                            <span>🎄 Feliz Navidad 2025 🎄</span>
                        </div>

                        <div className="space-y-3 lg:space-y-4 relative">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold leading-loose">
                                <span className="inline-block min-h-[1.2em] text-yellow-300 drop-shadow-lg">
                                    {blueText.displayText}
                                    {!blueText.isComplete && <span className="animate-pulse">|</span>}
                                </span>
                                <span className="block bg-gradient-to-r from-red-400 via-yellow-300 to-red-400 bg-clip-text text-transparent pb-2 min-h-[1.2em]">
                                    {orangeText.displayText}
                                    {!orangeText.isComplete && <span className="animate-pulse text-red-400">|</span>}
                                </span>
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-lg opacity-0" style={{ animation: 'subtle-fade-in 0.8s ease-out 0.7s forwards, gentle-float 8s ease-in-out 1.9s infinite' }}>
                                Regala energía limpia esta Navidad. Transforma tu hogar o negocio con
                                <span className="text-yellow-200 font-semibold"> energía solar </span>
                                y aprovecha nuestras ofertas especiales.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl opacity-0" style={{ animation: 'subtle-fade-in 0.8s ease-out 0.9s forwards, gentle-float 8s ease-in-out 2.1s infinite' }}>
                            <Link
                                href="/ofertas"
                                className="group relative px-6 py-4 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-gray-900 font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] text-sm lg:text-base overflow-hidden shadow-lg shadow-yellow-500/40"
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-transparent to-white/20"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    🎁 Ver Kits Solares
                                </span>
                            </Link>
                            <Link
                                href="/tienda"
                                className="group relative px-6 py-4 bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] text-sm lg:text-base overflow-hidden shadow-lg shadow-red-500/40"
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-transparent to-yellow-400/15"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    🛒 Tienda Online
                                </span>
                            </Link>
                        </div>

                        {/* Motivational solar energy badge */}
                        <div className="inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-yellow-500/10 to-red-500/10 backdrop-blur-sm border border-yellow-400/30 rounded-xl">
                            <div className="text-sm">
                                <p className="text-yellow-200 font-semibold">El mejor regalo para tu hogar</p>
                                <p className="text-white/70 text-xs">Invierte en energía limpia y sostenible</p>
                            </div>
                        </div>
                    </div>

                    {/* Hero 3D Model - Clean and elegant */}
                    <div className="relative opacity-0" style={{ animation: 'subtle-fade-in 0.8s ease-out 0.4s forwards, gentle-float-image 10s ease-in-out 1.8s infinite' }}>
                        {/* Subtle glowing effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-yellow-500/10 to-green-500/10 rounded-full blur-3xl"></div>

                        <SolarHouseModel />
                    </div>
                </div>
            </div>

            {/* Minimal background decorative elements */}
            <div className="absolute top-20 left-10 w-2 h-2 bg-red-400/40 rounded-full animate-bounce animation-delay-1000"></div>
            <div className="absolute top-40 right-20 w-3 h-3 bg-yellow-300/40 rounded-full animate-bounce animation-delay-1200"></div>
            <div className="absolute bottom-40 left-20 w-2 h-2 bg-green-400/40 rounded-full animate-bounce animation-delay-800"></div>
        </section>
    )
}
