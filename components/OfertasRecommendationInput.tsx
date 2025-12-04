'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Loader2, X, Zap, Brain, ShoppingCart, BarChart3, Award, Sparkles, Check } from 'lucide-react';

interface OfertasRecommendationInputProps {
  onSearch: (query: string) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const LOADING_MESSAGES = [
  { text: "Analizando tus necesidades energéticas", icon: Brain },
  { text: "Explorando nuestro catálogo de ofertas", icon: ShoppingCart },
  { text: "Comparando precios y características", icon: BarChart3 },
  { text: "Evaluando las mejores opciones para ti", icon: Award },
  { text: "Calculando la mejor relación calidad-precio", icon: Sparkles },
  { text: "Preparando tus recomendaciones personalizadas", icon: Check },
];


export default function OfertasRecommendationInput({
  onSearch,
  loading = false,
  disabled = false,
  placeholder = "Ej: 'Necesito paneles solares para una casa de 3 habitaciones con bajo consumo' o 'Busco un sistema económico y confiable'..."
}: OfertasRecommendationInputProps) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Efecto para rotar los mensajes de carga cada 3 segundos
  useEffect(() => {
    if (!loading) {
      setCurrentMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !loading && !disabled) {
      await onSearch(query.trim());
    }
  };

  const handleInputFocus = () => {
    setIsExpanded(true);
  };

  const handleInputBlur = () => {
    if (!query.trim()) {
      setIsExpanded(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setIsExpanded(false);
    inputRef.current?.focus();
  };

  const currentMessage = LOADING_MESSAGES[currentMessageIndex];
  const CurrentIcon = currentMessage.icon;

  return (
    <div className="w-full max-w-6xl mx-auto mb-8 md:mb-12 px-4">
      {/* Search Header */}
      <div className="mb-6 md:mb-8 text-center" data-aos="fade-up">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#0F2B66] leading-tight mb-3">
          Encuentra Tu Oferta Perfecta
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-2">
          Cuéntanos qué necesitas y nuestra IA te recomendará las mejores opciones
        </p>
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-orange-50 px-4 py-2 rounded-full border border-blue-200">
          <Zap className="w-4 h-4 text-[#0F2B66]" />
          <span className="text-sm font-medium text-[#0F2B66]">Búsqueda inteligente con IA</span>
        </div>
      </div>

      {/* Loading State - Componente transformado */}
      {loading ? (
        <div className="relative" data-aos="fade-up" data-aos-delay="100">
          <div className="relative bg-gradient-to-r from-orange-50 via-yellow-50 to-orange-50 rounded-2xl border-2 border-orange-300 shadow-2xl overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-orange-100">
              <div className="h-full bg-gradient-to-r from-[#F26729] to-[#FDB813] animate-progress"></div>
            </div>

            <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 md:p-8">
              {/* Animated Icon Container */}
              <div className="flex-shrink-0">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20">
                  {/* Pulsing rings */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F26729] to-[#FDB813] animate-ping opacity-20"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F26729] to-[#FDB813] animate-pulse opacity-30"></div>

                  {/* Main icon circle - SIN bounce */}
                  <div className="relative flex items-center justify-center w-full h-full rounded-full bg-gradient-to-r from-[#F26729] to-[#FDB813] shadow-lg">
                    <CurrentIcon className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white animate-fade-in" key={currentMessageIndex} />
                  </div>

                  {/* Spinner overlay */}
                  <div className="absolute -inset-2 sm:-inset-3">
                    <Loader2 className="w-full h-full text-orange-400 animate-spin opacity-30" />
                  </div>
                </div>
              </div>

              {/* Loading Message */}
              <div className="flex-1 text-center sm:text-left w-full">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-orange-700 uppercase tracking-wider">
                    Procesando
                  </span>
                </div>

                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#0F2B66] mb-1 animate-fade-in px-2 sm:px-0" key={`text-${currentMessageIndex}`}>
                  {currentMessage.text}
                </h3>

                <p className="text-xs sm:text-sm text-gray-600">
                  Esto solo tomará unos momentos...
                </p>

                {/* Progress dots */}
                <div className="flex justify-center sm:justify-start gap-1.5 sm:gap-2 mt-3">
                  {LOADING_MESSAGES.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 sm:h-1.5 rounded-full transition-all duration-500 ${index === currentMessageIndex
                        ? 'w-6 sm:w-8 bg-gradient-to-r from-[#F26729] to-[#FDB813]'
                        : 'w-1 sm:w-1.5 bg-orange-200'
                        }`}
                    />
                  ))}
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-2 right-2 hidden sm:block">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 animate-pulse" />
              </div>
              <div className="absolute bottom-2 left-2 hidden sm:block">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400 animate-pulse" style={{ animationDelay: '500ms' }} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Search Container - Estado normal */
        <div className="relative" data-aos="fade-up" data-aos-delay="100">
          <form onSubmit={handleSubmit}>
            <div className={`relative bg-white rounded-2xl border-2 transition-all duration-500 shadow-lg hover:shadow-xl ${isExpanded
              ? 'border-orange-300 shadow-orange-100/50'
              : 'border-gray-200 hover:border-orange-200'
              }`}>

              {/* Input Field */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-6">
                <div className="flex-shrink-0 hidden sm:block">
                  <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-300 ${isExpanded
                    ? 'bg-gradient-to-r from-[#F26729] to-[#FDB813] scale-110'
                    : 'bg-gray-100'
                    }`}>
                    <Search className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${isExpanded ? 'text-white' : 'text-gray-400'
                      }`} />
                  </div>
                </div>

                <div className="flex-1 w-full relative">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-3 sm:hidden">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${isExpanded
                        ? 'bg-gradient-to-r from-[#F26729] to-[#FDB813]'
                        : 'bg-gray-100'
                        }`}>
                        <Search className={`w-4 h-4 transition-colors duration-300 ${isExpanded ? 'text-white' : 'text-gray-400'
                          }`} />
                      </div>
                    </div>

                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder={placeholder}
                      disabled={disabled}
                      className="flex-1 text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none resize-none disabled:opacity-50 leading-relaxed"
                    />

                    {query && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="flex-shrink-0 p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!query.trim() || disabled}
                  className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#0F2B66] to-[#F26729] hover:from-[#0D2555] hover:to-[#E5551A] text-white font-semibold text-sm sm:text-base rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl`}
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Buscar con IA
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
