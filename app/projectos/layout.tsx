import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Proyectos de Energía Solar - SunCar Cuba | 500+ Instalaciones Exitosas',
  description: 'Descubre nuestros proyectos de energía solar en Cuba. Más de 500 instalaciones residenciales y comerciales exitosas. Casos reales de ahorro del 85-92% en facturas eléctricas.',
  keywords: 'proyectos energia solar Cuba, instalaciones paneles solares, casos exito energia solar, proyectos residenciales Cuba, SunCar proyectos, testimonios energia solar',
  openGraph: {
    title: 'Proyectos de Energía Solar - SunCar Cuba',
    description: 'Más de 500 proyectos exitosos de energía solar en Cuba. Descubre cómo hemos transformado hogares con ahorros del 85-92%.',
    type: 'website',
    locale: 'es_CU',
    url: 'https://suncar-cuba.com/projectos',
    images: [{
      url: '/images/projects/proyectos-suncar.jpg',
      width: 1200,
      height: 630,
      alt: 'Proyectos de Energía Solar SunCar Cuba'
    }]
  },
  alternates: {
    canonical: 'https://suncar-cuba.com/projectos'
  }
}

export default function ProjectosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}