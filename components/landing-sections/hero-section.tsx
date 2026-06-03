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
        <section className="relative min-h-screen flex items-center px-4 py-24 md:px-6 lg:px-8 lg:py-0 overflow-hidden bg-[#F2F2EF]">
            <div className="container mx-auto">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Hero Text */}
                    <div className="space-y-6 lg:space-y-8 relative">
                        <div className="space-y-3 lg:space-y-4 relative">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold text-[#012928] leading-loose">
                                <span className="inline-block min-h-[1.2em]">
                                    {blueText.displayText}
                                    {!blueText.isComplete && <span className="animate-pulse">|</span>}
                                </span>
                                <span className="block bg-secondary-gradient bg-clip-text text-transparent pb-2 min-h-[1.2em]">
                                    {orangeText.displayText}
                                    {!orangeText.isComplete && <span className="animate-pulse text-[#012928]">|</span>}
                                </span>
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl text-[#012928]/70 leading-relaxed max-w-lg opacity-0" style={{ animation: 'subtle-fade-in 0.8s ease-out 0.7s forwards' }}>
                                Transforma tu hogar o negocio con energía limpia y renovable con
                                nuestros sistemas de paneles solares y baterías de última generación.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 opacity-0" style={{ animation: 'subtle-fade-in 0.8s ease-out 0.9s forwards' }}>
                            <Link
                                href="/ofertas"
                                className="px-6 py-3 lg:px-8 lg:py-4 bg-[#012928] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm lg:text-base"
                            >
                                Kits de instalación
                            </Link>
                            <Link
                                href="/productos"
                                className="px-6 py-3 lg:px-8 lg:py-4 border-2 border-[#012928] text-[#012928] bg-transparent font-semibold rounded-lg hover:bg-[#012928] hover:text-white transition-all duration-300 text-sm lg:text-base"
                            >
                                Productos
                            </Link>
                        </div>
                    </div>

                    {/* Hero 3D Model */}
                    <div className="relative opacity-0" style={{ animation: 'subtle-fade-in 0.8s ease-out 0.4s forwards' }}>
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
