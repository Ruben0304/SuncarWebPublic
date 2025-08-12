import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cotización Gratis - SunCar Cuba | Calcula Tu Sistema Solar Ideal',
  description: 'Obtén una cotización gratuita y personalizada para tu sistema de energía solar en Cuba. Calcula tu ahorro, tamaño de sistema y retorno de inversión en minutos.',
  keywords: 'cotizacion energia solar Cuba, calculadora paneles solares, presupuesto sistema solar, cotizacion gratis energia solar, SunCar cotizacion',
  openGraph: {
    title: 'Cotización Gratis - SunCar Cuba',
    description: 'Calcula tu sistema solar ideal en minutos. Cotización personalizada gratuita con cálculo de ahorro y retorno de inversión.',
    type: 'website',
    locale: 'es_CU',
    url: 'https://suncar-cuba.com/cotizacion',
    images: [{
      url: '/images/cotizacion-suncar.jpg',
      width: 1200,
      height: 630,
      alt: 'Cotización Energía Solar SunCar Cuba'
    }]
  },
  alternates: {
    canonical: 'https://suncar-cuba.com/cotizacion'
  }
}

export default function CotizacionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}