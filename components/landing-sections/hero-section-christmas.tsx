"use client"

import Link from "next/link"
import HeroModelo from "@/components/hero-modelo"

interface HeroSectionProps {
    headlineLead: {
        displayText: string
        isComplete: boolean
    }
    headlineAccent: {
        displayText: string
        isComplete: boolean
    }
}

export default function HeroSectionChristmas({ headlineLead, headlineAccent }: HeroSectionProps) {
    return (
        <section className="relative min-h-screen flex items-center px-4 py-24 md:px-6 lg:px-8 lg:py-0 [overflow-x:clip] z-10 bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-950">
            <div className="container mx-auto relative z-10">
                <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
                    {/* Hero Text - Elegant Christmas themed */}
                    <div className="space-y-6 lg:space-y-10 relative z-20">
                        {/* Christmas greeting badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 backdrop-blur-sm border border-red-400/20 rounded-full text-sm text-yellow-200 font-medium">
                            <span>🎄 Feliz Navidad 2025 🎄</span>
                        </div>

                        <div className="space-y-3 lg:space-y-4 relative">
                            <h1 className="text-[clamp(2.25rem,11vw,3rem)] sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-7xl 2xl:text-[5.25rem] font-bold leading-[1.1] sm:leading-loose">
                                <span className="inline-block min-h-[1.2em] text-yellow-300 drop-shadow-lg">
                                    {headlineLead.displayText}
                                    {!headlineLead.isComplete && <span className="animate-pulse">|</span>}
                                </span>
                                <span className="block bg-gradient-to-r from-red-400 via-yellow-300 to-red-400 bg-clip-text text-transparent pb-2 min-h-[1.2em]">
                                    {headlineAccent.displayText}
                                    {!headlineAccent.isComplete && <span className="animate-pulse text-red-400">|</span>}
                                </span>
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-lg lg:max-w-2xl opacity-0" style={{ animation: 'subtle-fade-in 0.8s ease-out 0.7s forwards, gentle-float 8s ease-in-out 1.9s infinite' }}>
                                Regala energía limpia esta Navidad. Transforma tu hogar o negocio con
                                <span className="text-yellow-200 font-semibold"> energía solar </span>
                                y aprovecha nuestras ofertas especiales.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 opacity-0" style={{ animation: 'subtle-fade-in 0.8s ease-out 0.9s forwards, gentle-float 8s ease-in-out 2.1s infinite' }}>
                            <Link
                                href="/ofertas"
                                className="group relative px-5 py-2.5 lg:px-7 lg:py-3.5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-gray-900 font-semibold rounded-lg shadow-lg shadow-yellow-500/40 hover:shadow-xl hover:shadow-yellow-500/60 transition-all duration-300 transform hover:scale-105 text-sm lg:text-lg overflow-hidden"
                            >
                                <span className="relative z-10">🧰 Ver Kits de Instalación</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-white via-yellow-200 to-white opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            </Link>
                            <Link
                                href="/productos"
                                className="group relative px-5 py-2.5 lg:px-7 lg:py-3.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white font-semibold rounded-lg shadow-lg shadow-red-500/40 hover:shadow-xl hover:shadow-red-500/60 transition-all duration-300 transform hover:scale-105 text-sm lg:text-lg overflow-hidden"
                            >
                                <span className="relative z-10">🛒 Ver Productos</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
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
                    <div className="relative z-10 opacity-0" style={{ animation: 'subtle-fade-in 0.8s ease-out 0.4s forwards, gentle-float-image 10s ease-in-out 1.8s infinite' }}>
                        {/* Subtle glowing effect */}
                        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-red-500/10 via-yellow-500/10 to-green-500/10 rounded-full blur-3xl"></div>

                        <HeroModelo />
                    </div>
                </div>
            </div>

            {/* Minimal background decorative elements */}
            <div className="hidden md:block absolute top-20 left-10 w-2 h-2 bg-red-400/40 rounded-full animate-bounce animation-delay-1000"></div>
            <div className="hidden md:block absolute top-40 right-20 w-3 h-3 bg-yellow-300/40 rounded-full animate-bounce animation-delay-1200"></div>
            <div className="hidden md:block absolute bottom-40 left-20 w-2 h-2 bg-green-400/40 rounded-full animate-bounce animation-delay-800"></div>
        </section>
    )
}
