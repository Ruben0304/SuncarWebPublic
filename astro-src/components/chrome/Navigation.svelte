<script lang="ts">
  import { onMount } from "svelte";
  import Menu from "lucide-svelte/icons/menu";
  import X from "lucide-svelte/icons/x";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import { cn } from "@/lib/utils";
  import { imageSrcset, optimizedImage } from "@/lib/image";

  type DropdownItem = { name: string; href: string; badge?: string; badgeVariant?: "default" | "ia" };
  type NavItem = { name: string; href: string; matchHrefs?: string[]; dropdown?: DropdownItem[] };

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
        { name: "Recomendador de ofertas", href: "/ofertas?modo=armar", badge: "IA", badgeVariant: "ia" },
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

  // "ventas" en las páginas de Suncar Ventas (tienda): mismo menú, su logo.
  let { marca = "suncar" }: { marca?: "suncar" | "ventas" } = $props();

  let isOpen = $state(false);
  let scrolled = $state(false);
  let hoveredHref: string | null = $state(null);
  let openDropdown: string | null = $state(null);
  let expandedSections: string[] = $state([]);
  let pathname = $state("");

  let hoverResetTimeout: ReturnType<typeof setTimeout> | null = null;
  let dropdownTimeout: ReturnType<typeof setTimeout> | null = null;

  function isActive(href: string, matchHrefs?: string[]) {
    if (!pathname) return false;
    const targets = matchHrefs && matchHrefs.length > 0 ? matchHrefs : [href];
    return targets.some((destino) => {
      const target = destino.split("?")[0];
      if (target === "/") return pathname === "/";
      return pathname.startsWith(target);
    });
  }

  function clearHoverReset() {
    if (hoverResetTimeout) {
      clearTimeout(hoverResetTimeout);
      hoverResetTimeout = null;
    }
  }
  function handleHover(href: string) {
    clearHoverReset();
    hoveredHref = href;
  }
  function scheduleHoverReset() {
    clearHoverReset();
    hoverResetTimeout = setTimeout(() => (hoveredHref = null), 160);
  }
  function handleDropdownEnter(name: string) {
    if (dropdownTimeout) clearTimeout(dropdownTimeout);
    openDropdown = name;
  }
  function handleDropdownLeave() {
    dropdownTimeout = setTimeout(() => (openDropdown = null), 200);
  }
  function toggleSection(name: string) {
    expandedSections = expandedSections.includes(name)
      ? expandedSections.filter((n) => n !== name)
      : [...expandedSections, name];
  }
  function closeMobileMenu() {
    isOpen = false;
    expandedSections = [];
  }

  onMount(() => {
    pathname = window.location.pathname;
    const handleScroll = () => (scrolled = window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearHoverReset();
      if (dropdownTimeout) clearTimeout(dropdownTimeout);
    };
  });
</script>

