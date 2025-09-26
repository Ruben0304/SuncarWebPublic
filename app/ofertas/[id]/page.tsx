'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import {
  ArrowLeft,
  Star,
  Phone,
  Shield,
  Package,
  CheckCircle,
  Loader2,
  ShoppingBag,
  Image as ImageIcon,
  MessageCircle,
  Send,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Oferta, OfertaResponse } from '@/types/ofertas';
import { useClient } from '@/hooks/useClient';
import CurrencySelector from '@/components/CurrencySelector';
import { Currency, useCurrencyExchange } from '@/hooks/useCurrencyExchange';

export default function OfertaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [oferta, setOferta] = useState<Oferta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('EUR');
  const { isClient } = useClient();
  const { convertPrice, formatPrice } = useCurrencyExchange();

  const ofertaId = params.id as string;

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic'
    });
  }, []);

  useEffect(() => {
    if (ofertaId) {
      fetchOferta();
    }
  }, [ofertaId]);

  const fetchOferta = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/ofertas/${ofertaId}`);
      const data: OfertaResponse = await response.json();

      if (data.success && data.data) {
        setOferta(data.data);
        // Inicializar la moneda seleccionada con la moneda base de la oferta
        setSelectedCurrency(data.data.moneda.toUpperCase() as Currency);
      } else {
        setError(data.message || 'Oferta no encontrada');
      }
    } catch (err) {
      console.error('Error fetching oferta:', err);
      setError('Error de conexión al cargar la oferta');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (moneda: string) => {
    if (moneda.toLowerCase() === 'eur') return 'EUR';
    if (moneda.toLowerCase() === 'usd') return 'USD';
    return moneda.toUpperCase();
  };


  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6" data-aos="fade-right">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Ofertas
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20" data-aos="fade-up">
              <div className="text-center">
                <Loader2 className="w-16 h-16 animate-spin text-[#F26729] mx-auto mb-4" />
                <p className="text-lg text-gray-600">Cargando detalles de la oferta...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20" data-aos="fade-up">
              <Card className="max-w-lg mx-auto">
                <CardContent className="p-8">
                  <div className="text-red-500 mb-4">
                    <Star className="w-16 h-16 mx-auto" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Oferta no encontrada</h2>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Volver atrás
                    </Button>
                    <Button
                      onClick={fetchOferta}
                      className="bg-gradient-to-r from-[#F26729] to-[#FDB813] hover:from-[#e55a1f] hover:to-[#e6a610] text-white"
                    >
                      Intentar de nuevo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Oferta Details */}
          {!loading && !error && oferta && (
            <div className="space-y-8">
              {/* Header Card */}
              <Card className="overflow-hidden" data-aos="fade-up">
                <div className="relative">
                  <div className="relative h-64 md:h-80 lg:h-96">
                    <Image
                      src={oferta.imagen || "/images/oferta_generica.jpg"}
                      alt={oferta.descripcion}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <div className="flex items-center gap-3 mb-4">
                        <Badge className="bg-yellow-400 text-black font-bold px-3 py-1">
                          OFERTA ESPECIAL
                        </Badge>
                      </div>
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        {oferta.descripcion}
                      </h1>
                      <div className="space-y-4">
                        {/* Price Display */}
                        <div className="flex items-baseline gap-4 flex-wrap">
                          <div className="text-4xl md:text-5xl font-bold text-white">
                            {formatPrice(convertPrice(isClient && oferta.precio_cliente ? oferta.precio_cliente : oferta.precio, oferta.moneda.toUpperCase() as Currency, selectedCurrency), selectedCurrency)}
                          </div>

                          {/* Show original price if there's a client discount */}
                          {isClient && oferta.precio_cliente && (
                            <div className="text-2xl md:text-3xl text-white/70 line-through">
                              {oferta.precio.toLocaleString()} {formatCurrency(oferta.moneda)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Financing Information */}
                      {oferta.financiamiento && (
                        <div className="mt-6 pt-4 border-t border-white/20">
                          <div className="flex items-center gap-3 text-white">
                            <span className="text-lg">o</span>
                            <span className="text-2xl font-bold">78 €/mes</span>
                            <div className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                              <MapPin className="w-4 h-4" />
                              <span>solo desde España</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Currency Selector Section */}
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg" data-aos="fade-up" data-aos-delay="50">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Seleccionar Moneda
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Elige la moneda para ver el precio convertido
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <CurrencySelector
                        baseCurrency={oferta.moneda.toUpperCase() as Currency}
                        selectedCurrency={selectedCurrency}
                        onCurrencyChange={setSelectedCurrency}
                        basePrice={isClient && oferta.precio_cliente ? oferta.precio_cliente : oferta.precio}
                        size="lg"
                        showConvertedPrice={true}
                        className="[&_button]:bg-white [&_button]:border-gray-300 [&_button]:hover:bg-gray-50 [&_button]:shadow-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Garantías */}
                <Card data-aos="fade-up" data-aos-delay="100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <Shield className="w-6 h-6 text-[#F26729]" />
                      Garantías Incluidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {oferta.garantias && oferta.garantias.length > 0 ? (
                      <div className="space-y-3">
                        {oferta.garantias.map((garantia, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{garantia}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No hay garantías especificadas para esta oferta.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Elementos/Componentes */}
                <Card data-aos="fade-up" data-aos-delay="200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <Package className="w-6 h-6 text-[#F26729]" />
                      Elementos Incluidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {oferta.elementos && oferta.elementos.length > 0 ? (
                      <div className="space-y-4">
                        {oferta.elementos.map((elemento, index) => (
                          <div key={index} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex items-start gap-4">
                              <div className="relative w-16 h-16 flex-shrink-0">
                                <Image
                                  src={elemento.foto || "/images/oferta_generica.jpg"}
                                  alt={elemento.descripcion || 'Elemento'}
                                  fill
                                  className="object-cover rounded-lg"
                                />
                              </div>
                              <div className="flex-1">
                                {elemento.categoria && (
                                  <Badge variant="outline" className="mb-2 text-xs">
                                    {elemento.categoria}
                                  </Badge>
                                )}
                                {elemento.descripcion && (
                                  <h4 className="font-semibold text-gray-900 mb-1">
                                    {elemento.descripcion}
                                  </h4>
                                )}
                                {elemento.cantidad && (
                                  <p className="text-sm text-gray-600">
                                    Cantidad: <span className="font-medium">{elemento.cantidad}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No hay elementos especificados para esta oferta.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* WhatsApp Contact Section */}
              <Card
                className="bg-white border-2 border-gray-100 overflow-hidden relative shadow-xl"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-50 rounded-full translate-y-12 -translate-x-12"></div>

                <CardContent className="py-12 relative z-10">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-[#25D366] rounded-full mb-4 shadow-lg">
                      <img
                        src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/whatsapp.svg"
                        alt="WhatsApp"
                        className="w-10 h-10 filter invert"
                      />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                      ¿Te interesa esta oferta?
                    </h2>
                    <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
                      Envíanos un mensaje por <span className="font-semibold text-[#25D366]">WhatsApp</span> y te atenderemos de inmediato.
                      Tu mensaje estará prellenado con los detalles de esta oferta.
                    </p>
                  </div>

                  <div className="max-w-md mx-auto">
                    {/* Chat Bubble Preview */}
                    <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
                          <img
                            src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/whatsapp.svg"
                            alt="WhatsApp"
                            className="w-4 h-4 filter invert"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-2 font-medium">Vista previa del mensaje:</p>
                          <div className="bg-[#DCF8C6] rounded-lg rounded-bl-none p-4 text-sm text-gray-800 shadow-sm border-l-4 border-[#25D366]">
                            Hola! Me interesa la oferta: <span className="font-semibold">{oferta.descripcion}</span> por <span className="font-semibold">{formatPrice(convertPrice(isClient && oferta.precio_cliente ? oferta.precio_cliente : oferta.precio, oferta.moneda.toUpperCase() as Currency, selectedCurrency), selectedCurrency)}</span>. ¿Podrían darme más información?
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span>Podrás editar este mensaje antes de enviarlo</span>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>

                    <Button
                      asChild
                      size="lg"
                      className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
                    >
                      <a
                        href={`https://wa.me/5363962417?text=${encodeURIComponent(`Hola! Me interesa la oferta: ${oferta.descripcion} por ${formatPrice(convertPrice(isClient && oferta.precio_cliente ? oferta.precio_cliente : oferta.precio, oferta.moneda.toUpperCase() as Currency, selectedCurrency), selectedCurrency)} ¿Podrían darme más información?`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3"
                      >
                        <img
                          src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/whatsapp.svg"
                          alt="WhatsApp"
                          className="w-6 h-6 filter invert"
                        />
                        Enviar por WhatsApp
                        <Send className="w-5 h-5" />
                      </a>
                    </Button>

                    <div className="text-center mt-6">
                      <Button
                        asChild
                        variant="ghost"
                        className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
                      >
                        <Link href="/ofertas">
                          Ver Más Ofertas
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}