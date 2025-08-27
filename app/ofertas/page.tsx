'use client';

import { useClient } from '@/hooks/useClient';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/navigation';
import { Star, Phone } from 'lucide-react';
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
      description: "Servicio técnico especializado",
      image: "/images/projects/1.jpg"
    },
    {
      title: "Instalación Residencial",
      discount: "15%",
      description: "Sistemas solares para el hogar",
      image: "/images/projects/2.jpg"
    },
    {
      title: "Expansión de Sistema",
      discount: "10%",
      description: "Ampliación de instalaciones existentes",
      image: "/images/projects/3.png"
    },
    {
      title: "Sistemas Comerciales",
      discount: "25%",
      description: "Soluciones para empresas",
      image: "/images/projects/4.jpg"
    },
    {
      title: "Consultoría Energética",
      discount: "50%",
      description: "Evaluación y optimización",
      image: "/images/projects/5.jpg"
    },
    {
      title: "Reparación Express",
      discount: "30%",
      description: "Solución rápida de averías",
      image: "/images/projects/6.jpg"
    }
  ];

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12" data-aos="fade-up">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {offers.map((offer, index) => (
              <Card 
                key={index} 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 group"
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
                    <Badge className="bg-red-500 text-white font-bold text-lg px-3 py-1">
                      -{offer.discount}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                  <p className="text-gray-600 mb-4">{offer.description}</p>
                  <Button className="w-full bg-gradient-to-r from-[#F26729] to-[#FDB813] hover:from-[#e55a1f] hover:to-[#e6a610] text-white">
                    Solicitar
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