<nav class="fixed top-2 lg:top-4 left-2 lg:left-4 right-2 lg:right-4 z-50">
  <div class="max-w-6xl mx-auto">
    <div
      class={cn(
        "absolute inset-0 rounded-[16px] bg-white/60 backdrop-blur-md border border-white/250 transition-all duration-300",
        scrolled && "bg-white/90",
      )}
    ></div>
    <div class="relative z-10 w-full h-full flex items-center">
      <div class="w-full px-4 lg:px-6 py-3 lg:py-4">
        <div class="flex items-center justify-between">
          <a href="/" class="flex items-center shrink-0">
            {#if marca === "ventas"}
              <img
                src="/images/logo-suncarventas-horizontal.svg"
                alt="SuncarVentas — Tú energía con nosotros"
                height="40"
                width="189"
                class="h-7 lg:h-8 w-auto object-contain"
                loading="eager"
                fetchpriority="high"
                decoding="async"
              />
            {:else}
              <img
                src={optimizedImage("/images/logo-horizontal.png", 292)}
                srcset={imageSrcset("/images/logo-horizontal.png", [146, 292])}
                sizes="146px"
                alt="Suncar — Energía que transforma"
                height="40"
                width="146"
                class="h-7 lg:h-8 w-auto object-contain"
                loading="eager"
                fetchpriority="high"
                decoding="async"
              />
            {/if}
          </a>

          <div class="hidden md:flex items-center space-x-3 lg:space-x-4" onmouseleave={scheduleHoverReset}>
            {#each navItems as item (item.name)}
              {@const isHighlighted = hoveredHref === item.href || (!hoveredHref && isActive(item.href, item.matchHrefs))}
              {#if item.dropdown}
                {@const showDropdown = openDropdown === item.name}
                <div class="relative" onmouseenter={() => handleDropdownEnter(item.name)} onmouseleave={handleDropdownLeave}>
                  <a
                    href={item.href}
                    class={cn(
                      "group relative flex items-center gap-1 px-4 py-1.5 text-sm font-medium transition-all duration-300",
                      isHighlighted ? "text-primary" : "text-gray-700 hover:text-primary",
                    )}
                    aria-current={isActive(item.href, item.matchHrefs) ? "page" : undefined}
                    onmouseenter={() => handleHover(item.href)}
                    onmouseleave={scheduleHoverReset}
                    onfocus={() => handleHover(item.href)}
                    onblur={scheduleHoverReset}
                  >
                    <span class="relative z-10">{item.name}</span>
                    <ChevronDown class={cn("w-4 h-4 transition-transform duration-300", showDropdown && "rotate-180")} />
                    <span
                      aria-hidden="true"
                      class={cn(
                        "pointer-events-none absolute inset-x-4 -bottom-2 h-[3px] rounded-full bg-gradient-to-r from-[#012928] via-[#F2C300] to-[#012928] opacity-0 transition-all duration-300",
                        isHighlighted ? "opacity-100 translate-y-0" : "group-hover:opacity-100 group-hover:translate-y-0.5",
                      )}
                    ></span>
                  </a>

                  {#if showDropdown}
                    <div class="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                      <div class="py-2">
                        {#each item.dropdown as sub, index (sub.name + sub.href)}
                          {#if index > 0}
                            <div class="border-t border-gray-200 my-2"></div>
                          {/if}
                          <a
                            href={sub.href}
                            class="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors duration-200"
                            onclick={() => (openDropdown = null)}
                          >
                            <span>{sub.name}</span>
                            {#if sub.badge}
                              <span
                                class={cn(
                                  "inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] font-semibold",
                                  sub.badgeVariant === "ia" ? "bg-[#0A052D] text-[#AFEB17]" : "bg-primary text-white",
                                )}
                              >
                                {sub.badge}
                              </span>
                            {/if}
                          </a>
                        {/each}
                      </div>
                    </div>
                  {/if}
                </div>
              {:else}
                <div class="relative">
                  <a
                    href={item.href}
                    class={cn(
                      "group relative flex items-center gap-2 px-4 py-1.5 text-sm font-medium transition-all duration-300",
                      isHighlighted ? "text-primary" : "text-gray-700 hover:text-primary",
                    )}
                    aria-current={isActive(item.href, item.matchHrefs) ? "page" : undefined}
                    onmouseenter={() => handleHover(item.href)}
                    onmouseleave={scheduleHoverReset}
                    onfocus={() => handleHover(item.href)}
                    onblur={scheduleHoverReset}
                  >
                    <span class="relative z-10">{item.name}</span>
                    <span
                      aria-hidden="true"
                      class={cn(
                        "pointer-events-none absolute inset-x-4 -bottom-2 h-[3px] rounded-full bg-gradient-to-r from-[#012928] via-[#F2C300] to-[#012928] opacity-0 transition-all duration-300",
                        isHighlighted ? "opacity-100 translate-y-0" : "group-hover:opacity-100 group-hover:translate-y-0.5",
                      )}
                    ></span>
                  </a>
                </div>
              {/if}
            {/each}
          </div>

          <button
            onclick={() => (isOpen ? closeMobileMenu() : (isOpen = true))}
            class="md:hidden p-2 text-gray-700 hover:text-primary transition-colors"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {#if isOpen}
              <X size={24} />
            {:else}
              <Menu size={24} />
            {/if}
          </button>
        </div>

        {#if isOpen}
          <div class="md:hidden mt-3 pt-3 border-t border-gray-200/50">
            <div class="flex flex-col space-y-1">
              {#each navItems as item (item.name)}
                {#if item.dropdown}
                  {@const expanded = expandedSections.includes(item.name)}
                  <div>
                    <button
                      type="button"
                      onclick={() => toggleSection(item.name)}
                      aria-expanded={expanded}
                      class={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300",
                        isActive(item.href, item.matchHrefs)
                          ? "bg-white/80 text-primary shadow-sm ring-1 ring-primary/20"
                          : "text-gray-700 hover:text-primary hover:bg-white/60",
                      )}
                    >
                      <span>{item.name}</span>
                      <ChevronDown class={cn("w-4 h-4 transition-transform duration-300", expanded && "rotate-180")} />
                    </button>
                    {#if expanded}
                      <div class="mt-1 ml-3 flex flex-col space-y-1 border-l border-gray-200/70 pl-3">
                        {#each item.dropdown as sub (sub.name + sub.href)}
                          <a
                            href={sub.href}
                            class={cn(
                              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-300",
                              isActive(sub.href)
                                ? "bg-white/80 text-primary shadow-sm ring-1 ring-primary/20"
                                : "text-gray-600 hover:text-primary hover:bg-white/60",
                            )}
                            onclick={closeMobileMenu}
                          >
                            <span>{sub.name}</span>
                            {#if sub.badge}
                              <span
                                class={cn(
                                  "inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] font-semibold",
                                  sub.badgeVariant === "ia" ? "bg-[#0A052D] text-[#AFEB17]" : "bg-primary text-white",
                                )}
                              >
                                {sub.badge}
                              </span>
                            {/if}
                          </a>
                        {/each}
                      </div>
                    {/if}
                  </div>
                {:else}
                  <a
                    href={item.href}
                    class={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300",
                      isActive(item.href, item.matchHrefs)
                        ? "bg-white/80 text-primary shadow-sm ring-1 ring-primary/20"
                        : "text-gray-700 hover:text-primary hover:bg-white/60",
                    )}
                    aria-current={isActive(item.href, item.matchHrefs) ? "page" : undefined}
                    onclick={closeMobileMenu}
                  >
                    {item.name}
                  </a>
                {/if}
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</nav>
