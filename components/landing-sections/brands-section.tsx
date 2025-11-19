import Link from "next/link"

export default function BrandsSection() {
    return (
        <section className="py-16 lg:py-24 bg-gradient-to-br from-white via-gray-50/50 to-white relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl -translate-x-1/2"></div>
            <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-orange-100/20 rounded-full blur-3xl translate-x-1/2"></div>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Left Content */}
                    <div className="space-y-6 lg:space-y-8">
                        <div className="space-y-4">
                            <div className="inline-block px-4 py-2 bg-secondary-gradient text-white text-sm font-semibold rounded-full">
                                Tecnología Premium
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight">
                                Marcas que
                                <span className="block bg-secondary-gradient bg-clip-text text-transparent">
                                    Instalamos
                                </span>
                            </h2>
                            <div className="h-1 w-20 bg-secondary-gradient rounded-full"></div>
                        </div>

                        <p className="text-base lg:text-lg text-gray-600 leading-relaxed max-w-lg">
                            Trabajamos exclusivamente con las marcas líderes mundiales en tecnología solar
                        </p>

                        <Link
                            href="/ofertas"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-secondary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                        >
                            Ver Precios
                            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>

                    {/* Right - Brands Grid with animations */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-10">
                        {/* Felicity */}
                        <div
                            className="flex items-center justify-center opacity-0 translate-y-8"
                            style={{ animation: 'fade-in-up 0.8s ease-out 0.1s forwards' }}
                        >
                            <img
                                src="https://s3.suncarsrl.com/marcas/felicity.png"
                                alt="Felicity Solar"
                                className="w-full h-auto object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                                style={{ maxHeight: '160px' }}
                            />
                        </div>

                        {/* Must */}
                        <div
                            className="flex items-center justify-center opacity-0 translate-y-8"
                            style={{ animation: 'fade-in-up 0.8s ease-out 0.2s forwards' }}
                        >
                            <img
                                src="https://s3.suncarsrl.com/marcas/must.png"
                                alt="Must"
                                className="w-full h-auto object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                                style={{ maxHeight: '160px' }}
                            />
                        </div>

                        {/* Greenheiss */}
                        <div
                            className="flex items-center justify-center opacity-0 translate-y-8"
                            style={{ animation: 'fade-in-up 0.8s ease-out 0.3s forwards' }}
                        >
                            <img
                                src="https://s3.suncarsrl.com/marcas/greenheiss.png"
                                alt="Greenheiss"
                                className="w-full h-auto object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                                style={{ maxHeight: '160px' }}
                            />
                        </div>

                        {/* Pylontech */}
                        <div
                            className="flex items-center justify-center opacity-0 translate-y-8"
                            style={{ animation: 'fade-in-up 0.8s ease-out 0.4s forwards' }}
                        >
                            <img
                                src="https://s3.suncarsrl.com/marcas/pylontech.png"
                                alt="Pylontech"
                                className="w-full h-auto object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                                style={{ maxHeight: '160px' }}
                            />
                        </div>

                        {/* Huawei */}
                        <div
                            className="flex items-center justify-center opacity-0 translate-y-8"
                            style={{ animation: 'fade-in-up 0.8s ease-out 0.5s forwards' }}
                        >
                            <img
                                src="https://s3.suncarsrl.com/marcas/huawei.png"
                                alt="Huawei"
                                className="w-full h-auto object-contain transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100"
                                style={{ maxHeight: '160px' }}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
