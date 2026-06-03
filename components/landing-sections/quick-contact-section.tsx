import Link from "next/link"
import { SiWhatsapp, SiGooglemaps } from "@icons-pack/react-simple-icons"

export default function QuickContactSection() {
    return (
        <section className="py-16 lg:py-20 bg-[#F2F2EF] relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F2C300]/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#012928]/8 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
                            ¿Listo para empezar?
                        </h2>
                        <div className="h-1 w-20 bg-secondary-gradient rounded-full mx-auto mb-4"></div>
                        <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
                            Contáctanos ahora y comienza tu viaje hacia la energía solar
                        </p>
                    </div>

                    {/* Contact Cards */}
                    <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                        {/* WhatsApp Card */}
                        <a
                            href="https://wa.me/5363962417"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-green-100"
                        >
                            <div className="flex items-start gap-5">
                                <div className="bg-green-500 p-4 rounded-xl text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <SiWhatsapp size={28} color="currentColor" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-xl text-primary mb-2 group-hover:text-green-600 transition-colors">
                                        WhatsApp
                                    </h3>
                                    <p className="text-gray-600 mb-3 text-sm">
                                        Escríbenos directamente
                                    </p>
                                    <p className="text-2xl font-bold bg-secondary-gradient bg-clip-text text-transparent">
                                        +53 6396 2417
                                    </p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </a>

                        {/* Location Card */}
                        <a
                            href="https://www.google.com/maps?q=23.123815,-82.424488"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group bg-gradient-to-br from-[#012928]/5 to-[#F2C300]/10 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-[#012928]/10"
                        >
                            <div className="flex items-start gap-5">
                                <div className="bg-[#012928] p-4 rounded-xl text-[#F2C300] flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <SiGooglemaps size={28} color="currentColor" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-xl text-primary mb-2 group-hover:text-[#012928] transition-colors">
                                        Visítanos
                                    </h3>
                                    <p className="text-gray-600 mb-3 text-sm">
                                        Ver en Google Maps
                                    </p>
                                    <p className="text-lg font-semibold text-primary leading-relaxed">
                                        Calle 24 entre 1ra y 3ra<br />
                                        Playa, La Habana
                                    </p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <svg className="w-6 h-6 text-[#012928]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </a>
                    </div>

                    {/* Bottom CTA */}
                    <div className="text-center mt-10">
                        <Link
                            href="/contacto"
                            className="inline-flex items-center gap-2 text-primary hover:text-[#012928]/60 font-semibold transition-colors duration-300 group"
                        >
                            <span>Ver más opciones de contacto</span>
                            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
