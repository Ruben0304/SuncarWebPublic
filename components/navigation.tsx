"use client"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useClient } from "@/hooks/useClient"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isClient, isLoading } = useClient()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const baseNavItems = [
    { name: "Inicio", href: "/" },
    { name: "Sobre Nosotros", href: "/sobre-nosotros" },
    { name: "Servicios", href: "/servicios" },
    // { name: "Proyectos", href: "/projectos" },
    { name: "Testimonios", href: "/testimonios" },
    { name: "Galería", href: "/galeria" },
    { name: "Contacto", href: "/contacto" },
  ]

  // Add Ofertas tab for verified clients
  const navItems = !isLoading && isClient 
    ? [
        ...baseNavItems.slice(0, 3), // Inicio, Sobre Nosotros, Servicios
        { name: "Ofertas", href: "/ofertas", isClient: true },
        ...baseNavItems.slice(3) // Contacto
      ]
    : baseNavItems

  return (
    <nav className="fixed top-2 lg:top-4 left-2 lg:left-4 right-2 lg:right-4 z-50">
      <div className="max-w-6xl mx-auto">
        <div
          className={`
            backdrop-blur-md bg-white/80 border border-white/20 
            rounded-2xl shadow-lg transition-all duration-300
            ${scrolled ? "bg-white/90 shadow-xl" : ""}
          `}
        >
          <div className="px-4 lg:px-6 py-3 lg:py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="relative w-8 h-8 lg:w-10 lg:h-10">
                  <Image src="/images/suncar-logo.jpeg" alt="Suncar Logo" fill className="object-contain" />
                </div>
                <span className="text-lg lg:text-xl font-bold text-primary">SUNCAR</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {navItems.map((item) => (
                  <div key={item.name} className="relative">
                    <Link
                      href={item.href}
                      className="text-gray-700 hover:text-primary transition-colors duration-200 font-medium flex items-center gap-2"
                    >
                      {item.name}
                      {(item as any).isClient && (
                        <Badge className="bg-gradient-to-r from-[#F26729] to-[#FDB813] text-white text-xs px-2 py-1 rounded-full">
                          Cliente
                        </Badge>
                      )}
                    </Link>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="hidden md:block">
                <Link href="/cotizacion" className="px-4 py-2 lg:px-6 lg:py-2 bg-secondary-gradient text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm lg:text-base">
                  Cotizar
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-primary transition-colors"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
              <div className="md:hidden mt-3 pt-3 border-t border-gray-200/50">
                <div className="flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-gray-700 hover:text-primary transition-colors duration-200 font-medium py-2 text-sm flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                      {(item as any).isClient && (
                        <Badge className="bg-gradient-to-r from-[#F26729] to-[#FDB813] text-white text-xs px-2 py-1 rounded-full">
                          Cliente
                        </Badge>
                      )}
                    </Link>
                  ))}
                  <Link href="/cotizacion" className="mt-3 px-4 py-2 bg-secondary-gradient text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 w-full text-sm text-center block" onClick={() => setIsOpen(false)}>
                    Cotizar
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
