import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Company Info */}
          <div className="space-y-3 lg:space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-secondary-gradient rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 lg:w-4 lg:h-4 bg-white rounded-sm"></div>
              </div>
              <span className="text-lg lg:text-xl font-bold">SUNCAR</span>
            </div>
            <p className="text-blue-100 leading-relaxed text-sm lg:text-base">
              Transformamos hogares peruanos con energía solar limpia y renovable. Tu futuro energético comienza aquí.
            </p>
            <div className="flex space-x-3 lg:space-x-4">
              <a
                href="#"
                className="w-8 h-8 lg:w-10 lg:h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-secondary-gradient transition-colors"
              >
                <Facebook size={16} className="lg:w-5 lg:h-5" />
              </a>
              <a
                href="#"
                className="w-8 h-8 lg:w-10 lg:h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-secondary-gradient transition-colors"
              >
                <Instagram size={16} className="lg:w-5 lg:h-5" />
              </a>
              <a
                href="#"
                className="w-8 h-8 lg:w-10 lg:h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-secondary-gradient transition-colors"
              >
                <Linkedin size={16} className="lg:w-5 lg:h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Servicios</h3>
            <ul className="space-y-2 text-blue-100">
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
                  Financiamiento
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-blue-100">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Proyectos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Testimonios
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contacto</h3>
            <div className="space-y-3 text-blue-100">
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-secondary-start" />
                <span>+51 999 888 777</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-secondary-start" />
                <span>info@suncar.pe</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="text-secondary-start mt-1" />
                <span>
                  Av. Solar 123, San Isidro
                  <br />
                  Lima, Perú
                </span>
              </div>
            </div>
            <button className="w-full px-3 py-2 lg:px-4 lg:py-3 bg-secondary-gradient text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm lg:text-base">
              Solicitar Cotización
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-blue-100 text-sm">© 2024 Suncar. Todos los derechos reservados.</p>
            <div className="flex space-x-6 text-sm text-blue-100">
              <a href="#" className="hover:text-white transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Términos de Servicio
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
