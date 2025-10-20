'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Star } from 'lucide-react';

interface BrandOption {
  key: string;
  label: string;
  count: number;
}

interface BrandFilterBannerProps {
  brandOptions: BrandOption[];
  selectedBrandKey: string | null;
  onBrandSelect: (brandKey: string | null) => void;
}

export default function BrandFilterBanner({
  brandOptions,
  selectedBrandKey,
  onBrandSelect
}: BrandFilterBannerProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Animar entrada
  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const handleBrandClick = (brandKey: string | null) => {
    onBrandSelect(brandKey);
  };

  if (brandOptions.length === 0) {
    return null;
  }

  return (
    <div
      className={`mb-8 px-4 transition-all duration-700 ${
        isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
      data-aos="fade-up"
      data-aos-delay="50"
    >
      <div className="max-w-6xl mx-auto">
        {/* Banner Principal con fondo más claro y degradado */}
        <div className="bg-gradient-to-br from-blue-50/95 via-orange-50/60 to-yellow-50/80 rounded-2xl overflow-hidden shadow-xl border-2 border-[#0F2B66]/15 backdrop-blur-sm">
          {/* Contenido */}
          <div className="relative p-6 sm:p-8">
            {/* Efectos decorativos sutiles mejorados */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#F26729]/15 to-transparent rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#FDB813]/15 to-transparent rounded-full translate-y-16 -translate-x-16"></div>
            <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-br from-[#0F2B66]/5 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2"></div>

            <div className="relative z-10">
              {/* Título mejorado */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-[#F26729] to-[#FDB813] rounded-full shadow-lg">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0F2B66]">
                    Entérate de las Marcas con las que Trabajamos
                  </h3>
                  <div className="p-2 bg-gradient-to-br from-[#F26729] to-[#FDB813] rounded-full shadow-lg">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-[#0F2B66]/80 text-sm sm:text-base font-medium">
                  Selecciona una marca para ver sus ofertas exclusivas
                </p>
              </div>

              {/* Selector de marcas - Pills horizontales más grandes y elegantes */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                {/* Opción "Todas" */}
                <button
                  onClick={() => handleBrandClick(null)}
                  className={`px-6 py-3.5 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md ${
                    !selectedBrandKey
                      ? 'bg-gradient-to-r from-[#F26729] to-[#FDB813] text-white shadow-md shadow-[#F26729]/20 ring-1 ring-[#FDB813]/30'
                      : 'bg-white text-[#0F2B66] hover:bg-gradient-to-br hover:from-white hover:to-blue-50 hover:shadow-lg border-2 border-[#0F2B66]/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className={`w-5 h-5 ${!selectedBrandKey ? 'animate-pulse' : ''}`} />
                    <span>Todas las Marcas</span>
                    <span className={`px-2.5 py-1 rounded-lg text-sm font-extrabold ${
                      !selectedBrandKey
                        ? 'bg-white/20 text-white'
                        : 'bg-[#0F2B66]/15 text-[#0F2B66]'
                    }`}>
                      {brandOptions.reduce((sum, b) => sum + b.count, 0)}
                    </span>
                  </div>
                </button>

                {/* Divisor visual mejorado */}
                <div className="hidden sm:block w-0.5 h-10 bg-gradient-to-b from-transparent via-[#0F2B66]/30 to-transparent"></div>

                {/* Lista de marcas con mejor contraste */}
                {brandOptions.map((brand) => (
                  <button
                    key={brand.key}
                    onClick={() => handleBrandClick(brand.key)}
                    className={`px-6 py-3.5 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md ${
                      selectedBrandKey === brand.key
                        ? 'bg-gradient-to-r from-[#F26729] to-[#FDB813] text-white shadow-md shadow-[#F26729]/20 ring-1 ring-[#FDB813]/30'
                        : 'bg-white text-[#0F2B66] hover:bg-gradient-to-br hover:from-white hover:to-blue-50 hover:shadow-lg border-2 border-[#0F2B66]/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="tracking-wide">{brand.label}</span>
                      <span className={`px-2.5 py-1 rounded-lg text-sm font-extrabold ${
                        selectedBrandKey === brand.key
                          ? 'bg-white/20 text-white'
                          : 'bg-[#0F2B66]/15 text-[#0F2B66]'
                      }`}>
                        {brand.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}