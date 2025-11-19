"use client"

import React, { useRef, useEffect } from "react"

// Partner Item Component
const PartnerItem = ({ src, alt }: { src: string; alt: string }) => (
    <div className="flex items-center justify-center flex-shrink-0 w-[240px] sm:w-[280px] lg:w-[320px]">
        <div className="relative w-full h-36 sm:h-40 md:h-48 lg:h-56 group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-orange-50/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
            <img
                src={src}
                alt={alt}
                className="relative w-full h-full object-contain transition-all duration-500 group-hover:scale-105 opacity-85 group-hover:opacity-100 filter grayscale-[20%] group-hover:grayscale-0"
            />
        </div>
    </div>
)

// Partners data
const partners = [
    { src: "https://s3.suncarsrl.com/partners/onu.png", alt: "ONU - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/nacional.png", alt: "Hotel Nacional - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/supermarket23.png", alt: "Supermarket 23 - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/fournier.png", alt: "Fournier - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/fadiar.png", alt: "Fadiar - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/milexus.png", alt: "Milexus - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/mercazon.png", alt: "Mercazon - Cliente de Suncar" },
    { src: "https://s3.suncarsrl.com/partners/humidores.png", alt: "Humidores - Cliente de Suncar" },
]

// Dividir partners en dos grupos para las dos filas
const partnersRow1 = partners.filter((_, index) => index % 2 === 0) // Pares: 0, 2, 4, 6
const partnersRow2 = partners.filter((_, index) => index % 2 !== 0) // Impares: 1, 3, 5, 7

