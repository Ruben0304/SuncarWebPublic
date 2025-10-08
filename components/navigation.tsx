"use client"
import { useState, useEffect, useRef } from "react"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { useClient } from "@/hooks/useClient"
import GlassSurface from "@/components/GlassSurface";
import { cn } from "@/lib/utils"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hoveredHref, setHoveredHref] = useState<string | null>(null)
  const hoverResetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { isClient, isLoading } = useClient()
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (!pathname) return false
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const clearHoverReset = () => {
    if (hoverResetTimeout.current) {
      clearTimeout(hoverResetTimeout.current)
      hoverResetTimeout.current = null
    }
  }

  const handleHover = (href: string) => {
    clearHoverReset()
    setHoveredHref(href)
  }

  const scheduleHoverReset = () => {
    clearHoverReset()
    hoverResetTimeout.current = setTimeout(() => {
      setHoveredHref(null)
    }, 160)
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    return () => {
      clearHoverReset()
    }
  }, [])

  const navItems = [
    { name: "Inicio", href: "/" },
    { name: "Servicios", href: "/servicios" },
    { name: "Ofertas", href: "/ofertas" },
    // { name: "Proyectos", href: "/projectos" },
    { name: "Testimonios", href: "/testimonios" },
    { name: "Sobre Nosotros", href: "/sobre-nosotros" },
    { name: "Galeria", href: "/galeria" },
    { name: "Contacto", href: "/contacto" },

  ]



  return (
    <nav className="fixed top-2 lg:top-4 left-2 lg:left-4 right-2 lg:right-4 z-50">
      <div className="max-w-6xl mx-auto">
        {/*<GlassSurface*/}
        {/*  width="100%"*/}
        {/*  height={isOpen ? "auto" : 64}*/}
        {/*  borderRadius={16}*/}
        {/*  brightness={100}*/}
        {/*  blur={80}*/}
        {/*  className="transition-all duration-300"*/}
        {/*>*/}
          <div
            className={`
              absolute inset-0 rounded-[16px] bg-white/60 backdrop-blur-md border border-white/250
              transition-all duration-300
              ${scrolled ? "bg-white/90" : ""}
            `}
          />
          <div className="relative z-10 w-full h-full flex items-center">
            <div className="w-full px-4 lg:px-6 py-3 lg:py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="relative w-8 h-8 lg:w-10 lg:h-10">
                  <Image src="/images/suncar-logo.jpeg" alt="Suncar Logo" fill className="object-contain" />
                </div>
                <span className="text-lg lg:text-xl font-bold text-primary">SUNCAR</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-3 lg:space-x-4" onMouseLeave={scheduleHoverReset}>
                {navItems.map((item) => {
                  const isHighlighted =
                    hoveredHref === item.href || (!hoveredHref && isActive(item.href))
                  return (
                    <div key={item.name} className="relative">
                      <Link
                        href={item.href}
                        className={cn(
                          "group relative flex items-center gap-2 px-4 py-1.5 text-sm font-medium transition-all duration-300",
                          isHighlighted ? "text-primary" : "text-gray-700 hover:text-primary"
                        )}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        onMouseEnter={() => handleHover(item.href)}
                        onMouseLeave={scheduleHoverReset}
                        onFocus={() => handleHover(item.href)}
                        onBlur={scheduleHoverReset}
                      >
                        <span className="relative z-10">{item.name}</span>
                        {(item as any).isClient && (
                          <Badge className="relative z-10 bg-gradient-to-r from-[#F26729] to-[#FDB813] text-white text-xs px-2 py-1 rounded-full">
                            Cliente
                          </Badge>
                        )}
                        <span
                          aria-hidden="true"
                          className={cn(
                            "pointer-events-none absolute inset-x-4 -bottom-2 h-[3px] rounded-full bg-gradient-to-r from-[#F26729] via-[#FDB813] to-[#F26729] opacity-0 transition-all duration-300",
                            isHighlighted
                              ? "opacity-100 translate-y-0"
                              : "group-hover:opacity-100 group-hover:translate-y-0.5"
                          )}
                        />
                      </Link>
                    </div>
                  )
                })}
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
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300",
                        isActive(item.href)
                          ? "bg-white/80 text-primary shadow-sm ring-1 ring-primary/20"
                          : "text-gray-700 hover:text-primary hover:bg-white/60"
                      )}
                      aria-current={isActive(item.href) ? "page" : undefined}
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
        {/*</GlassSurface>*/}
      </div>
    </nav>
  )
}
