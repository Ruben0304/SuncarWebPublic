import Image from "next/image"
import Link from "next/link"
import ContactInfo from "./ContactInfo"
import { SiFacebook, SiInstagram } from "@icons-pack/react-simple-icons"

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Company Info */}
          <div className="space-y-3 lg:space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo-horizontal-white.png"
                alt="Suncar — Energía que transforma"
                height={40}
                width={146}
                className="h-8 lg:h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-blue-100 leading-relaxed text-sm lg:text-base">
              Transformamos hogares, negocios y espacios cubanos con energía solar limpia y renovable. Tu futuro energético comienza aquí.
            </p>
            <div className="flex space-x-3 lg:space-x-4">
              <a
                href="https://www.facebook.com/share/1ajzD1QofP/?mibextid=wwXIfr"
                className="w-8 h-8 lg:w-10 lg:h-10 bg-[#F2C300]/20 border border-[#F2C300]/40 rounded-lg flex items-center justify-center text-[#F2C300] hover:bg-[#F2C300] hover:text-[#012928] hover:border-[#F2C300] transition-all duration-200"
              >
                <SiFacebook size={18} color="currentColor" />
              </a>
              <a
                href="https://www.instagram.com/suncar.srl?igsh=ZG44ZnV4OGVobmhz&utm_source=qr"
                className="w-8 h-8 lg:w-10 lg:h-10 bg-[#F2C300]/20 border border-[#F2C300]/40 rounded-lg flex items-center justify-center text-[#F2C300] hover:bg-[#F2C300] hover:text-[#012928] hover:border-[#F2C300] transition-all duration-200"
              >
                <SiInstagram size={18} color="currentColor" />
              </a>
              {/*<a*/}
              {/*  href="#"*/}
              {/*  className="w-8 h-8 lg:w-10 lg:h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#011818] transition-colors"*/}
              {/*>*/}
              {/*  <Linkedin size={16} className="lg:w-5 lg:h-5" />*/}
              {/*</a>*/}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Servicios</h3>
            <ul className="space-y-2 text-blue-100">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Instalación Completa
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Paneles Solares
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Baterías de Almacenamiento
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Mantenimiento
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Consultoría Energética
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Financiamiento del exterior
                </a>
              </li>

            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-blue-100">
              <li>
                <Link href="/sobre-nosotros" className="hover:text-white transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              {/*<li>*/}
              {/*  <Link href="/projectos" className="hover:text-white transition-colors">*/}
              {/*    Proyectos*/}
              {/*  </Link>*/}
              {/*</li>*/}
              <li>
                <Link href="/testimonios" className="hover:text-white transition-colors">
                  Testimonios
                </Link>
              </li>
              <li>
                <Link href="/webinfo" className="hover:text-white transition-colors">
                  Información del Sitio Web
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <ContactInfo />
            <Link href="/cotizacion">
              <button className="w-full px-3 py-3 lg:px-4 lg:py-4 bg-[#F2C300] text-[#012928] font-semibold rounded-lg hover:bg-[#d4aa00] hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm lg:text-base">
                Solicitar Cotización
              </button>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-blue-100 text-sm">© 2025 Suncar. Todos los derechos reservados.</p>
            <div className="flex space-x-6 text-sm text-blue-100">
              {/*<a href="#" className="hover:text-white transition-colors">*/}
              {/*  Política de Privacidad*/}
              {/*</a>*/}
              {/*<a href="#" className="hover:text-white transition-colors">*/}
              {/*  Términos de Servicio*/}
              {/*</a>*/}
              {/*<a href="#" className="hover:text-white transition-colors">*/}
              {/*  Cookies*/}
              {/*</a>*/}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
