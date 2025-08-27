'use client';

import { useClient } from '@/hooks/useClient';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/navigation';
import { Star, Zap, Shield, Clock, Gift, Phone } from 'lucide-react';
import Link from 'next/link';

export default function OfertasPage() {
  const { clientData, isClient } = useClient();

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
      title: "Descuento VIP en Mantenimiento",
      discount: "20%",
      description: "Servicio técnico especializado con descuento exclusivo para clientes.",
      icon: Shield,
      color: "from-blue-500 to-blue-600",
      features: ["Revisión completa del sistema", "Limpieza de paneles", "Optimización de rendimiento"]
    },
    {
      title: "Expansión de Sistema",
      discount: "15%",
      description: "Amplía tu instalación solar con descuentos preferenciales.",
      icon: Zap,
      color: "from-green-500 to-green-600",
      features: ["Paneles adicionales", "Más capacidad de batería", "Instalación incluida"]
    },
    {
      title: "Consultoría Energética Gratuita",
      discount: "100%",
      description: "Evaluación completa de eficiencia energética sin costo.",
      icon: Clock,
      color: "from-purple-500 to-purple-600",
      features: ["Análisis de consumo", "Recomendaciones personalizadas", "Plan de optimización"]
    },
    {
      title: "Kit de Emergencia Solar",
      discount: "25%",
      description: "Sistema de respaldo portátil para situaciones especiales.",
      icon: Gift,
      color: "from-orange-500 to-orange-600",
      features: ["Panel portátil 100W", "Batería de respaldo", "Conexiones múltiples"]
    }
  ];

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#F26729] to-[#FDB813] rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <Badge className="bg-gradient-to-r from-[#F26729] to-[#FDB813] text-white px-4 py-2 text-sm">
                Cliente VIP
              </Badge>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Ofertas Exclusivas para Clientes
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ¡Bienvenido de vuelta, <span className="font-semibold text-[#F26729]">{clientData?.nombre}</span>! 
              Descubre las ofertas especiales que tenemos preparadas para ti.
            </p>
          </div>

          {/* Offers Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {offers.map((offer, index) => {
              const IconComponent = offer.icon;
              return (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-400">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${offer.color} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-gray-900">{offer.title}</CardTitle>
                          <CardDescription>{offer.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-lg font-bold text-green-700 bg-green-100">
                        -{offer.discount}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {offer.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gradient-to-r from-[#F26729] to-[#FDB813] rounded-full" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full bg-gradient-to-r from-[#F26729] to-[#FDB813] hover:from-[#e55a1f] hover:to-[#e6a610] text-white">
                      Solicitar Oferta
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Contact CTA */}
          <Card className="bg-gradient-to-r from-[#F26729] to-[#FDB813] text-white text-center">
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