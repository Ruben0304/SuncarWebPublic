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

export default function HeroSection({ headlineLead, headlineAccent }: HeroSectionProps) {
    return (
        <section className="relative min-h-screen flex items-center px-4 py-24 md:px-6 lg:px-8 lg:py-0 [overflow-x:clip] z-10 bg-[#F2F2EF]">
            <div className="container mx-auto">
                <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
                    {/* Hero Text */}
                    <div className="space-y-6 lg:space-y-10 relative z-20">
                        <div className="space-y-3 lg:space-y-4 relative">
                            <h1 className="text-[clamp(2.25rem,11vw,3rem)] sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-7xl 2xl:text-[5.25rem] font-bold text-[#012928] leading-[1.1] sm:leading-loose">
                                <span className="inline-block min-h-[1.2em]">
                                    {headlineLead.displayText}
                                    {!headlineLead.isComplete && <span className="animate-pulse">|</span>}
                                </span>
                                <span className="block bg-secondary-gradient bg-clip-text text-transparent pb-2 min-h-[1.2em]">
                                    {headlineAccent.displayText}
                                    {!headlineAccent.isComplete && <span className="animate-pulse text-[#012928]">|</span>}
                                </span>
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#012928]/70 leading-relaxed max-w-lg lg:max-w-2xl opacity-0" style={{ animation: 'subtle-fade-in 0.8s ease-out 0.7s forwards' }}>
                                Transforma tu hogar o negocio con energía limpia y renovable con
                                nuestros sistemas de paneles solares y baterías de última generación.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 opacity-0" style={{ animation: 'subtle-fade-in 0.8s ease-out 0.9s forwards' }}>
                            <Link
                                href="/ofertas"
                                className="px-5 py-2.5 lg:px-7 lg:py-3.5 bg-[#012928] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm lg:text-lg"
                            >
                                Kits de instalación
                            </Link>
                            <Link
                                href="/productos"
                                className="px-5 py-2.5 lg:px-7 lg:py-3.5 border-2 border-[#012928] text-[#012928] bg-transparent font-semibold rounded-lg hover:bg-[#012928] hover:text-white transition-all duration-300 text-sm lg:text-lg"
                            >
                                Productos
                            </Link>
                        </div>
                    </div>

                    {/* Hero 3D Model */}
                    <div className="relative z-10 opacity-0" style={{ animation: 'subtle-fade-in 0.8s ease-out 0.4s forwards' }}>
                        <HeroModelo />
                    </div>
                </div>
            </div>

            {/* Background decorative elements */}
            <div className="hidden md:block absolute top-20 left-10 w-2 h-2 bg-secondary-gradient rounded-full animate-bounce animation-delay-1000"></div>
            <div className="hidden md:block absolute top-40 right-20 w-3 h-3 bg-primary/30 rounded-full animate-bounce animation-delay-1200"></div>
            <div className="hidden md:block absolute bottom-40 left-20 w-1 h-1 bg-secondary-gradient rounded-full animate-bounce animation-delay-800"></div>
        </section>
    )
}
