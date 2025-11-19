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

export default function HeroSection({ blueText, orangeText }: HeroSectionProps) {
    return (
        <section className="relative min-h-screen flex items-center px-4 py-24 md:px-6 lg:px-8 lg:py-0 overflow-hidden">
            <div className="container mx-auto">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Hero Text */}
                    <div className="space-y-6 lg:space-y-8 relative">
                        <div className="space-y-3 lg:space-y-4 relative">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold text-primary leading-loose">
                                <span className="inline-block min-h-[1.2em]">
                                    {blueText.displayText}
                                    {!blueText.isComplete && <span className="animate-pulse">|</span>}
                                </span>
                                <span className="block bg-secondary-gradient bg-clip-text text-transparent pb-2 min-h-[1.2em]">
                                    {orangeText.displayText}
                                    {!orangeText.isComplete && <span className="animate-pulse text-orange-500">|</span>}
                                </span>
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg opacity-0" style={{ animation: 'subtle-fade-in 0.8s ease-out 0.7s forwards, gentle-float 8s ease-in-out 1.9s infinite' }}>
                                Transforma tu hogar o negocio con energía limpia y renovable con
                                nuestros sistemas de paneles solares y baterías de última generación.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 opacity-0" style={{ animation: 'subtle-fade-in 0.8s ease-out 0.9s forwards, gentle-float 8s ease-in-out 2.1s infinite' }}>
                            <Link href="/cotizacion" className="px-6 py-3 lg:px-8 lg:py-4 bg-secondary-gradient text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm lg:text-base hover-magnetic glow-on-hover attention-grabber">
                                Cotizar Ahora
                            </Link>
                            <Link
                                href="/solar-survivor"
                                className="group relative px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 text-sm lg:text-base overflow-hidden transform hover:scale-105 hover:-translate-y-1"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
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
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            </Link>
                        </div>
                    </div>

                    {/* Hero 3D Model */}
                    <div className="relative opacity-0" style={{ animation: 'subtle-fade-in 0.8s ease-out 0.4s forwards, gentle-float-image 10s ease-in-out 1.8s infinite' }}>
                        <SolarHouseModel />
                    </div>
                </div>
            </div>

            {/* Background decorative elements */}
            <div className="absolute top-20 left-10 w-2 h-2 bg-secondary-gradient rounded-full animate-bounce animation-delay-1000"></div>
            <div className="absolute top-40 right-20 w-3 h-3 bg-primary/30 rounded-full animate-bounce animation-delay-1200"></div>
            <div className="absolute bottom-40 left-20 w-1 h-1 bg-secondary-gradient rounded-full animate-bounce animation-delay-800"></div>
        </section>
    )
}
