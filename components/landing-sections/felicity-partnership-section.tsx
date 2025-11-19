export default function FelicityPartnershipSection() {
    return (
        <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-100/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

                    {/* Image Section - Left Side on Desktop */}
                    <div className="relative order-2 lg:order-1">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                            {/* Gradient overlay for elegance */}
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent z-10"></div>

                            <img
                                src="https://s3.suncarsrl.com/web/felicityFernandoAndy.jpg"
                                alt="Colaboración Suncar con Felicity Solar - Líderes en energía fotovoltaica"
                                width={700}
                                height={500}
                                className="w-full h-auto object-cover"
                            />

                            {/* Decorative corner accent */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-gradient opacity-20 blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 opacity-30 blur-2xl"></div>
                        </div>

                        {/* Floating badge */}
                        <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4 transform rotate-3 hover:rotate-0 transition-transform duration-300 hidden sm:block">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-secondary-gradient rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-semibold text-gray-500">Alianza</p>
                                    <p className="text-sm font-bold text-primary">Internacional</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section - Right Side on Desktop */}
                    <div className="space-y-6 lg:space-y-8 order-1 lg:order-2">
                        {/* Main Heading */}
                        <div className="space-y-4">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-primary leading-tight">
                                Colaboración con
                                <span className="block bg-secondary-gradient bg-clip-text text-transparent mt-2">
                                    Felicity Solar
                                </span>
                            </h2>
                            <div className="h-1 w-24 bg-secondary-gradient rounded-full"></div>
                        </div>

                        {/* Description - Mobile Version (Shorter) */}
                        <div className="space-y-4 lg:hidden">
                            <p className="text-base text-gray-700 leading-relaxed">
                                Suncar colabora con
                                <span className="font-bold text-primary"> Felicity Solar</span>,
                                líder mundial en energía fotovoltaica con presencia en más de 100 países.
                            </p>

                            {/* Felicity Solar Link */}
                            <div className="pt-2">
                                <a
                                    href="https://felicitysolar.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-primary hover:text-orange-600 font-semibold text-base transition-colors duration-300 group"
                                >
                                    <span>Conocer más sobre Felicity Solar</span>
                                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Description - Desktop Version (Full) */}
                        <div className="space-y-6 hidden lg:block">
                            <p className="text-base lg:text-lg xl:text-xl text-gray-700 leading-relaxed">
                                Suncar ha establecido una colaboración estratégica con
                                <span className="font-bold text-primary"> Felicity Solar</span>,
                                líder mundial en soluciones de energía fotovoltaica con presencia en más de 100 países.
                                Esta alianza nos permite ofrecer a nuestros clientes acceso a tecnología de vanguardia
                                y estándares de calidad reconocidos internacionalmente.
                            </p>

                            <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                                Felicity Solar cuenta con más de 15 años de experiencia en la industria,
                                con capacidad de producción de 20GW y certificaciones internacionales que
                                garantizan la máxima eficiencia y durabilidad de sus productos.
                            </p>

                            {/* Felicity Solar Link */}
                            <div className="pt-2">
                                <a
                                    href="https://felicitysolar.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-primary hover:text-orange-600 font-semibold text-base lg:text-lg transition-colors duration-300 group"
                                >
                                    <span>Conocer más sobre Felicity Solar</span>
                                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
