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
    dropdownType?: "blog" | "precios" | "nosotro" | "apps"
    matchHrefs?: string[]
    badge?: string
}

export default function NavigationChristmas() {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [hoveredHref, setHoveredHref] = useState<string | null>(null)
    const [showBlogDropdown, setShowBlogDropdown] = useState(false)
    const [showPreciosDropdown, setShowPreciosDropdown] = useState(false)
    const [showNosotroDropdown, setShowNosotroDropdown] = useState(false)
    const [showAppsDropdown, setShowAppsDropdown] = useState(false)
    const hoverResetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const blogDropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const preciosDropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const nosotroDropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const appsDropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
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

    const handleAppsMouseEnter = () => {
        if (appsDropdownTimeout.current) {
            clearTimeout(appsDropdownTimeout.current)
        }
        setShowAppsDropdown(true)
    }

    const handleAppsMouseLeave = () => {
        appsDropdownTimeout.current = setTimeout(() => {
            setShowAppsDropdown(false)
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
            if (appsDropdownTimeout.current) {
                clearTimeout(appsDropdownTimeout.current)
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
            matchHrefs: ["/ofertas", "/productos", "/tienda"],
        },
        { name: "Blog", href: "/blog", hasDropdown: true, dropdownType: "blog" },
        {
            name: "Apps",
            href: "/apps",
            hasDropdown: true,
            dropdownType: "apps",
            matchHrefs: ["/apps", "/solar-survivor", "/calculadora"],
        },
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
        { name: "Tienda (física)", href: "/productos", badge: "Pronto" },
        { name: "Tienda (online)", href: "/tienda" },
        { name: "Kits completos (instalación)", href: "/ofertas" },
        { name: "Blog", href: "/blog" },
        { name: "Solar Survivor", href: "/solar-survivor" },
        { name: "Calculadora de Kw", href: "/calculadora" },
        { name: "Recomendador de ofertas", href: "/ofertas", badge: "IA" },
        { name: "Testimonios", href: "/testimonios" },
        { name: "Sobre Nosotros", href: "/sobre-nosotros" },
        { name: "Galeria", href: "/galeria" },
        { name: "Contacto", href: "/contacto" },
    ]

    return (
        <nav className="fixed top-2 lg:top-4 left-2 lg:left-4 right-2 lg:right-4 z-50">
            <div className="max-w-6xl mx-auto">
                {/* Christmas-themed navigation */}
                <div
                    className={`
            absolute inset-0 rounded-[16px] backdrop-blur-md border-2 transition-all duration-300
            ${scrolled
                            ? "bg-gradient-to-r from-emerald-900/95 via-green-800/95 to-emerald-900/95 border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                            : "bg-gradient-to-r from-emerald-800/70 via-green-700/70 to-emerald-800/70 border-red-400/20 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                        }
          `}
                ></div>

                <div className="relative z-10 w-full h-full flex items-center">
                    <div className="w-full px-4 lg:px-6 py-3 lg:py-4">
                        <div className="flex items-center justify-between">
                            {/* Logo with Christmas theme */}
                            <div className="flex items-center space-x-3">
                                <div className="relative w-8 h-8 lg:w-10 lg:h-10">
                                    <img src="/images/logo navidad.png" alt="Suncar Logo Navidad" className="object-contain rounded-lg" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg lg:text-xl font-bold text-white drop-shadow-lg font-[family-name:var(--font-cinzel)]">SUNCAR</span>
                                    <span className="text-[10px] text-red-200 font-semibold tracking-wide">🎄 Feliz Navidad 🎄</span>
                                </div>
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
                                        const isApps = item.dropdownType === "apps"
                                        const showDropdown = isBlog
                                            ? showBlogDropdown
                                            : isPrecios
                                                ? showPreciosDropdown
                                                : isNosotro
                                                    ? showNosotroDropdown
                                                    : showAppsDropdown
                                        const handleMouseEnter = isBlog
                                            ? handleBlogMouseEnter
                                            : isPrecios
                                                ? handlePreciosMouseEnter
                                                : isNosotro
                                                    ? handleNosotroMouseEnter
                                                    : handleAppsMouseEnter
                                        const handleMouseLeave = isBlog
                                            ? handleBlogMouseLeave
                                            : isPrecios
                                                ? handlePreciosMouseLeave
                                                : isNosotro
                                                    ? handleNosotroMouseLeave
                                                    : handleAppsMouseLeave

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
                                                        isHighlighted ? "text-yellow-300" : "text-white/90 hover:text-yellow-300"
                                                    )}
                                                    aria-current={isActive(item.href, matchHrefs) ? "page" : undefined}
                                                    onMouseEnter={() => handleHover(item.href)}
                                                    onMouseLeave={scheduleHoverReset}
                                                    onFocus={() => handleHover(item.href)}
                                                    onBlur={scheduleHoverReset}
                                                >
                                                    <span className="relative z-10 drop-shadow-md">{item.name}</span>
                                                    <ChevronDown
                                                        className={cn(
                                                            "w-4 h-4 transition-transform duration-300",
                                                            showDropdown && "rotate-180"
                                                        )}
                                                    />
                                                    <span
                                                        aria-hidden="true"
                                                        className={cn(
                                                            "pointer-events-none absolute inset-x-4 -bottom-2 h-[3px] rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 opacity-0 transition-all duration-300",
                                                            isHighlighted
                                                                ? "opacity-100 translate-y-0"
                                                                : "group-hover:opacity-100 group-hover:translate-y-0.5"
                                                        )}
                                                    />
                                                </Link>

                                                {/* Dropdown Menu - Christmas themed */}
                                                {showDropdown && (
                                                    <div className="absolute top-full left-0 mt-2 w-64 bg-gradient-to-br from-emerald-800/95 via-green-700/95 to-emerald-800/95 backdrop-blur-md rounded-xl shadow-2xl border-2 border-red-400/30 overflow-hidden z-50">
                                                        <div className="py-2">
                                                            {isBlog ? (
                                                                <>
                                                                    <Link
                                                                        href="/blog"
                                                                        className="block px-4 py-3 text-sm font-medium text-white hover:bg-red-600/30 hover:text-yellow-300 transition-colors duration-200"
                                                                        onClick={() => setShowBlogDropdown(false)}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <span>📰</span>
                                                                            <span>Todos los artículos</span>
                                                                        </div>
                                                                    </Link>
                                                                    <div className="border-t border-red-400/20 my-2"></div>
                                                                    {Object.entries(CATEGORIAS_INFO).map(([key, info]) => (
                                                                        <Link
                                                                            key={key}
                                                                            href={`/blog?categoria=${key}`}
                                                                            className="block px-4 py-2.5 text-sm text-white/90 hover:bg-red-600/30 hover:text-yellow-300 transition-colors duration-200"
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
                                                                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white hover:bg-red-600/30 hover:text-yellow-300 transition-colors duration-200"
                                                                        onClick={() => setShowPreciosDropdown(false)}
                                                                    >
                                                                        <span>Tienda (física)</span>
                                                                        <Badge className="bg-red-600 text-white text-[10px] px-2.5 py-0.5 font-semibold rounded-md">
                                                                            Pronto
                                                                        </Badge>
                                                                    </Link>
                                                                    <div className="border-t border-red-400/20 my-2"></div>
                                                                    <Link
                                                                        href="/tienda"
                                                                        className="block px-4 py-3 text-sm font-medium text-white hover:bg-red-600/30 hover:text-yellow-300 transition-colors duration-200"
                                                                        onClick={() => setShowPreciosDropdown(false)}
                                                                    >
                                                                        Tienda (online)
                                                                    </Link>
                                                                    <div className="border-t border-red-400/20 my-2"></div>
                                                                    <Link
                                                                        href="/ofertas"
                                                                        className="block px-4 py-3 text-sm font-medium text-white hover:bg-red-600/30 hover:text-yellow-300 transition-colors duration-200"
                                                                        onClick={() => setShowPreciosDropdown(false)}
                                                                    >
                                                                        Kits completos (instalación)
                                                                    </Link>
                                                                </>
                                                            ) : isNosotro ? (
                                                                <>
                                                                    <Link
                                                                        href="/sobre-nosotros"
                                                                        className="block px-4 py-3 text-sm font-medium text-white hover:bg-red-600/30 hover:text-yellow-300 transition-colors duration-200"
                                                                        onClick={() => setShowNosotroDropdown(false)}
                                                                    >
                                                                        Conócenos
                                                                    </Link>
                                                                    <div className="border-t border-red-400/20 my-2"></div>
                                                                    <Link
                                                                        href="/contacto"
                                                                        className="block px-4 py-3 text-sm font-medium text-white hover:bg-red-600/30 hover:text-yellow-300 transition-colors duration-200"
                                                                        onClick={() => setShowNosotroDropdown(false)}
                                                                    >
                                                                        Contacto
                                                                    </Link>
                                                                </>
                                                            ) : isApps ? (
                                                                <>
                                                                    <Link
                                                                        href="/solar-survivor"
                                                                        className="block px-4 py-3 text-sm font-medium text-white hover:bg-red-600/30 hover:text-yellow-300 transition-colors duration-200"
                                                                        onClick={() => setShowAppsDropdown(false)}
                                                                    >
                                                                        Solar Survivor
                                                                    </Link>
                                                                    <div className="border-t border-red-400/20 my-2"></div>
                                                                    <Link
                                                                        href="/calculadora"
                                                                        className="block px-4 py-3 text-sm font-medium text-white hover:bg-red-600/30 hover:text-yellow-300 transition-colors duration-200"
                                                                        onClick={() => setShowAppsDropdown(false)}
                                                                    >
                                                                        Calculadora de Kw
                                                                    </Link>
                                                                    <div className="border-t border-red-400/20 my-2"></div>
                                                                    <Link
                                                                        href="/ofertas"
                                                                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white hover:bg-red-600/30 hover:text-yellow-300 transition-colors duration-200"
                                                                        onClick={() => setShowAppsDropdown(false)}
                                                                    >
                                                                        <span>Recomendador de ofertas</span>
                                                                        <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-[10px] px-2.5 py-0.5 font-semibold rounded-md">
                                                                            IA
                                                                        </Badge>
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
                                                    isHighlighted ? "text-yellow-300" : "text-white/90 hover:text-yellow-300"
                                                )}
                                                aria-current={isActive(item.href, matchHrefs) ? "page" : undefined}
                                                onMouseEnter={() => handleHover(item.href)}
                                                onMouseLeave={scheduleHoverReset}
                                                onFocus={() => handleHover(item.href)}
                                                onBlur={scheduleHoverReset}
                                            >
                                                <span className="relative z-10 drop-shadow-md">{item.name}</span>
                                                {(item as any).isClient && (
                                                    <Badge className="relative z-10 bg-gradient-to-r from-red-600 to-green-600 text-white text-xs px-2 py-1 rounded-full">
                                                        Cliente
                                                    </Badge>
                                                )}
                                                <span
                                                    aria-hidden="true"
                                                    className={cn(
                                                        "pointer-events-none absolute inset-x-4 -bottom-2 h-[3px] rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 opacity-0 transition-all duration-300",
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

                            {/* CTA Button - Christmas themed */}
                            <div className="hidden md:block">
                                <Link
                                    href="/cotizacion"
                                    className="relative px-4 py-2 lg:px-6 lg:py-2 bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white font-semibold rounded-lg shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/60 transition-all duration-300 transform hover:scale-105 text-sm lg:text-base overflow-hidden group"
                                >
                                    <span className="relative z-10">🎁 Cotizar</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                </Link>
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="md:hidden p-2 text-white hover:text-yellow-300 transition-colors"
                            >
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>

                        {/* Mobile Navigation - Christmas themed */}
                        {isOpen && (
                            <div className="md:hidden mt-3 pt-3 border-t border-red-400/30">
                                <div className="flex flex-col space-y-2">
                                    {mobileNavItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300",
                                                isActive(item.href, item.matchHrefs)
                                                    ? "bg-red-600/40 text-yellow-300 shadow-sm ring-1 ring-yellow-400/30"
                                                    : "text-white/90 hover:text-yellow-300 hover:bg-red-600/20"
                                            )}
                                            aria-current={isActive(item.href, item.matchHrefs) ? "page" : undefined}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {item.name}
                                            {item.badge && (
                                                <Badge className="bg-red-600 text-white text-[10px] px-2.5 py-0.5 font-semibold rounded-md">
                                                    {item.badge}
                                                </Badge>
                                            )}
                                            {(item as any).isClient && (
                                                <Badge className="bg-gradient-to-r from-red-600 to-green-600 text-white text-xs px-2 py-1 rounded-full">
                                                    Cliente
                                                </Badge>
                                            )}
                                        </Link>
                                    ))}
                                    <Link
                                        href="/cotizacion"
                                        className="mt-3 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 w-full text-sm text-center block"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        🎁 Cotizar
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav >
    )
}
