'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/navigation';
import NavigationChristmas from '@/components/navigation-christmas';
import Footer from '@/components/footer';
import { isChristmasSeason } from '@/lib/christmas-utils';
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
  MapPin,
  Percent,
  Sparkles,
  Tag,
  Info,
  FileText,
  Download
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Oferta, OfertaResponse } from '@/types/ofertas';
import { useClient } from '@/hooks/useClient';
import CurrencySelector from '@/components/CurrencySelector';
import { Currency } from '@/hooks/useCurrencyExchange';
import { useAOS } from '@/hooks/useAOS';

export default function OfertaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [oferta, setOferta] = useState<Oferta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedElementImages, setFailedElementImages] = useState<Record<string, boolean>>({});
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('EUR');
  const [isChristmas, setIsChristmas] = useState(false);
  const { isClient } = useClient();

  // Debug: ver qué contiene params
  console.log('=== DEBUG PARAMS ===');
  console.log('params:', params);
  console.log('params.id:', params.id);
  console.log('typeof params.id:', typeof params.id);
  console.log('=== END DEBUG ===');

  const ofertaId = params.id as string;

  // Check if it's Christmas season
  useEffect(() => {
    setIsChristmas(isChristmasSeason());
  }, []);

  // Initialize AOS with global hook
  useAOS({ duration: 800, once: true, easing: 'ease-out-cubic' });

  useEffect(() => {
    if (ofertaId) {
      fetchOferta();
    }
  }, [ofertaId]);

  const fetchOferta = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!ofertaId) {
        setError('ID de oferta no válido');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/ofertas/${ofertaId}`);
      const data: OfertaResponse = await response.json();

      if (data.success && data.data) {
        setOferta(data.data);
        setFailedElementImages({});
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
      {isChristmas ? <NavigationChristmas /> : <Navigation />}
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
                {/* Image Section */}
                <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
                  <Image
                    src={oferta.imagen || "/placeholder.svg"}
                    alt={oferta.descripcion}
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Status badges - top left corner */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {/* Sold Out Badge - for inactive offers */}
                    {oferta.is_active === false && (
                      <Badge className="bg-gray-600 text-white px-4 py-2 text-base font-bold shadow-xl border-2 border-white">
                        AGOTADA
                      </Badge>
                    )}

                    {/* Discount or Special Offer Badge */}
                    {oferta.descuentos && oferta.descuentos.trim() !== '' ? (
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-4 py-2 shadow-xl border-2 border-white flex items-center gap-2">
                        <Percent className="w-4 h-4" />
                        CON DESCUENTO
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-400 text-black font-bold px-3 py-1 shadow-lg">
                        OFERTA ESPECIAL
                      </Badge>
                    )}
                  </div>

                  {oferta.marca && (
                    <div className="absolute bottom-4 left-4">
                      <div className="inline-flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[#0F2B66] shadow-lg">
                        <Sparkles className="h-5 w-5 text-[#F26729]" />
                        Marca certificada: {oferta.marca}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Section - Below Image */}
                <div className="p-6 md:p-8 lg:p-10 bg-white">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F2B66] mb-6 leading-tight">
                    {oferta.descripcion}
                  </h1>

                  {oferta.marca && (
                    <div className="mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-[#0F2B66] border-opacity-10 bg-gradient-to-r from-[#F4F7FF] to-[#EAF3FF] px-4 py-3 shadow-sm">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0F2B66] shadow">
                          <Sparkles className="h-4 w-4 text-[#F26729]" />
                          Marca aliada
                        </div>
                        <p className="text-sm sm:text-base text-[#0F2B66] opacity-80">
                          {oferta.marca} respalda este sistema con componentes seleccionados y certificaciones vigentes.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Price Display - Sin conversión de moneda (API agotada) */}
                    <div className="flex items-baseline gap-4 flex-wrap">
                      <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F26729]">
                        {(isClient && oferta.precio_cliente ? oferta.precio_cliente : oferta.precio).toLocaleString()} {formatCurrency(oferta.moneda)}
                      </div>

                      {/* Show original price if there's a client discount */}
                      {isClient && oferta.precio_cliente && (
                        <div className="text-xl sm:text-2xl md:text-3xl text-gray-500 line-through">
                          {oferta.precio.toLocaleString()} {formatCurrency(oferta.moneda)}
                        </div>
                      )}
                    </div>

                    {/* Financing Information */}
                    {/* TEMPORALMENTE COMENTADO
                    {oferta.financiamiento && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-gray-700">
                          <span className="text-base sm:text-lg">o desde</span>
                          <span className="text-xl sm:text-2xl font-bold text-[#0F2B66]">78 €/mes</span>
                          <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full w-fit">
                            <MapPin className="w-4 h-4" />
                            <span>solo desde España</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Discount Information Section */}
              {oferta.descuentos && oferta.descuentos.trim() !== '' && (
                <Card className="bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 border-2 border-orange-200 shadow-xl overflow-hidden relative" data-aos="fade-up" data-aos-delay="50">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-orange-100/30 rounded-full -translate-y-20 translate-x-20"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-100/30 rounded-full translate-y-16 -translate-x-16"></div>

                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-3 text-2xl text-orange-700">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <Percent className="w-6 h-6 text-white" />
                      </div>
                      ¡Descuentos Especiales Disponibles!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200 shadow-md">
                      <div className="flex items-start gap-3 mb-3">
                        <Tag className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                            {oferta.descuentos}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-orange-100">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Info className="w-4 h-4 text-orange-500" />
                          Contacta con nosotros para más detalles sobre estos descuentos y cómo aplicarlos.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Currency Selector Section - COMENTADO: API agotada */}
              {/* <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg" data-aos="fade-up" data-aos-delay="75">
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
              </Card> */}

              <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
                {/* Garantías */}
                <Card
                  data-aos="fade-up"
                  data-aos-delay="75"
                  className="lg:sticky lg:top-28 lg:self-start"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <Shield className="w-6 h-6 text-[#F26729]" />
                      Garantías Incluidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {oferta.garantias && oferta.garantias.length > 0 ? (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          {oferta.garantias.map((garantia, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{garantia}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-gray-700 leading-relaxed">
                              Cualquier intervención de terceros anulará automáticamente la cobertura de garantía realizada por nuestro equipo de profesionales certificados de SUNCAR.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No hay garantías especificadas para esta oferta.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Elementos/Componentes */}
                <Card data-aos="fade-up" data-aos-delay="100">
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
                              {(() => {
                                const imageKey = `${index}-${elemento.categoria || ''}-${elemento.descripcion || ''}`;
                                const showImage = Boolean(elemento.foto) && !failedElementImages[imageKey];
                                return showImage ? (
                                  <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-white border border-gray-200">
                                    <Image
                                      src={elemento.foto as string}
                                      alt={elemento.descripcion || 'Elemento'}
                                      fill
                                      className="object-contain p-1"
                                      sizes="64px"
                                      onError={() =>
                                        setFailedElementImages((prev) => ({
                                          ...prev,
                                          [imageKey]: true,
                                        }))
                                      }
                                    />
                                  </div>
                                ) : (
                                  <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-amber-700" />
                                  </div>
                                );
                              })()}
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

              {/* PDF Ficha Técnica Section */}
              {oferta.pdf && oferta.pdf.trim() !== '' && (
                <Card
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg overflow-hidden relative"
                  data-aos="fade-up"
                  data-aos-delay="125"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100/30 rounded-full -translate-y-20 translate-x-20"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100/30 rounded-full translate-y-16 -translate-x-16"></div>

                  <CardContent className="p-6 md:p-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-blue-800 mb-2">Ficha Técnica Completa</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Descarga el documento PDF con toda la información técnica detallada de esta oferta, incluyendo especificaciones, características y certificaciones.
                          </p>
                        </div>
                      </div>
                      <div className="w-full md:w-auto">
                        <Button
                          asChild
                          size="lg"
                          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <a
                            href={oferta.pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            <Download className="w-5 h-5" />
                            Descargar PDF
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Service Coverage Information */}
              <Card
                className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg overflow-hidden relative"
                data-aos="fade-up"
                data-aos-delay="150"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-green-100/30 rounded-full -translate-y-20 translate-x-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-100/30 rounded-full translate-y-16 -translate-x-16"></div>

                <CardContent className="p-6 md:p-8 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-green-800 mb-3">Cobertura de Servicio</h3>
                      <div className="space-y-3 text-gray-700">
                        <p className="leading-relaxed">
                          <span className="font-semibold text-green-700">Servicio garantizado en La Habana:</span> Ofrecemos cobertura completa en todos los municipios de la capital.
                        </p>
                        <p className="leading-relaxed text-gray-600">
                          <span className="font-medium text-gray-700">Otras provincias:</span> Evaluamos cada caso de forma individual. Por favor, contáctenos indicando su provincia para coordinar las opciones disponibles y brindarle la mejor solución para su proyecto de energía solar.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp Contact Section */}
              <Card
                className="bg-white border-2 border-gray-100 overflow-hidden relative shadow-xl"
                data-aos="fade-up"
                data-aos-delay="175"
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
                            Hola! Me interesa la oferta: <span className="font-semibold">{oferta.descripcion}</span> por <span className="font-semibold">{(isClient && oferta.precio_cliente ? oferta.precio_cliente : oferta.precio).toLocaleString()} {formatCurrency(oferta.moneda)}</span>. ¿Podrían darme más información?
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
                        href={`https://wa.me/5363962417?text=${encodeURIComponent(`Hola! Me interesa la oferta: ${oferta.descripcion} por ${(isClient && oferta.precio_cliente ? oferta.precio_cliente : oferta.precio).toLocaleString()} ${formatCurrency(oferta.moneda)} ¿Podrían darme más información?`)}`}
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

