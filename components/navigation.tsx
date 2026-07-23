"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type DropdownItem = {
  name: string;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "ia";
};

type NavItem = {
  name: string;
  href: string;
  matchHrefs?: string[];
  dropdown?: DropdownItem[];
};

const navItems: NavItem[] = [
  { name: "Inicio", href: "/" },
  {
    name: "Suncar Instaladora",
    href: "/ofertas",
    matchHrefs: ["/ofertas", "/servicios", "/calculadora"],
    dropdown: [
      { name: "Kits de instalación", href: "/ofertas" },
      { name: "Servicios", href: "/servicios" },
      { name: "Calculadora de Kw", href: "/calculadora" },
      {
        name: "Recomendador de ofertas",
        href: "/ofertas",
        badge: "IA",
        badgeVariant: "ia",
      },
    ],
  },
  {
    name: "Suncar Ventas",
    href: "/productos",
    matchHrefs: ["/productos", "/tienda"],
    dropdown: [
      { name: "Productos Online", href: "/productos" },
      { name: "Tienda Física", href: "/tienda", badge: "Pronto" },
    ],
  },
  {
    name: "Instalaciones",
    href: "/galeria",
    matchHrefs: ["/galeria", "/testimonios"],
    dropdown: [
      { name: "Galería", href: "/galeria" },
      { name: "Testimonios", href: "/testimonios" },
    ],
  },
  {
    name: "Nosotros",
    href: "/sobre-nosotros",
    matchHrefs: ["/sobre-nosotros", "/blog", "/contacto", "/solar-survivor"],
    dropdown: [
      { name: "Conócenos", href: "/sobre-nosotros" },
      { name: "Blog", href: "/blog" },
      { name: "Contacto", href: "/contacto" },
      { name: "Solar Survivor", href: "/solar-survivor" },
    ],
  },
];

