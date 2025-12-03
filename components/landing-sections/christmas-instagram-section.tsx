"use client"

import { Instagram, Play } from "lucide-react"

export default function ChristmasInstagramSection() {
  const handleClick = () => {
    window.open("https://www.instagram.com/alejandrocuervo_oficial/reel/DRugvfKjked/", "_blank", "noopener,noreferrer")
  }

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-[1fr,320px] gap-8 items-center">
            {/* Left Side - Motivational Text */}
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 bg-gradient-to-r from-red-100 to-green-100 rounded-full">
                <span className="text-sm font-semibold text-red-700">🎄 Especial Navideño</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Esta Navidad,{" "}
                <span className="bg-gradient-to-r from-[#F26729] to-[#FDB813] bg-clip-text text-transparent">
                  ilumina tu hogar
                </span>{" "}
                con energía solar
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed">
                Descubre cómo puedes ahorrar y disfrutar de energía limpia esta temporada.
                Mira nuestro video especial y conoce las increíbles ofertas que tenemos para ti.
              </p>

              <button
                onClick={handleClick}
                className="inline-flex items-center gap-2 text-primary hover:text-secondary transition-colors font-semibold group"
              >
                <Instagram className="w-5 h-5" />
                <span>Ver video en Instagram</span>
                <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right Side - Instagram Post Card (Small) */}
            <div className="mx-auto w-full max-w-[320px]">
              <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                {/* Header - Instagram style */}
                <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center p-1 shadow-sm">
                    <img
                      src="/images/logo navidad.png"
                      alt="Suncar Logo"
                      className="w-full h-full object-contain rounded-sm"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-gray-900 truncate">suncarsrl</p>
                  </div>
                  <Instagram className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>

                {/* Video Thumbnail */}
                <div
                  className="relative aspect-square cursor-pointer group overflow-hidden"
                  onClick={handleClick}
                >
                  <img
                    src="https://s3.suncarsrl.com/web/reel%20cuervo.png"
                    alt="Reel Navideño Suncar"
                    className="w-full h-full object-cover"
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-primary fill-primary ml-1" />
                    </div>
                  </div>

                  {/* Instagram Reel Badge */}
                  <div className="absolute top-3 right-3 bg-gradient-to-br from-purple-600 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                    <Instagram className="w-3 h-3 inline-block mr-1" />
                    Reel
                  </div>
                </div>

                {/* Actions - Instagram style */}
                <div className="px-3 py-2.5 space-y-2.5 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <button className="hover:opacity-60 transition-opacity" aria-label="Me gusta">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    <button className="hover:opacity-60 transition-opacity" aria-label="Comentar">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                    <button className="hover:opacity-60 transition-opacity" aria-label="Compartir">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>

                  {/* Caption */}
                  <div className="text-xs leading-relaxed">
                    <p className="text-gray-900">
                      <span className="font-semibold">suncarsrl</span>{" "}
                      Si quieres una instalación de paneles solares en tu hogar o negocio, sin precios abusivos, entonces la nueva línea de Felicity Solar...
                      {" "}
                      <button onClick={handleClick} className="text-gray-500 font-normal">
                        más
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
