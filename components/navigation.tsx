"use client"
import { useState, useEffect, useRef } from "react"
import { Menu, X, ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { useClient } from "@/hooks/useClient"
import GlassSurface from "@/components/GlassSurface";
import { cn } from "@/lib/utils"
import { CATEGORIAS_INFO } from "@/components/blog"

type NavItem = {
  name: string
  href: string
  hasDropdown?: boolean
  dropdownType?: "blog" | "precios" | "nosotro"
  matchHrefs?: string[]
  badge?: string
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hoveredHref, setHoveredHref] = useState<string | null>(null)
  const [showBlogDropdown, setShowBlogDropdown] = useState(false)
  const [showPreciosDropdown, setShowPreciosDropdown] = useState(false)
  const [showNosotroDropdown, setShowNosotroDropdown] = useState(false)
  const hoverResetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const blogDropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const preciosDropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nosotroDropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { isClient, isLoading } = useClient()
  const pathname = usePathname()

  const isActive = (href: string, matchHrefs?: string[]) => {
    if (!pathname) return false
    const targets = matchHrefs && matchHrefs.length > 0 ? matchHrefs : [href]
    return targets.some((target) => {
      if (target === "/") return pathname === "/"
      return pathname.startsWith(target)
    })
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

  const handleBlogMouseEnter = () => {
    if (blogDropdownTimeout.current) {
      clearTimeout(blogDropdownTimeout.current)
    }
    setShowBlogDropdown(true)
  }

  const handleBlogMouseLeave = () => {
    blogDropdownTimeout.current = setTimeout(() => {
      setShowBlogDropdown(false)
    }, 200)
  }

  const handlePreciosMouseEnter = () => {
    if (preciosDropdownTimeout.current) {
      clearTimeout(preciosDropdownTimeout.current)
    }
    setShowPreciosDropdown(true)
  }

  const handlePreciosMouseLeave = () => {
    preciosDropdownTimeout.current = setTimeout(() => {
      setShowPreciosDropdown(false)
    }, 200)
  }

  const handleNosotroMouseEnter = () => {
    if (nosotroDropdownTimeout.current) {
      clearTimeout(nosotroDropdownTimeout.current)
    }
    setShowNosotroDropdown(true)
  }

  const handleNosotroMouseLeave = () => {
    nosotroDropdownTimeout.current = setTimeout(() => {
      setShowNosotroDropdown(false)
    }, 200)
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
      if (blogDropdownTimeout.current) {
        clearTimeout(blogDropdownTimeout.current)
      }
      if (preciosDropdownTimeout.current) {
        clearTimeout(preciosDropdownTimeout.current)
      }
      if (nosotroDropdownTimeout.current) {
        clearTimeout(nosotroDropdownTimeout.current)
      }
    }
  }, [])

  const desktopNavItems: NavItem[] = [
    { name: "Inicio", href: "/" },
    { name: "Servicios", href: "/servicios" },
    {
      name: "Precios",
      href: "/ofertas",
      hasDropdown: true,
      dropdownType: "precios",
      matchHrefs: ["/ofertas", "/productos"],
    },
    { name: "Blog", href: "/blog", hasDropdown: true, dropdownType: "blog" },
    { name: "Testimonios", href: "/testimonios" },
    {
      name: "Nosotros",
      href: "/sobre-nosotros",
      hasDropdown: true,
      dropdownType: "nosotro",
      matchHrefs: ["/sobre-nosotros", "/contacto"],
    },
    { name: "Galeria", href: "/galeria" },
  ]

  const mobileNavItems: NavItem[] = [
    { name: "Inicio", href: "/" },
    { name: "Servicios", href: "/servicios" },
    { name: "Productos", href: "/productos", badge: "Pronto" },
    { name: "Kits completos (instalación)", href: "/ofertas" },
    { name: "Blog", href: "/blog" },
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
                  <img src="/images/suncar-logo.jpeg" alt="Suncar Logo" className="object-contain rounded-lg" />
                </div>
                <span className="text-lg lg:text-xl font-bold text-primary">SUNCAR</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-3 lg:space-x-4" onMouseLeave={scheduleHoverReset}>
                {desktopNavItems.map((item) => {
                  const matchHrefs = item.matchHrefs
                  const isHighlighted =
                    hoveredHref === item.href || (!hoveredHref && isActive(item.href, matchHrefs))

                  if (item.hasDropdown) {
                    const isBlog = item.dropdownType === "blog"
                    const isPrecios = item.dropdownType === "precios"
                    const isNosotro = item.dropdownType === "nosotro"
                    const showDropdown = isBlog
                      ? showBlogDropdown
                      : isPrecios
                      ? showPreciosDropdown
                      : showNosotroDropdown
                    const handleMouseEnter = isBlog
                      ? handleBlogMouseEnter
                      : isPrecios
                      ? handlePreciosMouseEnter
                      : handleNosotroMouseEnter
                    const handleMouseLeave = isBlog
                      ? handleBlogMouseLeave
                      : isPrecios
                      ? handlePreciosMouseLeave
                      : handleNosotroMouseLeave

                    return (
                      <div
                        key={item.name}
                        className="relative"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            "group relative flex items-center gap-1 px-4 py-1.5 text-sm font-medium transition-all duration-300",
                            isHighlighted ? "text-primary" : "text-gray-700 hover:text-primary"
                          )}
                          aria-current={isActive(item.href, matchHrefs) ? "page" : undefined}
                          onMouseEnter={() => handleHover(item.href)}
                          onMouseLeave={scheduleHoverReset}
                          onFocus={() => handleHover(item.href)}
                          onBlur={scheduleHoverReset}
                        >
                          <span className="relative z-10">{item.name}</span>
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform duration-300",
                              showDropdown && "rotate-180"
                            )}
                          />
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

                        {/* Dropdown Menu */}
                        {showDropdown && (
                          <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                            <div className="py-2">
                              {isBlog ? (
                                <>
                                  <Link
                                    href="/blog"
                                    className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors duration-200"
                                    onClick={() => setShowBlogDropdown(false)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>📰</span>
                                      <span>Todos los artículos</span>
                                    </div>
                                  </Link>
                                  <div className="border-t border-gray-200 my-2"></div>
                                  {Object.entries(CATEGORIAS_INFO).map(([key, info]) => (
                                    <Link
                                      key={key}
                                      href={`/blog?categoria=${key}`}
                                      className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-primary transition-colors duration-200"
                                      onClick={() => setShowBlogDropdown(false)}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span>{info.icon}</span>
                                        <span>{info.label}</span>
                                      </div>
                                    </Link>
                                  ))}
                                </>
                              ) : isPrecios ? (
                                <>
                                  <Link
                                    href="/productos"
                                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors duration-200"
                                    onClick={() => setShowPreciosDropdown(false)}
                                  >
                                    <span>Productos</span>
                                    <Badge className="bg-primary text-white text-[10px] px-2.5 py-0.5 font-semibold rounded-md">
                                      Pronto
                                    </Badge>
                                  </Link>
                                  <div className="border-t border-gray-200 my-2"></div>
                                  <Link
                                    href="/ofertas"
                                    className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors duration-200"
                                    onClick={() => setShowPreciosDropdown(false)}
                                  >
                                    Kits completos (instalación)
                                  </Link>
                                </>
                              ) : isNosotro ? (
                                <>
                                  <Link
                                    href="/sobre-nosotros"
                                    className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors duration-200"
                                    onClick={() => setShowNosotroDropdown(false)}
                                  >
                                    Conócenos
                                  </Link>
                                  <div className="border-t border-gray-200 my-2"></div>
                                  <Link
                                    href="/contacto"
                                    className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors duration-200"
                                    onClick={() => setShowNosotroDropdown(false)}
                                  >
                                    Contacto
                                  </Link>
                                </>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  }

                  return (
                    <div key={item.name} className="relative">
                      <Link
                        href={item.href}
                        className={cn(
                          "group relative flex items-center gap-2 px-4 py-1.5 text-sm font-medium transition-all duration-300",
                          isHighlighted ? "text-primary" : "text-gray-700 hover:text-primary"
                        )}
                        aria-current={isActive(item.href, matchHrefs) ? "page" : undefined}
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
                  {mobileNavItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300",
                        isActive(item.href, item.matchHrefs)
                          ? "bg-white/80 text-primary shadow-sm ring-1 ring-primary/20"
                          : "text-gray-700 hover:text-primary hover:bg-white/60"
                      )}
                      aria-current={isActive(item.href, item.matchHrefs) ? "page" : undefined}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                      {item.badge && (
                        <Badge className="bg-primary text-white text-[10px] px-2.5 py-0.5 font-semibold rounded-md">
                          {item.badge}
                        </Badge>
                      )}
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