function DropdownBadge({ item }: { item: DropdownItem }) {
  if (!item.badge) return null;
  return (
    <Badge
      className={cn(
        "text-[10px] px-2.5 py-0.5 font-semibold rounded-md",
        item.badgeVariant === "ia"
          ? "bg-[#0A052D] text-[#AFEB17]"
          : "bg-primary text-white",
      )}
    >
      {item.badge}
    </Badge>
  );
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const hoverResetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  const isActive = (href: string, matchHrefs?: string[]) => {
    if (!pathname) return false;
    const targets = matchHrefs && matchHrefs.length > 0 ? matchHrefs : [href];
    return targets.some((target) => {
      if (target === "/") return pathname === "/";
      return pathname.startsWith(target);
    });
  };

  const clearHoverReset = () => {
    if (hoverResetTimeout.current) {
      clearTimeout(hoverResetTimeout.current);
      hoverResetTimeout.current = null;
    }
  };

  const handleHover = (href: string) => {
    clearHoverReset();
    setHoveredHref(href);
  };

  const scheduleHoverReset = () => {
    clearHoverReset();
    hoverResetTimeout.current = setTimeout(() => {
      setHoveredHref(null);
    }, 160);
  };

  const handleDropdownEnter = (name: string) => {
    if (dropdownTimeout.current) {
      clearTimeout(dropdownTimeout.current);
    }
    setOpenDropdown(name);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 200);
  };

  const toggleSection = (name: string) => {
    setExpandedSections((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name],
    );
  };

  const closeMobileMenu = () => {
    setIsOpen(false);
    setExpandedSections([]);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    return () => {
      clearHoverReset();
      if (dropdownTimeout.current) {
        clearTimeout(dropdownTimeout.current);
      }
    };
  }, []);

  return (
    <nav className="fixed top-2 lg:top-4 left-2 lg:left-4 right-2 lg:right-4 z-50">
      <div className="max-w-6xl mx-auto">
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
              <Link href="/" className="flex items-center shrink-0">
                <Image
                  src="/images/logo-horizontal.png"
                  alt="Suncar — Energía que transforma"
                  height={40}
                  width={146}
                  className="h-7 lg:h-8 w-auto object-contain"
                  priority
                />
              </Link>

              {/* Desktop Navigation */}
              <div
                className="hidden md:flex items-center space-x-3 lg:space-x-4"
                onMouseLeave={scheduleHoverReset}
              >
                {navItems.map((item) => {
                  const isHighlighted =
                    hoveredHref === item.href ||
                    (!hoveredHref && isActive(item.href, item.matchHrefs));

                  if (item.dropdown) {
                    const showDropdown = openDropdown === item.name;

                    return (
                      <div
                        key={item.name}
                        className="relative"
                        onMouseEnter={() => handleDropdownEnter(item.name)}
                        onMouseLeave={handleDropdownLeave}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            "group relative flex items-center gap-1 px-4 py-1.5 text-sm font-medium transition-all duration-300",
                            isHighlighted
                              ? "text-primary"
                              : "text-gray-700 hover:text-primary",
                          )}
                          aria-current={
                            isActive(item.href, item.matchHrefs)
                              ? "page"
                              : undefined
                          }
                          onMouseEnter={() => handleHover(item.href)}
                          onMouseLeave={scheduleHoverReset}
                          onFocus={() => handleHover(item.href)}
                          onBlur={scheduleHoverReset}
                        >
                          <span className="relative z-10">{item.name}</span>
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform duration-300",
                              showDropdown && "rotate-180",
                            )}
                          />
                          <span
                            aria-hidden="true"
                            className={cn(
                              "pointer-events-none absolute inset-x-4 -bottom-2 h-[3px] rounded-full bg-gradient-to-r from-[#012928] via-[#F2C300] to-[#012928] opacity-0 transition-all duration-300",
                              isHighlighted
                                ? "opacity-100 translate-y-0"
                                : "group-hover:opacity-100 group-hover:translate-y-0.5",
                            )}
                          />
                        </Link>

                        {/* Dropdown Menu */}
                        {showDropdown && (
                          <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                            <div className="py-2">
                              {item.dropdown.map((sub, index) => (
                                <div key={`${sub.name}-${sub.href}`}>
                                  {index > 0 && (
                                    <div className="border-t border-gray-200 my-2"></div>
                                  )}
                                  <Link
                                    href={sub.href}
                                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors duration-200"
                                    onClick={() => setOpenDropdown(null)}
                                  >
                                    <span>{sub.name}</span>
                                    <DropdownBadge item={sub} />
                                  </Link>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={item.name} className="relative">
                      <Link
                        href={item.href}
                        className={cn(
                          "group relative flex items-center gap-2 px-4 py-1.5 text-sm font-medium transition-all duration-300",
                          isHighlighted
                            ? "text-primary"
                            : "text-gray-700 hover:text-primary",
                        )}
                        aria-current={
                          isActive(item.href, item.matchHrefs)
                            ? "page"
                            : undefined
                        }
                        onMouseEnter={() => handleHover(item.href)}
                        onMouseLeave={scheduleHoverReset}
                        onFocus={() => handleHover(item.href)}
                        onBlur={scheduleHoverReset}
                      >
                        <span className="relative z-10">{item.name}</span>
                        <span
                          aria-hidden="true"
                          className={cn(
                            "pointer-events-none absolute inset-x-4 -bottom-2 h-[3px] rounded-full bg-gradient-to-r from-[#012928] via-[#F2C300] to-[#012928] opacity-0 transition-all duration-300",
                            isHighlighted
                              ? "opacity-100 translate-y-0"
                              : "group-hover:opacity-100 group-hover:translate-y-0.5",
                          )}
                        />
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* CTA Button — deshabilitado temporalmente */}
              {/*
              <div className="hidden md:block">
                <Link
                  href="/cotizacion"
                  className="px-4 py-2 lg:px-6 lg:py-2 bg-[#012928] text-white font-semibold rounded-lg hover:bg-[#011818] hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm lg:text-base"
                >
                  Cotizar
                </Link>
              </div>
              */}

              {/* Mobile Menu Button */}
              <button
                onClick={() => (isOpen ? closeMobileMenu() : setIsOpen(true))}
                className="md:hidden p-2 text-gray-700 hover:text-primary transition-colors"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
              <div className="md:hidden mt-3 pt-3 border-t border-gray-200/50">
                <div className="flex flex-col space-y-1">
                  {navItems.map((item) => {
                    if (item.dropdown) {
                      const expanded = expandedSections.includes(item.name);
                      return (
                        <div key={item.name}>
                          <button
                            type="button"
                            onClick={() => toggleSection(item.name)}
                            aria-expanded={expanded}
                            className={cn(
                              "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300",
                              isActive(item.href, item.matchHrefs)
                                ? "bg-white/80 text-primary shadow-sm ring-1 ring-primary/20"
                                : "text-gray-700 hover:text-primary hover:bg-white/60",
                            )}
                          >
                            <span>{item.name}</span>
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 transition-transform duration-300",
                                expanded && "rotate-180",
                              )}
                            />
                          </button>
                          {expanded && (
                            <div className="mt-1 ml-3 flex flex-col space-y-1 border-l border-gray-200/70 pl-3">
                              {item.dropdown.map((sub) => (
                                <Link
                                  key={`${sub.name}-${sub.href}`}
                                  href={sub.href}
                                  className={cn(
                                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-300",
                                    isActive(sub.href)
                                      ? "bg-white/80 text-primary shadow-sm ring-1 ring-primary/20"
                                      : "text-gray-600 hover:text-primary hover:bg-white/60",
                                  )}
                                  onClick={closeMobileMenu}
                                >
                                  <span>{sub.name}</span>
                                  <DropdownBadge item={sub} />
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300",
                          isActive(item.href, item.matchHrefs)
                            ? "bg-white/80 text-primary shadow-sm ring-1 ring-primary/20"
                            : "text-gray-700 hover:text-primary hover:bg-white/60",
                        )}
                        aria-current={
                          isActive(item.href, item.matchHrefs)
                            ? "page"
                            : undefined
                        }
                        onClick={closeMobileMenu}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                  {/* Cotizar deshabilitado temporalmente */}
                  {/*
                  <Link
                    href="/cotizacion"
                    className="mt-3 px-4 py-2 bg-[#012928] text-white font-semibold rounded-lg hover:bg-[#011818] hover:shadow-lg transition-all duration-300 w-full text-sm text-center block"
                    onClick={closeMobileMenu}
                  >
                    Cotizar
                  </Link>
                  */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
