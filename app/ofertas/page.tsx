'use client';

import { useClient } from '@/hooks/useClient';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/navigation';
import { Star, Phone, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function OfertasPage() {
  const { clientData, isClient } = useClient();

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic'
    });
  }, []);

  if (!isClient) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">Acceso Restringido</CardTitle>
              <CardDescription>
                Esta sección está disponible únicamente para clientes verificados de Suncar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-gradient-to-r from-[#F26729] to-[#FDB813] hover:from-[#e55a1f] hover:to-[#e6a610] text-white">
                <Link href="/">Volver al Inicio</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const offers = [
    {
      title: "Mantenimiento Premium",
      discount: "20%",
      description: "Servicio técnico especializado con garantía extendida",
      originalPrice: 5000,
      offerPrice: 4000,
      currency: "CUP",
      image: "/images/projects/1.jpg",
      features: ["Revisión completa", "Limpieza de paneles", "Informe detallado", "Garantía 2 años"]
    },
    {
      title: "Instalación Residencial",
      discount: "15%",
      description: "Sistema solar completo para hogares",
      originalPrice: 25000,
      offerPrice: 21250,
      currency: "CUP",
      image: "/images/projects/2.jpg",
      features: ["6 paneles solares", "Inversor incluido", "Instalación gratis", "Garantía 5 años"]
    },
    {
      title: "Expansión de Sistema",
      discount: "10%",
      description: "Ampliación de instalaciones existentes",
      originalPrice: 12000,
      offerPrice: 10800,
      currency: "CUP",
      image: "/images/projects/3.png",
      features: ["Paneles adicionales", "Optimización", "Conexión segura", "Análisis previo"]
    },
    {
      title: "Sistemas Comerciales",
      discount: "25%",
      description: "Soluciones industriales de gran escala",
      originalPrice: 80000,
      offerPrice: 60000,
      currency: "CUP",
      image: "/images/projects/4.jpg",
      features: ["20+ paneles", "Sistema trifásico", "Monitoreo 24/7", "Mantenimiento incluido"]
    },
    {
      title: "Consultoría Energética",
      discount: "50%",
      description: "Evaluación profesional y optimización",
      originalPrice: 2000,
      offerPrice: 1000,
      currency: "CUP",
      image: "/images/projects/5.jpg",
      features: ["Análisis completo", "Reporte técnico", "Plan de ahorro", "Seguimiento mensual"]
    },
    {
      title: "Reparación Express",
      discount: "30%",
      description: "Solución inmediata de averías",
      originalPrice: 3500,
      offerPrice: 2450,
      currency: "CUP",
      image: "/images/projects/6.jpg",
      features: ["Diagnóstico gratis", "Reparación 24hrs", "Piezas originales", "Garantía 1 año"]
    }
  ];

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12" data-aos="fade-up">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[#F26729] to-[#FDB813] rounded-full flex items-center justify-center shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <Badge className="bg-gradient-to-r from-[#F26729] to-[#FDB813] text-white px-6 py-3 text-base font-bold animate-bounce">
                ⭐ Cliente VIP ⭐
              </Badge>
            </div>
            
            <div className="relative">
              <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 via-[#F26729] to-gray-900 bg-clip-text text-transparent">
                🔥 Ofertas Exclusivas para Clientes 🔥
              </h1>
              <div className="absolute -top-2 -right-8 w-24 h-24 bg-yellow-200 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-2 -left-8 w-16 h-16 bg-orange-200 rounded-full opacity-20 animate-pulse"></div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 max-w-4xl mx-auto border-2 border-[#F26729]/10 shadow-lg mb-6">
              <p className="text-xl text-gray-700 mb-2">
                ¡Bienvenido de vuelta, <span className="font-bold text-[#F26729] text-2xl">{clientData?.nombre}</span>! 
              </p>
              <p className="text-lg text-gray-600">
                Descubre las <span className="font-semibold text-[#F26729]">ofertas especiales</span> que tenemos preparadas exclusivamente para ti.
              </p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <Badge className="bg-red-500 text-white px-3 py-1 animate-pulse">⚡ OFERTAS LIMITADAS</Badge>
                <Badge className="bg-green-500 text-white px-3 py-1">💰 PRECIOS ESPECIALES</Badge>
                <Badge className="bg-blue-500 text-white px-3 py-1">⭐ SOLO PARA VIP</Badge>
              </div>
            </div>
          </div>

          {/* Offers Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {offers.map((offer, index) => (
              <Card 
                key={index} 
                className="overflow-hidden hover:shadow-2xl transition-all duration-500 group relative border-2 hover:border-[#F26729]/20 bg-white hover:bg-gradient-to-br hover:from-white hover:to-orange-50/30"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-500 text-white font-bold text-lg px-3 py-1 animate-pulse shadow-lg">
                      -{offer.discount}
                    </Badge>
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-yellow-400 text-black font-bold text-xs px-2 py-1">
                      OFERTA LIMITADA
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                  <p className="text-gray-600 mb-4">{offer.description}</p>
                  
                  {/* Pricing Section */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold text-gray-400 line-through">
                        {offer.originalPrice.toLocaleString()} {offer.currency}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[#F26729]">
                        {offer.offerPrice.toLocaleString()} {offer.currency}
                      </span>
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1">
                        Precio Cliente VIP
                      </Badge>
                    </div>
                    <p className="text-sm text-green-600 font-medium mt-1">
                      ¡Ahorras {(offer.originalPrice - offer.offerPrice).toLocaleString()} {offer.currency}!
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Incluye:</h4>
                    <ul className="space-y-1">
                      {offer.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-[#F26729] to-[#FDB813] hover:from-[#e55a1f] hover:to-[#e6a610] text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                    🔥 Solicitar Oferta
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact CTA */}
          <Card 
            className="bg-gradient-to-r from-[#F26729] to-[#FDB813] text-white text-center"
            data-aos="fade-up"
          >
            <CardContent className="py-8">
              <Phone className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">¿Interesado en Alguna Oferta?</h3>
              <p className="text-white/90 mb-6">
                Contacta a nuestro equipo especializado para clientes VIP
              </p>
              <Button 
                variant="secondary" 
                size="lg" 
                className="bg-white text-[#F26729] hover:bg-gray-100 font-semibold"
              >
                <Phone className="w-4 h-4 mr-2" />
                Contactar Ahora
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}