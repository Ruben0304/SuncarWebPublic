"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/navigation";
import NavigationChristmas from "@/components/navigation-christmas";
import Footer from "@/components/footer";
import FooterChristmas from "@/components/footer-christmas";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  Zap,
  X,
  Shield,
  Info,
  Plus,
  Minus,
  ShoppingCart,
  Eye,
} from "lucide-react";
import Image from "next/image";
import { ArticuloTienda } from "@/types/tienda";
import { useAOS } from "@/hooks/useAOS";
import ProductDetailModal from "@/components/ProductDetailModal";
import { isChristmasSeason } from "@/lib/christmas-utils";
import ShoppingCartComponent from "@/components/ShoppingCart";
import { useCart } from "@/hooks/useCart";

const SHOW_PRODUCTS_MAINTENANCE = true;

export default function TiendaPage() {
  const [productos, setProductos] = useState<ArticuloTienda[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<ArticuloTienda[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChristmas, setIsChristmas] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(
    null,
  );

  const [selectedProduct, setSelectedProduct] = useState<ArticuloTienda | null>(
    null,
  );
  const scrollersRef = useRef<Record<string, HTMLDivElement | null>>({});
  const [scrollPositions, setScrollPositions] = useState<
    Record<string, number>
  >({});
  const [showToast, setShowToast] = useState(false);

  const { addItem, items, updateQuantity } = useCart();

  // Función para obtener la cantidad de un producto en el carrito
  const getProductQuantityInCart = (productoId: string) => {
    const item = items.find((i) => i.producto.id === productoId);
    return item ? item.cantidad : 0;
  };

  // Función para mostrar notificación cuando se agrega al carrito
  const showAddToCartNotification = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  useAOS({ duration: 600, once: true, easing: "ease-out" });

  // Detectar posición de scroll para cada categoría
  const handleScroll = (
    categoria: string,
    e: React.UIEvent<HTMLDivElement>,
  ) => {
    const target = e.currentTarget;
    const scrollPercentage =
      (target.scrollLeft / (target.scrollWidth - target.clientWidth)) * 100;
    setScrollPositions((prev) => ({ ...prev, [categoria]: scrollPercentage }));
  };

  useEffect(() => {
    setIsChristmas(isChristmasSeason());
  }, []);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/productos-catalogo");

      if (!response.ok) {
        throw new Error("Error al cargar los productos");
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setProductos(data.data);
        setFilteredProductos(data.data);
      } else {
        throw new Error(data.message || "Error al procesar los productos");
      }
    } catch (err) {
      console.error("Error fetching productos:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const categorias = useMemo(() => {
    const categoriasSet = new Set<string>();
    productos.forEach((p) => {
      if (p.categoria) categoriasSet.add(p.categoria);
    });
    return Array.from(categoriasSet).sort();
  }, [productos]);

  useEffect(() => {
    let result = [...productos];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.modelo.toLowerCase().includes(lowerSearch) ||
          p.categoria.toLowerCase().includes(lowerSearch) ||
          p.descripcion_uso?.toLowerCase().includes(lowerSearch) ||
          p.marca_nombre?.toLowerCase().includes(lowerSearch),
      );
    }

    if (selectedCategoria) {
      result = result.filter((p) => p.categoria === selectedCategoria);
    }

    setFilteredProductos(result);
  }, [productos, searchTerm, selectedCategoria]);

  const categoriasVisibles = useMemo(() => {
    const base = selectedCategoria ? [selectedCategoria] : categorias;
    return base.filter((cat) =>
      filteredProductos.some((p) => p.categoria === cat),
    );
  }, [categorias, selectedCategoria, filteredProductos]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategoria(null);
  };

  const scrollCategoria = (categoria: string, direction: "left" | "right") => {
    const container = scrollersRef.current[categoria];
    if (!container) return;

    const card = container.querySelector<HTMLElement>("[data-product-card]");
    const cardWidth = card ? card.getBoundingClientRect().width : 320;
    const gap = 16; // gap-4
    const offset = direction === "left" ? -1 : 1;

    container.scrollBy({
      left: offset * (cardWidth + gap),
      behavior: "smooth",
    });
  };

  const hasActiveFilters = Boolean(searchTerm || selectedCategoria);

  if (SHOW_PRODUCTS_MAINTENANCE) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
        {isChristmas ? <NavigationChristmas /> : <Navigation />}

        <main className="pt-28 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-white/50 p-10 md:p-16">
              <Badge className="mx-auto mb-6 bg-secondary-gradient text-white px-4 py-1 text-sm">
                En mantenimiento
              </Badge>

              <h1 className="text-3xl md:text-5xl font-bold text-primary mb-6">
                Estamos actualizando esta sección
              </h1>

              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                Estamos actualizando los precios para hacerlos más asequibles.
                Vuelve pronto para ver el catálogo de productos sueltos con los
                nuevos valores.
              </p>
            </div>
          </div>
        </main>

        {isChristmas ? <FooterChristmas /> : <Footer />}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
        {isChristmas ? <NavigationChristmas /> : <Navigation />}
        <main className="pt-28 pb-20 px-4">
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        </main>
        {isChristmas ? <FooterChristmas /> : <Footer />}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
        {isChristmas ? <NavigationChristmas /> : <Navigation />}
        <main className="pt-28 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-8 text-center">
                <p className="text-red-800 font-semibold mb-2">
                  Error al cargar productos
                </p>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <Button
                  onClick={fetchProductos}
                  className="bg-primary hover:bg-primary/90"
                >
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        {isChristmas ? <FooterChristmas /> : <Footer />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {isChristmas ? <NavigationChristmas /> : <Navigation />}

      <main className="pt-36 pb-16">
        <section className="px-4">
          <div
            className="max-w-7xl mx-auto space-y-4 text-center items-center flex flex-col"
            data-aos="fade-down"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              ¡Encuentra tu equipo solar ideal!
            </h1>
            <p className="text-lg text-slate-700 max-w-3xl font-medium">
              Explora nuestro catálogo completo de inversores, paneles, baterías
              y más. Calidad garantizada para tu instalación solar.
            </p>
          </div>
        </section>

        <section className="px-4 mt-10" data-aos="fade-up">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Barra de búsqueda mejorada */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-orange-500/5 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-xl" />
                  <div className="relative flex items-center gap-3 bg-white rounded-xl border-2 border-slate-200 px-4 py-3 transition-all group-focus-within:border-primary group-focus-within:shadow-md">
                    <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      type="text"
                      placeholder="Buscar por modelo, categoría, marca o descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-slate-400"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                  <Filter className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-slate-700">
                    {filteredProductos.length}{" "}
                    {filteredProductos.length === 1 ? "producto" : "productos"}
                  </span>
                </div>
              </div>

              {/* Filtros de categoría */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Categorías:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 md:gap-2 flex-1">
                    <Button
                      onClick={() => setSelectedCategoria(null)}
                      variant={
                        selectedCategoria === null ? "default" : "outline"
                      }
                      size="sm"
                      className={`h-8 text-xs md:text-sm px-3 md:px-4 ${
                        selectedCategoria === null
                          ? "bg-secondary-gradient text-white border-none shadow-md hover:shadow-lg"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Todas
                    </Button>
                    {categorias.map((cat) => (
                      <Button
                        key={cat}
                        onClick={() => setSelectedCategoria(cat)}
                        variant={
                          selectedCategoria === cat ? "default" : "outline"
                        }
                        size="sm"
                        className={`h-8 text-xs md:text-sm px-3 md:px-4 ${
                          selectedCategoria === cat
                            ? "bg-secondary-gradient text-white border-none shadow-md hover:shadow-lg"
                            : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                  {hasActiveFilters && (
                    <Button
                      onClick={clearFilters}
                      variant="ghost"
                      size="sm"
                      className="text-slate-600 hover:bg-slate-100 h-8 text-xs md:text-sm px-3 self-start sm:self-auto"
                    >
                      <X className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 mt-10">
          <div className="max-w-7xl mx-auto space-y-10">
            {filteredProductos.length === 0 ? (
              <div className="text-center py-20" data-aos="fade-up">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-500 mb-4">
                  Ajusta la búsqueda o cambia la categoría para ver resultados.
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    Limpiar filtros
                  </Button>
                )}
              </div>
            ) : (
              categoriasVisibles.map((categoria, catIndex) => {
                const productosDeCategoria = filteredProductos.filter(
                  (p) => p.categoria === categoria,
                );

                return (
                  <div
                    key={categoria}
                    data-aos="fade-up"
                    data-aos-delay={catIndex * 80}
                  >
                    <div className="relative mb-5">
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-primary/20 via-slate-200 to-transparent" />
                      <div className="relative inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
                        <span className="text-sm font-semibold text-slate-900">
                          {categoria}
                        </span>
                      </div>
                    </div>

                    <div className="relative px-12">
                      {productosDeCategoria.length > 2 && (
                        <>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full shadow-xl bg-white text-primary border-2 border-primary/20 hover:bg-primary hover:text-white hover:scale-110 transition-all"
                            onClick={() => scrollCategoria(categoria, "left")}
                            aria-label={`Ver productos anteriores de ${categoria}`}
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full shadow-xl bg-white text-primary border-2 border-primary/20 hover:bg-primary hover:text-white hover:scale-110 transition-all"
                            onClick={() => scrollCategoria(categoria, "right")}
                            aria-label={`Ver más productos de ${categoria}`}
                          >
                            <ChevronRight className="w-6 h-6" />
                          </Button>
                        </>
                      )}

                      <div className="relative">
                        <div
                          ref={(el) => {
                            if (el) scrollersRef.current[categoria] = el;
                          }}
                          onScroll={(e) => handleScroll(categoria, e)}
                          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
                          style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                          }}
                        >
                          {productosDeCategoria.map((producto, index) => (
                            <Card
                              key={producto.id}
                              data-product-card
                              className="group min-w-[200px] max-w-[240px] sm:min-w-[240px] sm:max-w-[280px] md:min-w-[260px] md:max-w-[320px] snap-start border border-slate-200/70 bg-white/90 backdrop-blur shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                              data-aos="fade-up"
                              data-aos-delay={Math.min(200, index * 60)}
                            >
                              <div
                                className="cursor-pointer"
                                onClick={() => setSelectedProduct(producto)}
                              >
                                <div className="relative h-36 sm:h-40 md:h-48 bg-gradient-to-br from-slate-50 via-white to-primary/5 overflow-hidden">
                                  {producto.foto ? (
                                    <Image
                                      src={producto.foto}
                                      alt={producto.modelo}
                                      fill
                                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full">
                                      <Package className="w-16 h-16 text-gray-300" />
                                    </div>
                                  )}
                                  <Badge className="absolute top-2 left-2 md:top-3 md:left-3 bg-white/90 text-primary border border-primary/10 shadow-sm text-[10px] md:text-xs px-2 py-0.5">
                                    {producto.categoria}
                                  </Badge>
                                  <div className="absolute top-2 right-2 md:top-3 md:right-3 flex flex-col items-end gap-1">
                                    {producto.precio_por_cantidad && (
                                      <span className="px-2 py-0.5 md:px-3 md:py-1 text-[9px] md:text-xs font-semibold text-amber-900 bg-gradient-to-r from-amber-100 via-amber-50 to-white rounded-full border border-amber-200 shadow-sm">
                                        Descuento
                                      </span>
                                    )}
                                    {producto.marca_nombre && (
                                      <Badge className="bg-blue-600/90 text-white border-none text-[9px] md:text-[10px] px-1.5 py-0.5 shadow-sm">
                                        {producto.marca_nombre}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <CardContent className="p-3 md:p-4 space-y-2 md:space-y-3">
                                  <div>
                                    <h3 className="font-bold text-sm md:text-lg text-slate-900 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                                      {producto.modelo}
                                    </h3>
                                    {producto.potenciaKW != null && (
                                      <span className="inline-flex items-center gap-1 text-[10px] md:text-xs text-primary font-semibold">
                                        <Zap className="w-3 h-3" />
                                        {producto.potenciaKW} kW
                                      </span>
                                    )}
                                    {producto.descripcion_uso && (
                                      <p className="text-xs md:text-sm text-slate-600 line-clamp-2">
                                        {producto.descripcion_uso}
                                      </p>
                                    )}
                                  </div>

                                  <div className="space-y-1.5 md:space-y-2">
                                    <div className="flex items-end justify-between gap-2">
                                      <div>
                                        <div className="text-lg md:text-2xl font-bold text-slate-900">
                                          ${producto.precio.toLocaleString()}
                                        </div>
                                        <div
                                          className={
                                            producto.precio_por_cantidad
                                              ? "text-primary underline decoration-primary/60 decoration-2 underline-offset-4 font-semibold text-xs md:text-sm"
                                              : "text-gray-500 text-xs md:text-sm"
                                          }
                                        >
                                          Por {producto.unidad}
                                        </div>
                                      </div>
                                    </div>

                                    {producto.precio_por_cantidad && (
                                      <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 md:px-3 py-1.5 md:py-2 shadow-inner">
                                        <Zap className="w-3 h-3 md:w-4 md:h-4" />
                                        <span>Mejor precio por volumen</span>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </div>

                              {/* Botones de acción */}
                              <div className="p-3 md:p-4 pt-0 grid grid-cols-2 gap-1.5 md:gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProduct(producto);
                                  }}
                                  className="border-slate-300 text-slate-700 hover:bg-slate-50 h-8 md:h-9 text-xs md:text-sm px-2 md:px-3"
                                >
                                  <Eye className="w-3.5 h-3.5 md:mr-1.5" />
                                  <span className="hidden md:inline">
                                    Ver más
                                  </span>
                                </Button>

                                {(() => {
                                  const quantityInCart =
                                    getProductQuantityInCart(producto.id);

                                  if (quantityInCart > 0) {
                                    return (
                                      <div className="flex items-center gap-0.5 md:gap-1 bg-white rounded-lg border-2 border-primary h-8 md:h-9">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateQuantity(
                                              producto.id,
                                              quantityInCart - 1,
                                            );
                                          }}
                                          className="h-full px-1.5 md:px-2 hover:bg-primary/10 rounded-l-lg"
                                        >
                                          <Minus className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                                        </Button>
                                        <span className="flex-1 text-center font-bold text-primary text-xs md:text-sm">
                                          {quantityInCart}
                                        </span>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            showAddToCartNotification();
                                            addItem(producto);
                                          }}
                                          className="h-full px-1.5 md:px-2 hover:bg-primary/10 rounded-r-lg"
                                        >
                                          <Plus className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                                        </Button>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          showAddToCartNotification();
                                          addItem(producto);
                                        }}
                                        className="bg-secondary-gradient text-white shadow-md hover:shadow-lg relative overflow-hidden h-8 md:h-9 text-xs md:text-sm px-2 md:px-3"
                                      >
                                        <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                        Agregar
                                      </Button>
                                    );
                                  }
                                })()}
                              </div>
                            </Card>
                          ))}
                        </div>

                        {/* Indicador de scroll mejorado - Oculto en móvil */}
                        {productosDeCategoria.length > 3 && (
                          <div className="hidden md:flex items-center justify-center mt-6 gap-3">
                            {/* Barra de progreso */}
                            <div className="relative w-full max-w-xs h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="absolute top-0 left-0 h-full bg-secondary-gradient rounded-full transition-all duration-300 shadow-md"
                                style={{
                                  width: `${scrollPositions[categoria] || 0}%`,
                                }}
                              />
                            </div>

                            {/* Indicador visual de dirección */}
                            <div className="flex gap-1">
                              <div
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${(scrollPositions[categoria] || 0) > 10 ? "bg-primary scale-125" : "bg-slate-300"}`}
                              />
                              <div
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${(scrollPositions[categoria] || 0) > 40 && (scrollPositions[categoria] || 0) < 60 ? "bg-primary scale-125" : "bg-slate-300"}`}
                              />
                              <div
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${(scrollPositions[categoria] || 0) > 80 ? "bg-primary scale-125" : "bg-slate-300"}`}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* Footer con información legal */}
      <section className="bg-slate-100 border-t border-slate-200 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Información Importante
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-xs text-slate-600 leading-relaxed">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-700 mb-1">
                    Garantía de Productos
                  </p>
                  <p>
                    Los productos vendidos sueltos (sin instalación) no incluyen
                    garantía, ya que la instalación no es realizada por
                    nosotros. Para garantía completa, adquiera nuestros
                    servicios de instalación profesional.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-700 mb-1">
                    Distribuidores Oficiales
                  </p>
                  <p>
                    Somos distribuidores oficiales de la marca Felicity Solar en
                    Cuba. Todos nuestros productos son originales y cuentan con
                    certificación del fabricante.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-700 mb-1">
                    Asesoría Técnica
                  </p>
                  <p>
                    Ofrecemos asesoría técnica gratuita antes de la compra.
                    Nuestros especialistas le ayudarán a seleccionar los equipos
                    adecuados según sus necesidades energéticas y presupuesto.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-slate-500">
            <p>
              * Los precios están sujetos a cambios sin previo aviso. Consulte
              disponibilidad y precios actualizados por WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {isChristmas ? <FooterChristmas /> : <Footer />}

      {selectedProduct && (
        <ProductDetailModal
          producto={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Carrito de compras flotante */}
      <ShoppingCartComponent />

      {/* Notificación Toast cuando se agrega al carrito */}
      {showToast && (
        <div className="fixed top-24 right-4 z-[100] animate-in slide-in-from-right duration-300">
          <div className="bg-white border-2 border-green-500 rounded-xl shadow-2xl px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                ¡Agregado al carrito!
              </p>
              <p className="text-sm text-gray-600">
                Producto añadido exitosamente
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
