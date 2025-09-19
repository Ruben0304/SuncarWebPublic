'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { Star, Phone, Eye, ArrowRight, Loader2, Filter, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { OfertaSimplificada, OfertasResponse } from '@/types/ofertas';
import { useClient } from '@/hooks/useClient';

export default function OfertasPage() {
  const [ofertas, setOfertas] = useState<OfertaSimplificada[]>([]);
  const [filteredOfertas, setFilteredOfertas] = useState<OfertaSimplificada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'precio-asc' | 'precio-desc' | 'nombre'>('precio-asc');
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const { isClient } = useClient();

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
      easing: 'ease-out'
    });
  }, []);

  useEffect(() => {
    fetchOfertas();
  }, []);

  useEffect(() => {
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

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'precio-asc': return a.precio - b.precio;
        case 'precio-desc': return b.precio - a.precio;
        case 'nombre': return a.descripcion.localeCompare(b.descripcion);
        default: return 0;
      }
    });

    setFilteredOfertas(filtered);
  }, [ofertas, sortBy, priceFilter]);

  const fetchOfertas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/ofertas/simplified');
      const data: OfertasResponse = await response.json();

      if (data.success) {
        setOfertas(data.data);
      } else {
        setError(data.message || 'Error al cargar ofertas');
      }
    } catch (err) {
      console.error('Error fetching ofertas:', err);
      setError('Error de conexión al cargar ofertas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold text-[#0F2B66] mb-4">
              Nuestras Ofertas
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre las mejores opciones en sistemas solares con precios especiales para ti
            </p>
          </div>

          {/* Floating Filters */}
          {!loading && !error && ofertas.length > 0 && (
            <div className="mb-8" data-aos="fade-up" data-aos-delay="200">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200 shadow-xl">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                  {/* Filtro por precio */}
                  <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-gray-700" />
                    <span className="text-gray-700 font-medium">Filtrar por precio:</span>
                    <div className="flex gap-2">
                      {[
                        { key: 'all', label: 'Todos' },
                        { key: 'low', label: '< $10k' },
                        { key: 'mid', label: '$10k - $50k' },
                        { key: 'high', label: '> $50k' }
                      ].map((filter) => (
                        <button
                          key={filter.key}
                          onClick={() => setPriceFilter(filter.key as typeof priceFilter)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            priceFilter === filter.key
                              ? 'bg-secondary-gradient text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ordenamiento */}
                  <div className="flex items-center gap-3">
                    <ArrowUpDown className="w-5 h-5 text-gray-700" />
                    <span className="text-gray-700 font-medium">Ordenar por:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="bg-gray-100 text-gray-700 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#F26729]/50"
                    >
                      <option value="precio-asc">Precio: Menor a Mayor</option>
                      <option value="precio-desc">Precio: Mayor a Menor</option>
                      <option value="nombre">Nombre A-Z</option>
                    </select>
                  </div>

                  {/* Contador de resultados */}
                  <div className="text-gray-600 text-sm">
                    {filteredOfertas.length} de {ofertas.length} ofertas
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16" data-aos="fade-up">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#0F2B66] mx-auto mb-4" />
                <p className="text-gray-600">Cargando ofertas...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16" data-aos="fade-up">
              <Card className="max-w-md mx-auto shadow-lg">
                <CardContent className="p-8">
                  <div className="text-red-500 mb-4">
                    <Star className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0F2B66] mb-2">Error al cargar ofertas</h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <Button
                    onClick={fetchOfertas}
                    className="bg-secondary-gradient hover:opacity-90 text-white"
                  >
                    Intentar de nuevo
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Offers Grid */}
          {!loading && !error && filteredOfertas.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {filteredOfertas.map((oferta, index) => (
                <Card
                  key={oferta.id || index}
                  className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={oferta.imagen || "/images/oferta_generica.jpg"}
                      alt={oferta.descripcion}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-[#0F2B66] text-white px-3 py-1 text-sm font-medium">
                        Oferta
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-[#0F2B66] mb-3 line-clamp-2 group-hover:text-[#F26729] transition-colors duration-300">
                      {oferta.descripcion}
                    </h3>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        {isClient && oferta.precio_cliente ? (
                          <>
                            <span className="text-2xl font-bold text-[#F26729]">
                              ${oferta.precio_cliente.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ${oferta.precio.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-2xl font-bold text-[#F26729]">
                              ${oferta.precio.toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <Button
                      asChild
                      className="w-full bg-secondary-gradient hover:opacity-90 text-white font-medium py-2.5 rounded-lg transition-all duration-300 group-hover:shadow-lg"
                    >
                      <Link href={`/ofertas/${oferta.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalles
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && ofertas.length === 0 && (
            <div className="text-center py-16" data-aos="fade-up">
              <Card className="max-w-md mx-auto shadow-lg">
                <CardContent className="p-8">
                  <div className="w-16 h-16 text-gray-400 mx-auto mb-4 flex items-center justify-center">
                    <Eye className="w-16 h-16" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0F2B66] mb-2">No hay ofertas disponibles</h3>
                  <p className="text-gray-600 mb-6">
                    En este momento no tenemos ofertas disponibles. Vuelve pronto para ver nuestras nuevas opciones.
                  </p>
                  <Button asChild className="bg-secondary-gradient hover:opacity-90 text-white">
                    <Link href="/servicios">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Ver Servicios
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

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
      <Footer />
    </>
  );
}