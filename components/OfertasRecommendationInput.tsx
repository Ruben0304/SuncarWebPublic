'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Search,
  Loader2,
  X,
  Zap
} from 'lucide-react';

interface OfertasRecommendationInputProps {
  onSearch: (query: string) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}


export default function OfertasRecommendationInput({
  onSearch,
  loading = false,
  disabled = false,
  placeholder = "Ejemplo: sistema solar para casa mediana, equipos económicos para hogar, productos con financiamiento..."
}: OfertasRecommendationInputProps) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="w-full max-w-6xl mx-auto mb-8">
      {/* Search Header */}
      <div className="mb-6 text-center" data-aos="fade-up">
        <h2 className="text-2xl md:text-3xl font-bold text-[#0F2B66] mb-2">
          Encuentra Tu Oferta Perfecta
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Describe lo que buscas y te ayudaremos a encontrar las mejores opciones para ti
        </p>
      </div>

      {/* Search Container */}
      <div className="relative" data-aos="fade-up" data-aos-delay="100">
        <form onSubmit={handleSubmit}>
          <div className={`relative bg-white rounded-2xl border-2 transition-all duration-500 shadow-lg hover:shadow-xl ${
            isExpanded
              ? 'border-orange-300 shadow-orange-100/50'
              : 'border-gray-200 hover:border-orange-200'
          }`}>

            {/* Input Field */}
            <div className="flex items-center p-4 md:p-6">
              <div className="flex-shrink-0 mr-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  isExpanded
                    ? 'bg-gradient-to-r from-[#F26729] to-[#FDB813] scale-110'
                    : 'bg-gray-100'
                }`}>
                  {loading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Search className={`w-6 h-6 transition-colors duration-300 ${
                      isExpanded ? 'text-white' : 'text-gray-400'
                    }`} />
                  )}
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
                disabled={disabled || loading}
                className="flex-1 text-lg md:text-xl text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none resize-none disabled:opacity-50"
              />

              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <Button
                type="submit"
                disabled={!query.trim() || loading || disabled}
                className={`ml-4 px-6 py-3 bg-gradient-to-r from-[#F26729] to-[#FDB813] hover:from-[#E5551A] hover:to-[#F4A307] text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Recomendar
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}