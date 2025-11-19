import Link from "next/link"

// WhatsApp Icon Component
const WhatsAppIcon = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
)

// Google Maps Icon Component
const GoogleMapsIcon = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C7.802 0 4.403 3.403 4.403 7.602c0 1.7.577 3.261 1.547 4.516l5.536 8.906c.18.29.51.476.864.476h.002c.354 0 .684-.186.864-.477l5.535-8.906c.97-1.255 1.547-2.816 1.547-4.516C19.597 3.403 16.198 0 12 0zm0 11.25c-2.004 0-3.631-1.627-3.631-3.631S9.996 3.988 12 3.988s3.631 1.627 3.631 3.631S14.004 11.25 12 11.25z" />
    </svg>
)

export default function QuickContactSection() {
    return (
        <section className="py-16 lg:py-20 bg-white relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-orange-50/40 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

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
                                    <WhatsAppIcon size={28} />
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
                            className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-blue-100"
                        >
                            <div className="flex items-start gap-5">
                                <div className="bg-blue-500 p-4 rounded-xl text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <GoogleMapsIcon size={28} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-xl text-primary mb-2 group-hover:text-blue-600 transition-colors">
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
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            className="inline-flex items-center gap-2 text-primary hover:text-orange-600 font-semibold transition-colors duration-300 group"
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