export default function TrustedPartnersSection() {
    const scrollRef1 = useRef<HTMLDivElement>(null)
    const scrollRef2 = useRef<HTMLDivElement>(null)

    // Auto-scroll para el carrusel de partners con dos filas en direcciones opuestas
    useEffect(() => {
        const scrollContainer1 = scrollRef1.current
        const scrollContainer2 = scrollRef2.current
        if (!scrollContainer1 || !scrollContainer2) return

        let scrollSpeed = 1 // píxeles por frame
        let isPaused1 = false
        let isPaused2 = false
        let animationFrameId: number
        let isDown1 = false
        let isDown2 = false
        let startX1 = 0
        let startX2 = 0
        let scrollLeft1 = 0
        let scrollLeft2 = 0

        const scroll = () => {
            // Scroll fila 1 hacia la derecha
            if (!isPaused1 && !isDown1 && scrollContainer1) {
                scrollContainer1.scrollLeft += scrollSpeed
                const maxScroll1 = scrollContainer1.scrollWidth / 2
                if (scrollContainer1.scrollLeft >= maxScroll1) {
                    scrollContainer1.scrollLeft = 0
                }
            }

            // Scroll fila 2 hacia la izquierda
            if (!isPaused2 && !isDown2 && scrollContainer2) {
                scrollContainer2.scrollLeft -= scrollSpeed
                if (scrollContainer2.scrollLeft <= 0) {
                    scrollContainer2.scrollLeft = scrollContainer2.scrollWidth / 2
                }
            }

            animationFrameId = requestAnimationFrame(scroll)
        }

        // Handlers para fila 1
        const handleMouseEnter1 = () => { isPaused1 = true }
        const handleMouseLeave1 = () => { isPaused1 = false; isDown1 = false }
        const handleMouseDown1 = (e: MouseEvent) => {
            isDown1 = true
            startX1 = e.pageX - scrollContainer1.offsetLeft
            scrollLeft1 = scrollContainer1.scrollLeft
        }
        const handleMouseUp1 = () => { isDown1 = false }
        const handleMouseMove1 = (e: MouseEvent) => {
            if (!isDown1) return
            e.preventDefault()
            const x = e.pageX - scrollContainer1.offsetLeft
            const walk = (x - startX1) * 2
            scrollContainer1.scrollLeft = scrollLeft1 - walk
        }

        // Handlers para fila 2
        const handleMouseEnter2 = () => { isPaused2 = true }
        const handleMouseLeave2 = () => { isPaused2 = false; isDown2 = false }
        const handleMouseDown2 = (e: MouseEvent) => {
            isDown2 = true
            startX2 = e.pageX - scrollContainer2.offsetLeft
            scrollLeft2 = scrollContainer2.scrollLeft
        }
        const handleMouseUp2 = () => { isDown2 = false }
        const handleMouseMove2 = (e: MouseEvent) => {
            if (!isDown2) return
            e.preventDefault()
            const x = e.pageX - scrollContainer2.offsetLeft
            const walk = (x - startX2) * 2
            scrollContainer2.scrollLeft = scrollLeft2 - walk
        }

        // Event listeners fila 1
        scrollContainer1.addEventListener('mouseenter', handleMouseEnter1)
        scrollContainer1.addEventListener('mouseleave', handleMouseLeave1)
        scrollContainer1.addEventListener('mousedown', handleMouseDown1)
        scrollContainer1.addEventListener('mouseup', handleMouseUp1)
        scrollContainer1.addEventListener('mousemove', handleMouseMove1)

        // Event listeners fila 2
        scrollContainer2.addEventListener('mouseenter', handleMouseEnter2)
        scrollContainer2.addEventListener('mouseleave', handleMouseLeave2)
        scrollContainer2.addEventListener('mousedown', handleMouseDown2)
        scrollContainer2.addEventListener('mouseup', handleMouseUp2)
        scrollContainer2.addEventListener('mousemove', handleMouseMove2)

        // Iniciar la segunda fila en la mitad para el efecto de scroll inverso
        scrollContainer2.scrollLeft = scrollContainer2.scrollWidth / 2

        animationFrameId = requestAnimationFrame(scroll)

        return () => {
            cancelAnimationFrame(animationFrameId)
            scrollContainer1.removeEventListener('mouseenter', handleMouseEnter1)
            scrollContainer1.removeEventListener('mouseleave', handleMouseLeave1)
            scrollContainer1.removeEventListener('mousedown', handleMouseDown1)
            scrollContainer1.removeEventListener('mouseup', handleMouseUp1)
            scrollContainer1.removeEventListener('mousemove', handleMouseMove1)
            scrollContainer2.removeEventListener('mouseenter', handleMouseEnter2)
            scrollContainer2.removeEventListener('mouseleave', handleMouseLeave2)
            scrollContainer2.removeEventListener('mousedown', handleMouseDown2)
            scrollContainer2.removeEventListener('mouseup', handleMouseUp2)
            scrollContainer2.removeEventListener('mousemove', handleMouseMove2)
        }
    }, [])

    return (
        <section className="py-16 sm:py-20 lg:py-28 bg-white relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-50/40 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 lg:mb-4">
                        Confían en Nosotros
                    </h2>
                    <div className="h-1 w-20 bg-secondary-gradient rounded-full mx-auto mb-3"></div>
                    <p className="text-sm lg:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Empresas líderes que han confiado en nuestra experiencia y tecnología solar de vanguardia
                    </p>
                </div>

                {/* Partners Carousel - Two Rows */}
                <div className="relative max-w-7xl mx-auto space-y-4 md:space-y-6">
                    {/* Gradient fade left */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>

                    {/* Gradient fade right */}
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>

                    {/* Primera fila - Se mueve hacia la derecha */}
                    <div
                        ref={scrollRef1}
                        className="overflow-x-scroll scrollbar-hide cursor-grab active:cursor-grabbing"
                        style={{
                            scrollBehavior: 'auto',
                            WebkitOverflowScrolling: 'touch',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}
                    >
                        <div className="flex gap-4 md:gap-6 lg:gap-8 py-4" style={{ width: 'max-content' }}>
                            {/* First set */}
                            {partnersRow1.map((partner, index) => (
                                <PartnerItem key={`row1-set1-${index}`} src={partner.src} alt={partner.alt} />
                            ))}
                            {/* Duplicate set for infinite scroll */}
                            {partnersRow1.map((partner, index) => (
                                <PartnerItem key={`row1-set2-${index}`} src={partner.src} alt={partner.alt} />
                            ))}
                        </div>
                    </div>

                    {/* Segunda fila - Se mueve hacia la izquierda */}
                    <div
                        ref={scrollRef2}
                        className="overflow-x-scroll scrollbar-hide cursor-grab active:cursor-grabbing"
                        style={{
                            scrollBehavior: 'auto',
                            WebkitOverflowScrolling: 'touch',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}
                    >
                        <div className="flex gap-4 md:gap-6 lg:gap-8 py-4" style={{ width: 'max-content' }}>
                            {/* First set */}
                            {partnersRow2.map((partner, index) => (
                                <PartnerItem key={`row2-set1-${index}`} src={partner.src} alt={partner.alt} />
                            ))}
                            {/* Duplicate set for infinite scroll */}
                            {partnersRow2.map((partner, index) => (
                                <PartnerItem key={`row2-set2-${index}`} src={partner.src} alt={partner.alt} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom decorative line */}
                <div className="mt-12 lg:mt-20 flex items-center justify-center gap-2">
                    <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-gray-300"></div>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary/30"></div>
                        <div className="w-2 h-2 rounded-full bg-secondary-gradient"></div>
                        <div className="w-2 h-2 rounded-full bg-primary/30"></div>
                    </div>
                    <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-gray-300"></div>
                </div>
            </div>
        </section>
    )
}
