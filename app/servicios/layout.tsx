import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Servicios de Energía Solar - SunCar Cuba | Instalación y Mantenimiento',
  description: 'Servicios completos de energía solar en Cuba: instalación de paneles solares, sistemas de baterías, mantenimiento y consultoría energética. SunCar Cuba, líder en soluciones solares.',
  keywords: 'servicios energia solar Cuba, instalacion paneles solares, mantenimiento sistema solar, consultoria energetica, sistemas baterias solares, SunCar Cuba servicios',
  openGraph: {
    title: 'Servicios de Energía Solar - SunCar Cuba',
    description: 'Instalación de paneles solares, sistemas de baterías, mantenimiento y consultoría energética. Servicios completos de energía solar en Cuba.',
    type: 'website',
    locale: 'es_CU',
    url: 'https://suncar-cuba.com/servicios',
    images: [{
      url: '/images/servicios-suncar.jpg',
      width: 1200,
      height: 630,
      alt: 'Servicios de Energía Solar SunCar Cuba'
    }]
  },
  alternates: {
    canonical: 'https://suncar-cuba.com/servicios'
  }
}

export default function ServiciosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}