'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/navigation';
import NavigationChristmas from '@/components/navigation-christmas';
import Footer from '@/components/footer';
import FooterChristmas from '@/components/footer-christmas';
import { isChristmasSeason } from '@/lib/christmas-utils';
import {
  Star,
  Phone,
  Eye,
  ArrowRight,
  Loader2,
  DollarSign,
  Info,
  MapPin,
  Sparkles,
  Trophy,
  MessageCircle,
  X,
  Tag,
  Percent
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import Image from 'next/image';
import { OfertaSimplificada, OfertasResponse, RecomendadorData } from '@/types/ofertas';
import { useClient } from '@/hooks/useClient';
import { Currency } from '@/hooks/useCurrencyExchange';
import OfertasRecommendationInput from '@/components/OfertasRecommendationInput';
import { recomendadorService } from '@/services/api/recomendadorService';
import { useAOS } from '@/hooks/useAOS';

const OFERTAS_CACHE_KEY = 'suncar_ofertas_simplified_cache_v1';
const OFERTAS_CACHE_TTL_MS = 5 * 60 * 1000;
const OFERTAS_SCROLL_RESTORE_KEY = 'suncar_ofertas_scroll_restore_v1';

type OfertasCacheEntry = {
  data: OfertaSimplificada[];
  timestamp: number;
};

let ofertasMemoryCache: OfertasCacheEntry | null = null;

function readOfertasCache(): OfertasCacheEntry | null {
  if (ofertasMemoryCache) {
    return ofertasMemoryCache;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(OFERTAS_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as OfertasCacheEntry;
    if (!parsed || !Array.isArray(parsed.data) || typeof parsed.timestamp !== 'number') {
      return null;
    }

    ofertasMemoryCache = parsed;
    return parsed;
  } catch {
    return null;
  }
}

function writeOfertasCache(data: OfertaSimplificada[]): void {
  const entry: OfertasCacheEntry = {
    data,
    timestamp: Date.now(),
  };

  ofertasMemoryCache = entry;

  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(OFERTAS_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Ignorar errores de storage para no afectar la carga de la vista.
  }
}

function getCachedOfertas(options: { allowStale?: boolean } = {}): OfertaSimplificada[] | null {
  const { allowStale = false } = options;
  const cache = readOfertasCache();
  if (!cache) {
    return null;
  }

  const isFresh = Date.now() - cache.timestamp <= OFERTAS_CACHE_TTL_MS;
  if (!isFresh && !allowStale) {
    return null;
  }

  return cache.data;
}

function saveOfertasScrollPosition(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(
      OFERTAS_SCROLL_RESTORE_KEY,
      JSON.stringify({
        y: window.scrollY,
        timestamp: Date.now(),
      })
    );
  } catch {
    // Ignorar errores de storage para no afectar navegación.
  }
}

function consumeOfertasScrollPosition(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(OFERTAS_SCROLL_RESTORE_KEY);
    if (!raw) {
      return null;
    }

    window.sessionStorage.removeItem(OFERTAS_SCROLL_RESTORE_KEY);
    const parsed = JSON.parse(raw) as { y?: number; timestamp?: number };
    if (typeof parsed?.y !== 'number' || typeof parsed?.timestamp !== 'number') {
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

function OfertasContent() {
  const searchParams = useSearchParams();
  const marcaParam = searchParams.get("marca");

  const [ofertas, setOfertas] = useState<OfertaSimplificada[]>([]);
  const [filteredOfertas, setFilteredOfertas] = useState<OfertaSimplificada[]>([]);
  const [ofertasConDescuento, setOfertasConDescuento] = useState<OfertaSimplificada[]>([]);
  const [ofertasSinDescuento, setOfertasSinDescuento] = useState<OfertaSimplificada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'precio-asc' | 'precio-desc' | 'nombre'>('precio-asc');
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const [selectedBrandKey, setSelectedBrandKey] = useState<string | null>(marcaParam);
  const [isChristmas, setIsChristmas] = useState(false);
  const { isClient } = useClient();

  // Estados del recomendador
  const [recommendationData, setRecommendationData] = useState<RecomendadorData | null>(null);
  const [isRecommendationLoading, setIsRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isRestoringScroll, setIsRestoringScroll] = useState(false);
  const pendingScrollRef = useRef<number | null>(null);

  // Check if it's Christmas season
  useEffect(() => {
    setIsChristmas(isChristmasSeason());
  }, []);

  // Initialize AOS with global hook
  useAOS({ duration: 600, once: true, easing: 'ease-out' });

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
    [selectedBrandKey]
  );

  useEffect(() => {
    if (showRecommendations && recommendationData) {
      let filtered = [...recommendationData.ofertas];

      if (priceFilter !== 'all') {
        filtered = filtered.filter(oferta => {
          const precio = oferta.precio;
          switch (priceFilter) {
            case 'low': return precio < 10000;
            case 'mid': return precio >= 10000 && precio < 50000;
            case 'high': return precio >= 50000;
            default: return true;
          }
        });
      }

      if (selectedBrandKey) {
        filtered = filtered.filter(oferta => matchesSelectedBrand(oferta.marca));
      }

      setFilteredOfertas(filtered);
      return;
    }

    let filtered = [...ofertas];

    // Aplicar filtro de precio
    if (priceFilter !== 'all') {
      filtered = filtered.filter(oferta => {
        const precio = oferta.precio;
        switch (priceFilter) {
          case 'low': return precio < 10000;
          case 'mid': return precio >= 10000 && precio < 50000;
          case 'high': return precio >= 50000;
          default: return true;
        }
      });
    }

    if (selectedBrandKey) {
      filtered = filtered.filter(oferta => matchesSelectedBrand(oferta.marca));
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'precio-asc': return a.precio - b.precio;
        case 'precio-desc': return b.precio - a.precio;
        case 'nombre': return a.descripcion.localeCompare(b.descripcion);
        default: return 0;
      }
    });

    // Separar ofertas con y sin descuentos
    const conDescuento = filtered.filter(oferta => {
      // Verificar si tiene el campo descuentos y no está vacío
      return oferta.descuentos &&
        typeof oferta.descuentos === 'string' &&
        oferta.descuentos.trim().length > 0;
    });

    const sinDescuento = filtered.filter(oferta => {
      // Verificar si NO tiene descuentos o está vacío
      return !oferta.descuentos ||
        typeof oferta.descuentos !== 'string' ||
        oferta.descuentos.trim().length === 0;
    });

    setOfertasConDescuento(conDescuento);
    setOfertasSinDescuento(sinDescuento);
    setFilteredOfertas(filtered);
  }, [
    ofertas,
    sortBy,
    priceFilter,
    showRecommendations,
    recommendationData,
    matchesSelectedBrand,
    selectedBrandKey
  ]);

  const fetchOfertas = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }

      const response = await fetch('/api/ofertas/simplified');
      const data: OfertasResponse = await response.json();

      if (data.success) {
        setOfertas(data.data);
        writeOfertasCache(data.data);
      } else {
        if (!silent) {
          setError(data.message || 'Error al cargar ofertas');
        }
      }
    } catch (err) {
      console.error('Error fetching ofertas:', err);
      if (!silent) {
        setError('Error de conexión al cargar ofertas');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
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
    if (typeof window === 'undefined' || !('scrollRestoration' in window.history)) {
      return;
    }

    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    const cachedFresh = getCachedOfertas();
    if (cachedFresh) {
      setOfertas(cachedFresh);
      setLoading(false);
      return;
    }

    const cachedStale = getCachedOfertas({ allowStale: true });
    if (cachedStale) {
      setOfertas(cachedStale);
      setLoading(false);
      void fetchOfertas({ silent: true });
      return;
    }

    void fetchOfertas();
  }, [fetchOfertas]);

  const formatCurrency = (moneda: string) => {
    if (moneda.toLowerCase() === 'eur') return 'EUR';
    if (moneda.toLowerCase() === 'usd') return 'USD';
    return moneda.toUpperCase();
  };

  const handleRecommendationSearch = async (query: string) => {
    try {
      setIsRecommendationLoading(true);
      setRecommendationError(null);

      const response = await recomendadorService.recomendarOfertas(query);

      if (response.success && response.data) {
        setRecommendationData(response.data);
        setShowRecommendations(true);

        // Actualizar las ofertas filtradas con las recomendadas (ya ordenadas)
        setFilteredOfertas(response.data.ofertas);

        // Resetear filtros cuando se usan recomendaciones
        setPriceFilter('all');
        setSortBy('precio-asc');
      } else {
        setRecommendationError(response.message || 'Error al obtener recomendaciones');
      }
    } catch (error) {
      console.error('Error en búsqueda de recomendaciones:', error);
      setRecommendationError('Error de conexión al obtener recomendaciones');
    } finally {
      setIsRecommendationLoading(false);
    }
  };

  const clearRecommendations = () => {
    setRecommendationData(null);
    setShowRecommendations(false);
    setRecommendationError(null);

    // Volver a las ofertas originales
    setFilteredOfertas(ofertas);
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
      window.scrollTo({ top: scrollY, behavior: 'auto' });

      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
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
        className={isRestoringScroll ? 'opacity-0 pointer-events-none select-none' : ''}
        aria-hidden={isRestoringScroll}
      >
        {isChristmas ? <NavigationChristmas /> : <Navigation />}
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* AI Recommendation Input */}
          {!loading && !error && ofertas.length > 0 && (
            <OfertasRecommendationInput
              onSearch={handleRecommendationSearch}
              loading={isRecommendationLoading}
              disabled={loading}
            />
          )}

          {/* Recommendation Results Banner */}
          {showRecommendations && recommendationData && (
            <div className="mb-8 px-4" data-aos="fade-up">
              <div className="bg-gradient-to-r from-orange-50 via-yellow-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-4 sm:p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#F26729] to-[#FDB813] rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                      <h3 className="text-base sm:text-lg font-bold text-orange-700">Resultados de búsqueda</h3>
                      <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-full w-fit">
                        <Trophy className="w-3 h-3 text-orange-600" />
                        <span className="text-xs font-medium text-orange-700 hidden sm:inline">Ordenadas por relevancia</span>
                        <span className="text-xs font-medium text-orange-700 sm:hidden">Por relevancia</span>
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-lg p-3 sm:p-4 border border-orange-100">
                      <div className="flex items-start gap-2">
                        <MessageCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div className="text-gray-700 text-xs sm:text-sm leading-relaxed prose prose-sm max-w-none">
                          <ReactMarkdown>{recommendationData.texto}</ReactMarkdown>
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
          {recommendationError && (
            <div className="mb-8 px-4" data-aos="fade-up">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold text-sm">!</span>
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className="font-semibold text-red-800 mb-1 text-sm sm:text-base">Error en recomendaciones</h3>
                    <p className="text-xs sm:text-sm text-red-700 leading-relaxed">{recommendationError}</p>
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
            <div className="flex items-center justify-center py-12 md:py-16 px-4" data-aos="fade-up">
              <div className="text-center">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-[#0F2B66] mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-600">Cargando ofertas...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12 md:py-16 px-4" data-aos="fade-up">
              <Card className="max-w-md mx-auto shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <div className="text-red-500 mb-4">
                    <Star className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#0F2B66] mb-2">Error al cargar ofertas</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">{error}</p>
                  <Button
                    onClick={fetchOfertas}
                    className="bg-secondary-gradient hover:opacity-90 text-white text-sm sm:text-base px-4 sm:px-6"
                  >
                    Intentar de nuevo
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Offers Grid - SIEMPRE muestra las dos secciones separadas cuando NO hay recomendaciones */}
          {!loading && !error && !showRecommendations && filteredOfertas.length > 0 && (
            <>
              {/* SECCIÓN 1: Ofertas con Descuentos */}
              {ofertasConDescuento.length > 0 && (
                <>
                  {/* Promotional Banner for Discounted Offers */}
                  <div className="mb-10 px-4" data-aos="fade-up">
                    <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-20 -translate-y-20"></div>
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 translate-y-16"></div>

                      <div className="relative z-10">
                        <div className="flex justify-center mb-4">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                            <Percent className="w-8 h-8 text-orange-600" />
                          </div>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                          ¡Accede a Nuestras Ofertas con Descuentos!
                        </h2>
                        <p className="text-lg md:text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow">
                          Aprovecha nuestros descuentos exclusivos con reserva previa. ¡Entérate de nuestras promociones y reserva ahora!
                        </p>
                        <Link href="/contacto" className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-white/30 hover:bg-white/30 transition-all duration-300 cursor-pointer group">
                          <Tag className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
                          <span className="text-white font-semibold">Reserva Previa Disponible</span>
                        </Link>
                      </div>

                    </div>
                  </div>

                  {/* Grid de Ofertas con Descuentos */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {ofertasConDescuento.map((oferta, index) => (
                      <Card
                        key={oferta.id || index}
                        className="group bg-white border-2 border-orange-200 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden h-full flex flex-col"
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                      >
                        <div className="relative overflow-hidden aspect-square">
                          <img
                            src={oferta.imagen || "/placeholder.svg"}
                            alt={oferta.descripcion}
                            width={400}
                            height={400}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                          {/* Status Badge - top left corner */}
                          <div className="absolute top-4 left-4 flex flex-col gap-2">
                            {/* Sold Out Badge - for inactive offers */}
                            {oferta.is_active === false && (
                              <Badge className="bg-gray-600 text-white px-4 py-2 text-sm font-bold shadow-xl border-2 border-white">
                                AGOTADA
                              </Badge>
                            )}

                            {/* Discount Badge */}
                            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-sm font-bold shadow-xl border-2 border-white flex items-center gap-2">
                              <Percent className="w-4 h-4" />
                              DESCUENTO
                            </Badge>
                          </div>

                          {oferta.marca && (
                            <div className="absolute bottom-4 left-4">
                              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#0F2B66] shadow-lg">
                                <Sparkles className="h-3 w-3 text-[#F26729]" />
                                {oferta.marca}
                              </div>
                            </div>
                          )}
                        </div>

                        <CardContent className="p-6 flex flex-col">
                          <h3 className="text-lg font-bold text-[#0F2B66] mb-3 leading-snug break-words group-hover:text-[#F26729] transition-colors duration-300">
                            {oferta.descripcion}
                          </h3>

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
                                                        Precio original: {oferta.precio.toLocaleString()} {formatCurrency(oferta.moneda)}
                                                    </div>
                                                )}
                                            </div>
                                        )} */}

                            {/* Mostrar precio simple sin conversión */}
                            <div className="space-y-3">
                              <div className="text-3xl font-bold text-[#F26729]">
                                {(isClient && oferta.precio_cliente ? oferta.precio_cliente : oferta.precio).toLocaleString()} {formatCurrency(oferta.moneda)}
                              </div>

                              {/* Show original price if there's a client discount */}
                              {isClient && oferta.precio_cliente && (
                                <div className="text-sm text-gray-500 line-through">
                                  Precio original: {oferta.precio.toLocaleString()} {formatCurrency(oferta.moneda)}
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
                            asChild
                            className="w-full bg-secondary-gradient hover:opacity-90 text-white font-medium py-2.5 rounded-lg transition-all duration-300 group-hover:shadow-lg"
                          >
                            <Link href={`/ofertas/${oferta.id}`} onClick={saveOfertasScrollPosition}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalles
                            </Link>
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
                        className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden h-full flex flex-col"
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                      >
                        <div className="relative overflow-hidden aspect-square">
                          <img
                            src={oferta.imagen || "/placeholder.svg"}
                            alt={oferta.descripcion}
                            width={400}
                            height={400}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                          <div className="absolute top-4 left-4">
                            {oferta.is_active === false ? (
                              <Badge className="bg-gray-600 text-white px-3 py-1 text-sm font-bold shadow-xl border-2 border-white">
                                AGOTADA
                              </Badge>
                            ) : (
                              <Badge className="bg-[#0F2B66] text-white px-3 py-1 text-sm font-medium">
                                Oferta
                              </Badge>
                            )}
                          </div>

                          {oferta.marca && (
                            <div className="absolute bottom-4 left-4">
                              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#0F2B66] shadow-lg">
                                <Sparkles className="h-3 w-3 text-[#F26729]" />
                                {oferta.marca}
                              </div>
                            </div>
                          )}
                        </div>

                        <CardContent className="p-6 flex flex-col">
                          <h3 className="text-lg font-bold text-[#0F2B66] mb-3 leading-snug break-words group-hover:text-[#F26729] transition-colors duration-300">
                            {oferta.descripcion}
                          </h3>

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
                                                        Precio original: {oferta.precio.toLocaleString()} {formatCurrency(oferta.moneda)}
                                                    </div>
                                                )}
                                            </div>
                                        )} */}

                            {/* Mostrar precio simple sin conversión */}
                            <div className="space-y-3">
                              <div className="text-3xl font-bold text-[#F26729]">
                                {(isClient && oferta.precio_cliente ? oferta.precio_cliente : oferta.precio).toLocaleString()} {formatCurrency(oferta.moneda)}
                              </div>

                              {/* Show original price if there's a client discount */}
                              {isClient && oferta.precio_cliente && (
                                <div className="text-sm text-gray-500 line-through">
                                  Precio original: {oferta.precio.toLocaleString()} {formatCurrency(oferta.moneda)}
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
                            asChild
                            className="w-full bg-secondary-gradient hover:opacity-90 text-white font-medium py-2.5 rounded-lg transition-all duration-300 group-hover:shadow-lg"
                          >
                            <Link href={`/ofertas/${oferta.id}`} onClick={saveOfertasScrollPosition}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalles
                            </Link>
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
          {!loading && !error && showRecommendations && recommendationData && filteredOfertas.length > 0 && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {filteredOfertas.map((oferta, index) => (
                  <Card
                    key={oferta.id || index}
                    className="group bg-white border-2 border-orange-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden h-full flex flex-col"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="relative overflow-hidden aspect-square">
                      <Image
                        src={oferta.imagen || "/placeholder.svg"}
                        alt={oferta.descripcion}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Status badges - top left corner */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {oferta.is_active === false && (
                          <Badge className="bg-gray-600 text-white px-3 py-1 text-sm font-bold shadow-xl border-2 border-white">
                            AGOTADA
                          </Badge>
                        )}
                        {index === 0 && oferta.is_active !== false && (
                          <Badge className="bg-gradient-to-r from-[#F26729] to-[#FDB813] text-white px-3 py-1 text-sm font-medium shadow-lg">
                            Más recomendada
                          </Badge>
                        )}
                      </div>

                      {/* Ranking Badge - moved to top right */}
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#F26729] to-[#FDB813] rounded-full shadow-lg border-2 border-white">
                          <span className="text-white font-bold text-lg">#{index + 1}</span>
                        </div>
                      </div>

                      {oferta.marca && (
                        <div className="absolute bottom-4 left-4">
                          <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#0F2B66] shadow-lg">
                            <Sparkles className="h-3 w-3 text-[#F26729]" />
                            {oferta.marca}
                          </div>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6 flex flex-col">
                      <h3 className="text-lg font-bold text-[#0F2B66] mb-3 leading-snug break-words group-hover:text-[#F26729] transition-colors duration-300">
                        {oferta.descripcion}
                      </h3>

                      <div className="mb-6 flex-1">
                        {/* Mostrar precio simple sin conversión */}
                        <div className="space-y-3">
                          <div className="text-3xl font-bold text-[#F26729]">
                            {(isClient && oferta.precio_cliente ? oferta.precio_cliente : oferta.precio).toLocaleString()} {formatCurrency(oferta.moneda)}
                          </div>

                          {/* Show original price if there's a client discount */}
                          {isClient && oferta.precio_cliente && (
                            <div className="text-sm text-gray-500 line-through">
                              Precio original: {oferta.precio.toLocaleString()} {formatCurrency(oferta.moneda)}
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
                        asChild
                        className="w-full bg-secondary-gradient hover:opacity-90 text-white font-medium py-2.5 rounded-lg transition-all duration-300 group-hover:shadow-lg"
                      >
                        <Link href={`/ofertas/${oferta.id}`} onClick={saveOfertasScrollPosition}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalles
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Info de precios - Se muestra siempre que hay ofertas */}
          {!loading && !error && filteredOfertas.length > 0 && (
            <div className="px-4 mt-6 mb-10" data-aos="fade-up" data-aos-delay="100">
              <div className="max-w-3xl mx-auto space-y-3">
                {/* Nota Legal sobre Monedas */}
                <div className="flex items-start gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 backdrop-blur border-2 border-amber-300 px-4 py-3 rounded-xl shadow-md text-xs sm:text-sm text-gray-800">
                  <DollarSign className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="leading-relaxed">
                    <p className="font-semibold text-amber-800 mb-1">Precios en Moneda Extranjera:</p>
                    <p>
                      Los precios expresados en USD son <span className="font-semibold">referenciales internacionales</span> y aplican para:
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-gray-700">
                      <li>Pagos desde el exterior</li>
                      <li>Opciones de financiamiento internacional</li>
                    </ul>
                    <p className="mt-2 text-gray-700">
                      Para pagos en Cuba, los precios se cobrarán en <span className="font-semibold">monedas locales al tipo de cambio vigente</span>.

                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/80 backdrop-blur border border-blue-100 px-4 py-3 rounded-xl shadow-sm text-xs sm:text-sm text-gray-600">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="leading-relaxed">
                    Los precios publicados son referenciales y pueden ajustarse ligeramente (al alza o a la baja) según las características finales de cada proyecto.
                    Te avisaremos con antelación si aplica algún ajuste.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-gradient-to-r from-orange-50 to-yellow-50 backdrop-blur border border-orange-200 px-4 py-3 rounded-xl shadow-sm text-xs sm:text-sm text-gray-700">
                  <MessageCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="leading-relaxed">
                    <span className="font-semibold text-orange-700">Importante:</span> La información aquí presentada es solo referencial.
                    Le recomendamos hablar primero con nuestros profesionales para recibir asesoría personalizada y obtener detalles precisos sobre su proyecto solar.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur border border-green-200 px-4 py-3 rounded-xl shadow-sm text-xs sm:text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="leading-relaxed">
                    <p className="mb-2">
                      <span className="font-semibold text-green-700">Cobertura de servicio:</span> Brindamos servicio garantizado en{' '}
                      <span className="font-semibold">La Habana y sus municipios</span>.
                    </p>
                    <p className="text-gray-600">
                      Para otras provincias, existe disponibilidad según cada caso. Le invitamos a contactarnos indicando su provincia para evaluar las opciones de servicio y coordinar la mejor solución para su proyecto.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gradient-to-r from-purple-50 to-pink-50 backdrop-blur border border-purple-200 px-4 py-3 rounded-xl shadow-sm text-xs sm:text-sm text-gray-700">
                  <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="leading-relaxed">
                    Los presupuestos tienen una validez de <span className="font-semibold text-purple-700">10 días naturales</span> a partir de su emisión.
                  </p>
                </div>

                {/* Financing Marketing Banner - Movido al final */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                        <span className="font-semibold text-blue-700">¿Sabías que</span> algunas ofertas puedes optarlas por
                        <span className="font-semibold text-blue-700"> pago a plazo</span> a través de un familiar en España?
                      </p>
                      <p className="text-gray-600 text-xs sm:text-sm mt-1">
                        Consulta disponibilidad en cada oferta.
                      </p>
                    </div>
                    <div className="flex-shrink-0 mt-2 sm:mt-0">
                      <div className="flex items-center gap-2 text-xs sm:text-sm bg-blue-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                        <MapPin className="w-3 h-3 text-blue-600" />
                        <span className="text-blue-700 font-medium">desde España</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && ofertas.length === 0 && (
            <div className="text-center py-12 md:py-16 px-4" data-aos="fade-up">
              <Card className="max-w-md mx-auto shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4 flex items-center justify-center">
                    <Eye className="w-12 h-12 sm:w-16 sm:h-16" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#0F2B66] mb-2">No hay ofertas disponibles</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
                    En este momento no tenemos ofertas disponibles. Vuelve pronto para ver nuestras nuevas opciones.
                  </p>
                  <Button asChild className="bg-secondary-gradient hover:opacity-90 text-white text-sm sm:text-base px-4 sm:px-6">
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
              data-aos="fade-up"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-50 to-transparent rounded-full -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-50 to-transparent rounded-full translate-y-16 -translate-x-16"></div>

              <CardContent className="p-8 md:p-12 relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#F26729] to-[#FDB813] rounded-full mb-6 shadow-lg">
                    <Info className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-[#0F2B66] mb-4">
                    Opciones de Pago Flexibles
                  </h3>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
                    Facilitamos tu inversión en energía solar con diversas opciones de pago
                  </p>
                </div>

                <div className="max-w-2xl mx-auto">
                
                   <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
                        <CreditCard className="w-6 h-6 text-orange-600" />
                      </div>
                      <h4 className="text-xl font-bold text-[#0F2B66]">Métodos de Pago</h4>
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
          <Card className="bg-secondary-gradient text-white text-center shadow-xl" data-aos="fade-up">
            <CardContent className="py-12">
              <Phone className="w-12 h-12 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-3">¿Interesado en alguna oferta?</h3>
              <p className="text-white/90 mb-8 max-w-lg mx-auto">
                Contacta a nuestro equipo de especialistas para obtener más información y asesoramiento personalizado
              </p>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="bg-white text-[#F26729] hover:bg-gray-100 font-semibold px-8 py-3"
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
            <Loader2 className="w-4 h-4 animate-spin text-[#F26729]" />
            Restaurando posicion...
          </div>
        </div>
      )}
    </>
  );
}

export default function OfertasPage() {
  const [isChristmas, setIsChristmas] = useState(false);

  useEffect(() => {
    setIsChristmas(isChristmasSeason());
  }, []);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pt-32 pb-16">
        {isChristmas ? <NavigationChristmas /> : <Navigation />}
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#F26729] mx-auto mb-4" />
            <p className="text-gray-600">Cargando ofertas...</p>
          </div>
        </div>
        {isChristmas ? <FooterChristmas /> : <Footer />}
      </div>
    }>
      <OfertasContent />
    </Suspense>
  );
}

