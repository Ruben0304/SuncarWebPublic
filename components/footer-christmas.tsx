import { Mail, Phone, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import ContactInfo from "./ContactInfo"

const FacebookIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const InstagramIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

export default function FooterChristmas() {
  return (
    <footer className="relative bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-900 text-white overflow-hidden">
      {/* Christmas lights decoration at top */}
      <div className="absolute top-0 left-0 right-0 h-2 flex justify-around items-center">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full animate-christmas-twinkle"
            style={{
              backgroundColor: ['#ef4444', '#fbbf24', '#22c55e'][i % 3],
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Subtle snowflakes */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white/40 animate-snowfall"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 10 + 10}px`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${Math.random() * 5 + 8}s`,
            }}
          >
            ❄
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Company Info */}
          <div className="space-y-3 lg:space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8 lg:w-10 lg:h-10">
                <img src="/images/logo navidad.png" alt="Suncar Logo Navidad" className="object-contain rounded-lg" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg lg:text-xl font-bold text-yellow-300 drop-shadow-lg">SUNCAR</span>
                <span className="text-[9px] text-red-200 font-semibold">🎄 Feliz Navidad</span>
              </div>
            </div>
            <p className="text-emerald-100 leading-relaxed text-sm lg:text-base">
              Transformamos hogares, negocios y espacios cubanos con energía solar limpia y renovable. Tu futuro energético comienza aquí.
            </p>
            <div className="flex space-x-3 lg:space-x-4">
              <a
                href="https://www.facebook.com/share/1ajzD1QofP/?mibextid=wwXIfr"
                className="w-8 h-8 lg:w-10 lg:h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 transition-all duration-300 border border-red-400/30"
              >
                <FacebookIcon size={16} className="lg:w-5 lg:h-5" />
              </a>
              <a
                href="https://www.instagram.com/suncar.srl?igsh=ZG44ZnV4OGVobmhz&utm_source=qr"
                className="w-8 h-8 lg:w-10 lg:h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 transition-all duration-300 border border-red-400/30"
              >
                <InstagramIcon size={16} className="lg:w-5 lg:h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-yellow-300 flex items-center gap-2">
              <span>✨</span>
              Servicios
            </h3>
            <ul className="space-y-2 text-emerald-100">
              <li>
                <a href="#" className="hover:text-yellow-300 transition-colors duration-200 flex items-center gap-2">
                  <span className="text-red-400">•</span>
                  Instalación Completa
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-300 transition-colors duration-200 flex items-center gap-2">
                  <span className="text-red-400">•</span>
                  Paneles Solares
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-300 transition-colors duration-200 flex items-center gap-2">
                  <span className="text-red-400">•</span>
                  Baterías de Almacenamiento
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-300 transition-colors duration-200 flex items-center gap-2">
                  <span className="text-red-400">•</span>
                  Mantenimiento
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-300 transition-colors duration-200 flex items-center gap-2">
                  <span className="text-red-400">•</span>
                  Consultoría Energética
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-300 transition-colors duration-200 flex items-center gap-2">
                  <span className="text-red-400">•</span>
                  Financiamiento del exterior
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-yellow-300 flex items-center gap-2">
              <span>🎁</span>
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2 text-emerald-100">
              <li>
                <Link href="/sobre-nosotros" className="hover:text-yellow-300 transition-colors duration-200 flex items-center gap-2">
                  <span className="text-red-400">•</span>
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/testimonios" className="hover:text-yellow-300 transition-colors duration-200 flex items-center gap-2">
                  <span className="text-red-400">•</span>
                  Testimonios
                </Link>
              </li>
              <li>
                <Link href="/webinfo" className="hover:text-yellow-300 transition-colors duration-200 flex items-center gap-2">
                  <span className="text-red-400">•</span>
                  Información del Sitio Web
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-yellow-300 flex items-center gap-2">
              <span>☃️</span>
              Contacto
            </h3>
            <ContactInfo />
            <Link href="/cotizacion">
              <button className="w-full px-3 py-2 lg:px-4 lg:py-3 bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-105 text-sm lg:text-base border border-red-400/30 relative overflow-hidden group">
                <span className="relative z-10">🎁 Solicitar Cotización</span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-red-400/30 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-emerald-100 text-sm flex items-center gap-2">
              <span>© 2025 Suncar.</span>
              <span className="text-yellow-300">✨</span>
              <span>Todos los derechos reservados.</span>
              <span className="text-red-400">🎄</span>
            </p>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-2xl animate-pulse">🎅</span>
              <span className="text-emerald-100">¡Felices Fiestas!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom border with Christmas colors */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-yellow-400 to-green-600"></div>
    </footer>
  )
}
