import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contacto - SunCar Cuba | Consultoría Gratuita en Energía Solar',
  description: 'Contáctanos para una consultoría gratuita en energía solar. SunCar Cuba: líderes en instalación de paneles solares. Tel: +53 7 123-4567. La Habana, Cuba.',
  keywords: 'contacto SunCar Cuba, consultoria energia solar gratis, telefono paneles solares Cuba, direccion SunCar Habana, cotizacion energia solar',
  openGraph: {
    title: 'Contacto - SunCar Cuba | Consultoría Gratuita',
    description: 'Contáctanos para tu proyecto de energía solar. Consultoría gratuita, respuesta en 24 horas. Tel: +53 7 123-4567.',
    type: 'website',
    locale: 'es_CU',
    url: 'https://suncar-cuba.com/contacto',
    images: [{
      url: '/images/contacto-suncar.jpg',
      width: 1200,
      height: 630,
      alt: 'Contacto SunCar Cuba - Consultoría Gratuita'
    }]
  },
  alternates: {
    canonical: 'https://suncar-cuba.com/contacto'
  }
}

export default function ContactoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}