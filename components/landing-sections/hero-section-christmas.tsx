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

                        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 opacity-0" style={{ animation: 'subtle-fade-in 0.8s ease-out 0.9s forwards, gentle-float 8s ease-in-out 2.1s infinite' }}>
                            <Link
                                href="/cotizacion"
                                className="group relative px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white font-semibold rounded-lg shadow-lg shadow-red-500/40 hover:shadow-xl hover:shadow-red-500/60 transition-all duration-300 transform hover:scale-105 text-sm lg:text-base overflow-hidden"
                            >
                                <span className="relative z-10">Cotizar Ahora</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            </Link>
                            <Link
                                href="/solar-survivor"
                                className="group relative px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 text-sm lg:text-base overflow-hidden transform hover:scale-105 hover:-translate-y-1"
                            >
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 animate-pulse"></div>
                                <div className="relative flex items-center gap-2 z-10">
                                    <span className="relative">
                                        🎮 Jugar Simulador
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>
                                    </span>
                                    <svg className="w-4 h-4 transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
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
