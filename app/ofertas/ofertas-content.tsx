"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { EtiquetasOferta } from "@/components/ofertas/EtiquetasOferta";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import NavigationChristmas from "@/components/navigation-christmas";
import Footer from "@/components/footer";
import FooterChristmas from "@/components/footer-christmas";
import { isChristmasSeason } from "@/lib/christmas-utils";
import {
  Star,
  Phone,
  Eye,
  ArrowRight,
  Loader2,
  Info,
  MapPin,
  Trophy,
  MessageCircle,
  X,
  Tag,
  Percent,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  OfertaSimplificada,
  RecomendadorData,
} from "@/types/ofertas";
import { useClient } from "@/hooks/useClient";
import { Currency } from "@/hooks/useCurrencyExchange";
import OfertasRecommendationInput from "@/components/OfertasRecommendationInput";
import ArmarKit from "@/components/ofertas/ArmarKit";
import { ChipVoltaje } from "@/components/ofertas/ChipVoltaje";
import NotasLegales from "@/components/ofertas/NotasLegales";
import { kitsConfigurables } from "@/lib/ofertas/configurador";
import { recomendadorService } from "@/services/api/recomendadorService";
import {
  OFERTAS_PUBLICAS_QUERY,
  cargarPotencias,
  formatearPrecio,
  mapOfertasPublicas,
} from "@/lib/ofertas/ofertas-publicas";

// Solo lo usa el recomendador: fuera de la carga inicial de la página.
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

const OFERTAS_SCROLL_RESTORE_KEY = "suncar_ofertas_scroll_restore_v1";

function saveOfertasScrollPosition(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      OFERTAS_SCROLL_RESTORE_KEY,
      JSON.stringify({
        y: window.scrollY,
        timestamp: Date.now(),
      }),
    );
  } catch {
    // Ignorar errores de storage para no afectar navegación.
  }
}

function consumeOfertasScrollPosition(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(OFERTAS_SCROLL_RESTORE_KEY);
    if (!raw) {
      return null;
    }

    window.sessionStorage.removeItem(OFERTAS_SCROLL_RESTORE_KEY);
    const parsed = JSON.parse(raw) as { y?: number; timestamp?: number };
    if (
      typeof parsed?.y !== "number" ||
      typeof parsed?.timestamp !== "number"
    ) {
      return null;
    }

    // Evitar restaurar posiciones viejas de navegaciones antiguas.
    if (Date.now() - parsed.timestamp > 30 * 60 * 1000) {
      return null;
    }

    return Math.max(0, parsed.y);
  } catch {
    return null;
  }
}

interface OfertasContentProps {
  // null si el servidor no pudo traer los kits: entonces se piden desde aquí.
  initialOfertas: OfertaSimplificada[] | null;
  marcaParam: string | null;
  /** "lista" abre directo el listado; si no, se abre "Comprar un kit". */
  modoParam?: string | null;
  /** Número del kit a dejar elegido en "Comprar un kit" (?kit=OF-…). */
  kitParam?: string | null;
}

export default function OfertasContent({
  initialOfertas,
  marcaParam,
  modoParam,
  kitParam,
}: OfertasContentProps) {
  const router = useRouter();

  const [ofertas, setOfertas] = useState<OfertaSimplificada[]>(
    initialOfertas ?? [],
  );
  const [loading, setLoading] = useState(initialOfertas === null);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"precio-asc" | "precio-desc" | "nombre">(
    "precio-asc",
  );
  const [priceFilter, setPriceFilter] = useState<
    "all" | "low" | "mid" | "high"
  >("all");
  const [selectedBrandKey, setSelectedBrandKey] = useState<string | null>(
    marcaParam,
  );
  const [isChristmas, setIsChristmas] = useState(false);
  // "Comprar un kit" es lo primero que se ve. Los enlaces del menú por marca
  // (?marca=…) y ?modo=lista llevan directo al listado.
  const [modo, setModo] = useState<"lista" | "armar">(
    modoParam === "lista" || (marcaParam && !kitParam) ? "lista" : "armar",
  );
  const [kitElegido, setKitElegido] = useState<string | null>(kitParam ?? null);
  // Al navegar entre /ofertas y /ofertas?modo=… (desde el menú o la portada)
  // la página no se vuelve a montar: se sincroniza la vista con la URL.
  useEffect(() => {
    setModo(modoParam === "lista" || (marcaParam && !kitParam) ? "lista" : "armar");
    setKitElegido(kitParam ?? null);
  }, [modoParam, marcaParam, kitParam]);
  const cambiarModo = useCallback((nuevo: "lista" | "armar") => {
    setModo(nuevo);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
  const { isClient } = useClient();

  // Estados del recomendador
  const [recommendationData, setRecommendationData] =
    useState<RecomendadorData | null>(null);
  const [isRecommendationLoading, setIsRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(
    null,
  );
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isRestoringScroll, setIsRestoringScroll] = useState(false);
  const pendingScrollRef = useRef<number | null>(null);

  // Check if it's Christmas season
  useEffect(() => {
    setIsChristmas(isChristmasSeason());
  }, []);

  // Actualizar selectedBrandKey cuando cambie el parámetro de URL
  useEffect(() => {
    setSelectedBrandKey(marcaParam);
  }, [marcaParam]);

  const matchesSelectedBrand = useCallback(
    (marca?: string | null) => {
      if (!selectedBrandKey) {
        return true;
      }

      if (!marca) {
        return false;
      }

      return marca.trim().toLowerCase() === selectedBrandKey;
    },
    [selectedBrandKey],
  );

  // Derivado en el render (no en un efecto) para que el HTML del servidor
  // ya traiga las tarjetas.
  const { filteredOfertas, ofertasConDescuento, ofertasSinDescuento } =
    useMemo(() => {
      const pasaFiltroPrecio = (precio: number) => {
        switch (priceFilter) {
          case "low":
            return precio < 10000;
          case "mid":
            return precio >= 10000 && precio < 50000;
          case "high":
            return precio >= 50000;
          default:
            return true;
        }
      };

      if (showRecommendations && recommendationData) {
        let recomendadas = recommendationData.ofertas.filter((oferta) =>
          pasaFiltroPrecio(oferta.precio),
        );
        if (selectedBrandKey) {
          recomendadas = recomendadas.filter((oferta) =>
            matchesSelectedBrand(oferta.marca),
          );
        }
        return {
          filteredOfertas: recomendadas,
          ofertasConDescuento: [] as OfertaSimplificada[],
          ofertasSinDescuento: [] as OfertaSimplificada[],
        };
      }

      let filtered = ofertas.filter((oferta) =>
        pasaFiltroPrecio(oferta.precio),
      );

      if (selectedBrandKey) {
        filtered = filtered.filter((oferta) =>
          matchesSelectedBrand(oferta.marca),
        );
      }

      filtered.sort((a, b) => {
        switch (sortBy) {
          case "precio-asc":
            return a.precio - b.precio;
          case "precio-desc":
            return b.precio - a.precio;
          case "nombre":
            return a.descripcion.localeCompare(b.descripcion);
          default:
            return 0;
        }
      });

      // Los kits con etiqueta («Más vendida»…) van primero, y entre ellos los de la
      // etiqueta con más prioridad. Dentro de cada grupo se respeta el orden que
      // eligió la persona (el sort de JS es estable).
      const prioridadEtiqueta = (oferta: OfertaSimplificada) =>
        oferta.etiquetas?.length ? (oferta.etiquetas[0].prioridad ?? 0) : -1e9;
      filtered = [...filtered].sort(
        (a, b) => prioridadEtiqueta(b) - prioridadEtiqueta(a),
      );

      const tieneDescuento = (oferta: OfertaSimplificada) =>
        Boolean(
          oferta.descuentos &&
            typeof oferta.descuentos === "string" &&
            oferta.descuentos.trim().length > 0,
        );

      return {
        filteredOfertas: filtered,
        ofertasConDescuento: filtered.filter(tieneDescuento),
        ofertasSinDescuento: filtered.filter(
          (oferta) => !tieneDescuento(oferta),
        ),
      };
    }, [
      ofertas,
      sortBy,
      priceFilter,
      showRecommendations,
      recommendationData,
      matchesSelectedBrand,
      selectedBrandKey,
    ]);

  // "Comprar un kit" necesita al menos dos kits con inversor y batería legibles
  // para que haya algo que elegir; si no, solo existe el listado.
  const puedeArmar = useMemo(
    () => kitsConfigurables(ofertas).length >= 2,
    [ofertas],
  );
  const enArmar = modo === "armar" && puedeArmar;
  const enLista = !enArmar;

  const fetchOfertas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [response, potencias] = await Promise.all([
        fetch(`${BACKEND_URL}/api/ofertas/confeccion/?${OFERTAS_PUBLICAS_QUERY}`),
        cargarPotencias(BACKEND_URL),
      ]);
      if (!response.ok) {
        setError(`Error al cargar ofertas (${response.status})`);
        return;
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setOfertas(mapOfertasPublicas(data.data, potencias));
      } else {
        setError(data.message || "Error al cargar ofertas");
      }
    } catch (err) {
      console.error("Error fetching ofertas:", err);
      setError("Error de conexión al cargar ofertas");
    } finally {
      setLoading(false);
    }
  }, []);

  useLayoutEffect(() => {
    const targetY = consumeOfertasScrollPosition();
    if (targetY !== null) {
      pendingScrollRef.current = targetY;
      setIsRestoringScroll(true);
    }
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("scrollRestoration" in window.history)
    ) {
      return;
    }

    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    if (initialOfertas === null) {
      void fetchOfertas();
    }
  }, [fetchOfertas, initialOfertas]);

  const formatCurrency = (moneda: string) => {
    if (moneda.toLowerCase() === "eur") return "EUR";
    if (moneda.toLowerCase() === "usd") return "USD";
    return moneda.toUpperCase();
  };

  // Elegir un kit del listado lo abre en "Comprar un kit" con sus opciones ya
  // elegidas. Un kit que el configurador no entiende pasa al contacto.
  const navigateToOfertaDetalle = useCallback(
    (ofertaId?: string | null) => {
      if (!ofertaId) {
        return;
      }

      const oferta = ofertas.find((o) => o.id === ofertaId);
      if (oferta?.config) {
        setKitElegido(ofertaId);
        cambiarModo("armar");
        return;
      }
      router.push("/contacto");
    },
    [ofertas, cambiarModo, router],
  );

  const handleOfertaCardKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>, ofertaId?: string | null) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        navigateToOfertaDetalle(ofertaId);
      }
    },
    [navigateToOfertaDetalle],
  );

  const handleRecommendationSearch = async (query: string) => {
    try {
      setIsRecommendationLoading(true);
      setRecommendationError(null);

      const response = await recomendadorService.recomendarOfertas(query);

      if (response.success && response.data) {
        setRecommendationData(response.data);
        setShowRecommendations(true);

        // Resetear filtros cuando se usan recomendaciones
        setPriceFilter("all");
        setSortBy("precio-asc");
      } else {
        setRecommendationError(
          response.message || "Error al obtener recomendaciones",
        );
      }
    } catch (error) {
      console.error("Error en búsqueda de recomendaciones:", error);
      setRecommendationError("Error de conexión al obtener recomendaciones");
    } finally {
      setIsRecommendationLoading(false);
    }
  };

  const clearRecommendations = () => {
    setRecommendationData(null);
    setShowRecommendations(false);
    setRecommendationError(null);
  };

  useLayoutEffect(() => {
    if (loading || !isRestoringScroll || ofertas.length === 0) {
      return;
    }

    const scrollY = pendingScrollRef.current;
    if (scrollY === null) {
      setIsRestoringScroll(false);
      return;
    }

    let rafId = 0;
    let attempts = 0;
    const maxAttempts = 14;

    const restore = () => {
      attempts += 1;
      window.scrollTo({ top: scrollY, behavior: "auto" });

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const enoughHeight = maxScroll >= scrollY - 8;
      const target = Math.min(scrollY, maxScroll);
      const closeEnough = Math.abs(window.scrollY - target) < 4;

      if ((!enoughHeight || !closeEnough) && attempts < maxAttempts) {
        rafId = requestAnimationFrame(restore);
        return;
      }

      pendingScrollRef.current = null;
      setIsRestoringScroll(false);
    };

    rafId = requestAnimationFrame(restore);
    return () => cancelAnimationFrame(rafId);
  }, [loading, ofertas.length, isRestoringScroll]);

  return (
    <>
      <div
        className={
          isRestoringScroll ? "opacity-0 pointer-events-none select-none" : ""
        }
        aria-hidden={isRestoringScroll}
      >
        {isChristmas ? <NavigationChristmas /> : <Navigation />}
        <div className="min-h-screen bg-[#F2F2EF] pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Configurador: es la entrada; el listado se abre desde su pie */}
            {!loading && !error && enArmar && (
              <ArmarKit
                key={kitElegido ?? "nuevo"}
                ofertas={ofertas}
                kitInicial={kitElegido}
                onVerListado={() => cambiarModo("lista")}
              />
            )}

            {/* Volver al configurador desde el listado */}
            {!loading && !error && enLista && puedeArmar && (
              <div className="mx-auto mb-6 max-w-6xl px-4">
                <button
                  type="button"
                  onClick={() => {
                    setKitElegido(null);
                    cambiarModo("armar");
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#012928] shadow-sm transition-colors hover:bg-[#F5F5F7]"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Comprar un kit
                </button>
              </div>
            )}

            {/* AI Recommendation Input */}
            {!loading && !error && enLista && ofertas.length > 0 && (
              <OfertasRecommendationInput
                onSearch={handleRecommendationSearch}
                loading={isRecommendationLoading}
                disabled={loading}
              />
            )}

            {/* Recommendation Results Banner */}
            {enLista && showRecommendations && recommendationData && (
              <div className="mb-8 px-4">
                <div className="bg-gradient-to-r from-[#AFEB17]/5 via-[#F2C300]/5 to-[#AFEB17]/5 border-2 border-[#AFEB17]/25 rounded-2xl p-4 sm:p-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#AFEB17] to-[#F2C300] rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <h3 className="text-base sm:text-lg font-bold text-[#012928]">
                          Resultados de búsqueda
                        </h3>
                        <div className="flex items-center gap-1 bg-[#AFEB17]/15 px-2 py-1 rounded-full w-fit">
                          <Trophy className="w-3 h-3 text-[#012928]" />
                          <span className="text-xs font-medium text-[#012928] hidden sm:inline">
                            Ordenadas por relevancia
                          </span>
                          <span className="text-xs font-medium text-[#012928] sm:hidden">
                            Por relevancia
                          </span>
                        </div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-3 sm:p-4 border border-[#AFEB17]/15">
                        <div className="flex items-start gap-2">
                          <MessageCircle className="w-4 h-4 text-[#012928] mt-0.5 flex-shrink-0" />
                          <div className="text-gray-700 text-xs sm:text-sm leading-relaxed prose prose-sm max-w-none">
                            <ReactMarkdown>
                              {recommendationData.texto}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={clearRecommendations}
                      className="flex-shrink-0 p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 self-start sm:self-auto"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendation Error */}
            {enLista && recommendationError && (
              <div className="mb-8 px-4">
                <div className="bg-red-50 border border-[#AFEB17]/20 rounded-2xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-sm">!</span>
                    </div>
                    <div className="flex-1 w-full">
                      <h3 className="font-semibold text-red-800 mb-1 text-sm sm:text-base">
                        Error en recomendaciones
                      </h3>
                      <p className="text-xs sm:text-sm text-red-700 leading-relaxed">
                        {recommendationError}
                      </p>
                    </div>
                    <button
                      onClick={() => setRecommendationError(null)}
                      className="p-1.5 sm:p-2 text-red-400 hover:text-red-600 transition-colors duration-200 self-end sm:self-auto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Brand Filter Banner - Removido: ahora se maneja desde la navegación */}
            {/* {!loading && !error && ofertas.length > 0 && brandOptions.length > 0 && (
            <BrandFilterBanner
              brandOptions={brandOptions}
              selectedBrandKey={selectedBrandKey}
              onBrandSelect={setSelectedBrandKey}
            />
          )} */}

            {/* Loading State */}
            {loading && (
              <div
                className="flex items-center justify-center py-12 md:py-16 px-4"
              >
                <div className="text-center">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-[#012928] mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-gray-600">
                    Cargando ofertas...
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div
                className="text-center py-12 md:py-16 px-4"
              >
                <Card className="max-w-md mx-auto shadow-lg">
                  <CardContent className="p-6 sm:p-8">
                    <div className="text-red-500 mb-4">
                      <Star className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#012928] mb-2">
                      Error al cargar ofertas
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
                      {error}
                    </p>
                    <Button
                      onClick={fetchOfertas}
                      className="bg-[#012928] hover:opacity-90 text-white text-sm sm:text-base px-4 sm:px-6"
                    >
                      Intentar de nuevo
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Offers Grid - SIEMPRE muestra las dos secciones separadas cuando NO hay recomendaciones */}
            {!loading &&
              !error &&
              enLista &&
              !showRecommendations &&
              filteredOfertas.length > 0 && (
                <>
                  {/* SECCIÓN 1: Ofertas con Descuentos */}
                  {ofertasConDescuento.length > 0 && (
                    <>
                      {/* Promotional Banner for Discounted Offers */}
                      <div className="mb-10 px-4">
                        <div className="bg-gradient-to-r from-[#AFEB17]/50 via-red-500 to-pink-500 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
                          <div className="absolute inset-0 bg-black/10"></div>
                          <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-20 -translate-y-20"></div>
                          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 translate-y-16"></div>

                          <div className="relative z-10">
                            <div className="flex justify-center mb-4">
                              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                <Percent className="w-8 h-8 text-[#012928]" />
                              </div>
                            </div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                              ¡Accede a Nuestras Ofertas con Descuentos!
                            </h2>
                            <p className="text-lg md:text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow">
                              Aprovecha nuestros descuentos exclusivos con
                              reserva previa. ¡Entérate de nuestras promociones
                              y reserva ahora!
                            </p>
                            <Link
                              href="/contacto"
                              className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-white/30 hover:bg-white/30 transition-all duration-300 cursor-pointer group"
                            >
                              <Tag className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
                              <span className="text-white font-semibold">
                                Reserva Previa Disponible
                              </span>
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Grid de Ofertas con Descuentos */}
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {ofertasConDescuento.map((oferta, index) => (
                          <Card
                            key={oferta.id || index}
                            className="group bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden h-full flex flex-col cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#012928] focus-visible:ring-offset-2"
                            role={oferta.id ? "link" : undefined}
                            tabIndex={oferta.id ? 0 : -1}
                            aria-label={
                              oferta.id
                                ? `Elegir el kit ${oferta.descripcion}`
                                : undefined
                            }
                            onClick={() => navigateToOfertaDetalle(oferta.id)}
                            onKeyDown={(event) =>
                              handleOfertaCardKeyDown(event, oferta.id)
                            }
                          >
                            <div className="relative overflow-hidden aspect-square">
                              <Image
                                src={oferta.imagen || "/placeholder.svg"}
                                alt={oferta.descripcion}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                quality={70}
                                priority={index === 0}
                                fetchPriority={index === 0 ? "high" : "auto"}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <EtiquetasOferta etiquetas={oferta.etiquetas} />

                              {/* Status Badge - top left corner */}
                              <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {/* Sold Out Badge - for inactive offers */}
                                {oferta.is_active === false && (
                                  <Badge className="bg-gray-600 text-white px-4 py-2 text-sm font-bold shadow-xl border-2 border-white">
                                    AGOTADA
                                  </Badge>
                                )}

                                {/* Discount Badge */}
                                <Badge className="bg-gradient-to-r from-[#AFEB17]/50 to-red-500 text-white px-4 py-2 text-sm font-bold shadow-xl border-2 border-white flex items-center gap-2">
                                  <Percent className="w-4 h-4" />
                                  DESCUENTO
                                </Badge>
                              </div>
                            </div>

                            <CardContent className="p-6 flex flex-col">
                              <h3 className="text-lg font-bold text-[#012928] mb-3 leading-snug break-words">
                                {oferta.descripcion}
                              </h3>
                              <ChipVoltaje voltaje={oferta.voltaje} className="mb-3 self-start" />

                              <div className="mb-6 flex-1">
                                {/* Currency Selector and Price Display - COMENTADO: API agotada */}
                                {/* {oferta.id && selectedCurrencies[oferta.id] && (
                                            <div className="space-y-3">
                                                <CurrencySelector
                                                    baseCurrency={oferta.moneda.toUpperCase() as Currency}
                                                    selectedCurrency={selectedCurrencies[oferta.id]}
                                                    onCurrencyChange={(currency) => handleCurrencyChange(oferta.id!, currency)}
                                                    basePrice={isClient && oferta.precio_cliente ? oferta.precio_cliente : oferta.precio}
                                                    size="md"
                                                    showConvertedPrice={true}
                                                    className="mb-2"
                                                />

                                                {isClient && oferta.precio_cliente && (
                                                    <div className="text-xs text-gray-500">
                                                        Precio original: {formatearPrecio(oferta.precio)} {formatCurrency(oferta.moneda)}
                                                    </div>
                                                )}
                                            </div>
                                        )} */}

                                {/* Mostrar precio simple sin conversión */}
                                <div className="space-y-3">
                                  <div className="text-3xl font-bold text-[#F2C300]">
                                    {formatearPrecio(isClient && oferta.precio_cliente
                                      ? oferta.precio_cliente
                                      : oferta.precio)}{" "}
                                    {formatCurrency(oferta.moneda)}
                                  </div>

                                  {/* Show original price if there's a client discount */}
                                  {isClient && oferta.precio_cliente && (
                                    <div className="text-sm text-gray-500 line-through">
                                      Precio original:{" "}
                                      {formatearPrecio(oferta.precio)}{" "}
                                      {formatCurrency(oferta.moneda)}
                                    </div>
                                  )}
                                </div>

                                {/* Financing Information */}
                                {/* TEMPORALMENTE COMENTADO
                            {oferta.financiamiento && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span>o</span>
                                  <span className="font-semibold text-blue-600">78 €/mes</span>
                                  <div className="flex items-center gap-1 text-xs bg-blue-50 px-2 py-1 rounded-full">
                                    <MapPin className="w-3 h-3 text-blue-500" />
                                    <span className="text-blue-700">solo desde España</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            */}
                              </div>

                              <Button
                                type="button"
                                tabIndex={-1}
                                className="w-full bg-[#012928] hover:opacity-90 text-white font-medium py-2.5 rounded-lg transition-all duration-300 group-hover:shadow-lg pointer-events-none"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Elegir este kit
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}

                  {/* SECCIÓN 2: Ofertas Tradicionales (Sin Descuentos) */}
                  {ofertasSinDescuento.length > 0 && (
                    <>
                      {/* Grid de Ofertas Sin Descuentos */}
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {ofertasSinDescuento.map((oferta, index) => (
                          <Card
                            key={oferta.id || index}
                            className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden h-full flex flex-col cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#012928] focus-visible:ring-offset-2"
                            role={oferta.id ? "link" : undefined}
                            tabIndex={oferta.id ? 0 : -1}
                            aria-label={
                              oferta.id
                                ? `Elegir el kit ${oferta.descripcion}`
                                : undefined
                            }
                            onClick={() => navigateToOfertaDetalle(oferta.id)}
                            onKeyDown={(event) =>
                              handleOfertaCardKeyDown(event, oferta.id)
                            }
                          >
                            <div className="relative overflow-hidden aspect-square">
                              <Image
                                src={oferta.imagen || "/placeholder.svg"}
                                alt={oferta.descripcion}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                quality={70}
                                priority={
                                  ofertasConDescuento.length === 0 &&
                                  index === 0
                                }
                                fetchPriority={
                                  ofertasConDescuento.length === 0 &&
                                  index === 0
                                    ? "high"
                                    : "auto"
                                }
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <EtiquetasOferta etiquetas={oferta.etiquetas} />

                              <div className="absolute top-4 left-4">
                                {oferta.is_active === false ? (
                                  <Badge className="bg-gray-600 text-white px-3 py-1 text-sm font-bold shadow-xl border-2 border-white">
                                    AGOTADA
                                  </Badge>
                                ) : (
                                  <Badge className="bg-[#012928] text-white px-5 py-2.5 text-lg font-bold shadow-xl border-2 border-white">
                                    {oferta.potenciaInversor ?? "OFERTA"}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <CardContent className="p-6 flex flex-col">
                              <h3 className="text-lg font-bold text-[#012928] mb-3 leading-snug break-words">
                                {oferta.descripcion}
                              </h3>
                              <ChipVoltaje voltaje={oferta.voltaje} className="mb-3 self-start" />

                              <div className="mb-6 flex-1">
                                {/* Currency Selector and Price Display - COMENTADO: API agotada */}
                                {/* {oferta.id && selectedCurrencies[oferta.id] && (
                                            <div className="space-y-3">
                                                <CurrencySelector
                                                    baseCurrency={oferta.moneda.toUpperCase() as Currency}
                                                    selectedCurrency={selectedCurrencies[oferta.id]}
                                                    onCurrencyChange={(currency) => handleCurrencyChange(oferta.id!, currency)}
                                                    basePrice={isClient && oferta.precio_cliente ? oferta.precio_cliente : oferta.precio}
                                                    size="md"
                                                    showConvertedPrice={true}
                                                    className="mb-2"
                                                />

                                                {isClient && oferta.precio_cliente && (
                                                    <div className="text-xs text-gray-500">
                                                        Precio original: {formatearPrecio(oferta.precio)} {formatCurrency(oferta.moneda)}
                                                    </div>
                                                )}
                                            </div>
                                        )} */}

                                {/* Mostrar precio simple sin conversión */}
                                <div className="space-y-3">
                                  <div className="text-3xl font-bold text-[#F2C300]">
                                    {formatearPrecio(isClient && oferta.precio_cliente
                                      ? oferta.precio_cliente
                                      : oferta.precio)}{" "}
                                    {formatCurrency(oferta.moneda)}
                                  </div>

                                  {/* Show original price if there's a client discount */}
                                  {isClient && oferta.precio_cliente && (
                                    <div className="text-sm text-gray-500 line-through">
                                      Precio original:{" "}
                                      {formatearPrecio(oferta.precio)}{" "}
                                      {formatCurrency(oferta.moneda)}
                                    </div>
                                  )}
                                </div>

                                {/* Financing Information */}
                                {/* TEMPORALMENTE COMENTADO
                            {oferta.financiamiento && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span>o</span>
                                  <span className="font-semibold text-blue-600">78 €/mes</span>
                                  <div className="flex items-center gap-1 text-xs bg-blue-50 px-2 py-1 rounded-full">
                                    <MapPin className="w-3 h-3 text-blue-500" />
                                    <span className="text-blue-700">solo desde España</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            */}
                              </div>

                              <Button
                                type="button"
                                tabIndex={-1}
                                className="w-full bg-[#012928] hover:opacity-90 text-white font-medium py-2.5 rounded-lg transition-all duration-300 group-hover:shadow-lg pointer-events-none"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Elegir este kit
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

            {/* Vista de Recomendaciones - cuando el usuario usa el recomendador */}
            {!loading &&
              !error &&
              enLista &&
              showRecommendations &&
              recommendationData &&
              filteredOfertas.length > 0 && (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {filteredOfertas.map((oferta, index) => (
                      <Card
                        key={oferta.id || index}
                        className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden h-full flex flex-col cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#012928] focus-visible:ring-offset-2"
                        role={oferta.id ? "link" : undefined}
                        tabIndex={oferta.id ? 0 : -1}
                        aria-label={
                          oferta.id
                            ? `Elegir el kit ${oferta.descripcion}`
                            : undefined
                        }
                        onClick={() => navigateToOfertaDetalle(oferta.id)}
                        onKeyDown={(event) =>
                          handleOfertaCardKeyDown(event, oferta.id)
                        }
                      >
                        <div className="relative overflow-hidden aspect-square">
                          <Image
                            src={oferta.imagen || "/placeholder.svg"}
                            alt={oferta.descripcion}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            quality={70}
                            priority={index === 0}
                            fetchPriority={index === 0 ? "high" : "auto"}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <EtiquetasOferta etiquetas={oferta.etiquetas} className="top-[4.75rem]" />

                          {/* Status badges - top left corner */}
                          <div className="absolute top-4 left-4 flex flex-col gap-2">
                            {oferta.is_active === false && (
                              <Badge className="bg-gray-600 text-white px-3 py-1 text-sm font-bold shadow-xl border-2 border-white">
                                AGOTADA
                              </Badge>
                            )}
                            {index === 0 && oferta.is_active !== false && (
                              <Badge className="bg-gradient-to-r from-[#AFEB17] to-[#F2C300] text-white px-3 py-1 text-sm font-medium shadow-lg">
                                Más recomendada
                              </Badge>
                            )}
                          </div>

                          {/* Ranking Badge - moved to top right */}
                          <div className="absolute top-4 right-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#AFEB17] to-[#F2C300] rounded-full shadow-lg border-2 border-white">
                              <span className="text-white font-bold text-lg">
                                #{index + 1}
                              </span>
                            </div>
                          </div>
                        </div>

                        <CardContent className="p-6 flex flex-col">
                          <h3 className="text-lg font-bold text-[#012928] mb-3 leading-snug break-words">
                            {oferta.descripcion}
                          </h3>
                          <ChipVoltaje voltaje={oferta.voltaje} className="mb-3 self-start" />

                          <div className="mb-6 flex-1">
                            {/* Mostrar precio simple sin conversión */}
                            <div className="space-y-3">
                              <div className="text-3xl font-bold text-[#F2C300]">
                                {formatearPrecio(isClient && oferta.precio_cliente
                                  ? oferta.precio_cliente
                                  : oferta.precio)}{" "}
                                {formatCurrency(oferta.moneda)}
                              </div>

                              {/* Show original price if there's a client discount */}
                              {isClient && oferta.precio_cliente && (
                                <div className="text-sm text-gray-500 line-through">
                                  Precio original:{" "}
                                  {formatearPrecio(oferta.precio)}{" "}
                                  {formatCurrency(oferta.moneda)}
                                </div>
                              )}
                            </div>

                            {/* Financing Information */}
                            {/* TEMPORALMENTE COMENTADO
                        {oferta.financiamiento && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>o</span>
                              <span className="font-semibold text-blue-600">78 €/mes</span>
                              <div className="flex items-center gap-1 text-xs bg-blue-50 px-2 py-1 rounded-full">
                                <MapPin className="w-3 h-3 text-blue-500" />
                                <span className="text-blue-700">solo desde España</span>
                              </div>
                            </div>
                          </div>
                        )}
                        */}
                          </div>

                          <Button
                            type="button"
                            tabIndex={-1}
                            className="w-full bg-[#012928] hover:opacity-90 text-white font-medium py-2.5 rounded-lg transition-all duration-300 group-hover:shadow-lg pointer-events-none"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Elegir este kit
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}

            {/* Condiciones al pie, con el estilo de las notas de Apple */}
            {!loading && !error && filteredOfertas.length > 0 && <NotasLegales />}

            {/* Empty State */}
            {!loading && !error && ofertas.length === 0 && (
              <div
                className="text-center py-12 md:py-16 px-4"
              >
                <Card className="max-w-md mx-auto shadow-lg">
                  <CardContent className="p-6 sm:p-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4 flex items-center justify-center">
                      <Eye className="w-12 h-12 sm:w-16 sm:h-16" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#012928] mb-2">
                      No hay ofertas disponibles
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
                      En este momento no tenemos ofertas disponibles. Vuelve
                      pronto para ver nuestras nuevas opciones.
                    </p>
                    <Button
                      asChild
                      className="bg-[#012928] hover:opacity-90 text-white text-sm sm:text-base px-4 sm:px-6"
                    >
                      <Link href="/servicios">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Ver Servicios
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Payment Information */}
            {/* {!loading && !error && (
            <Card
              className="bg-white/80 backdrop-blur-sm border-2 border-blue-100 shadow-xl mb-16 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-50 to-transparent rounded-full -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#AFEB17]/5 to-transparent rounded-full translate-y-16 -translate-x-16"></div>

              <CardContent className="p-8 md:p-12 relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#AFEB17] to-[#F2C300] rounded-full mb-6 shadow-lg">
                    <Info className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-[#012928] mb-4">
                    Opciones de Pago Flexibles
                  </h3>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
                    Facilitamos tu inversión en energía solar con diversas opciones de pago
                  </p>
                </div>

                <div className="max-w-2xl mx-auto">

                   <div className="bg-gradient-to-br from-[#AFEB17]/5 to-[#F2C300]/5 rounded-2xl p-6 border border-[#AFEB17]/15">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-[#AFEB17]/15 rounded-full">
                        <CreditCard className="w-6 h-6 text-[#012928]" />
                      </div>
                      <h4 className="text-xl font-bold text-[#012928]">Métodos de Pago</h4>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Ofrecemos diversas formas de pago para tu comodidad:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-sm border">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold text-sm">$</span>
                        </div>
                        <span className="font-medium text-gray-700">Efectivo</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-sm border">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-700">Transferencia Bancaria en el Exterior</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-600 bg-gray-50 px-6 py-3 rounded-full inline-block border">
                    💡 <span className="font-medium">Tip:</span> Contacta con nuestro equipo para conocer las mejores opciones de financiamiento
                  </p>
                </div>
              </CardContent>
            </Card>
          )} */}

            {/* Contact CTA */}
            <Card
              className="bg-[#012928] text-white text-center shadow-xl"
            >
              <CardContent className="py-12">
                <Phone className="w-12 h-12 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-3">
                  ¿Interesado en alguna oferta?
                </h3>
                <p className="text-white/90 mb-8 max-w-lg mx-auto">
                  Contacta a nuestro equipo de especialistas para obtener más
                  información y asesoramiento personalizado
                </p>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="bg-white text-[#AFEB17] hover:bg-gray-100 font-semibold px-8 py-3"
                >
                  <Link href="/contacto">
                    <Phone className="w-4 h-4 mr-2" />
                    Contactar Ahora
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        {isChristmas ? <FooterChristmas /> : <Footer />}
      </div>
      {isRestoringScroll && (
        <div className="fixed inset-0 z-[70] bg-white flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 shadow-sm">
            <Loader2 className="w-4 h-4 animate-spin text-[#AFEB17]" />
            Restaurando posicion...
          </div>
        </div>
      )}
    </>
  );
}

