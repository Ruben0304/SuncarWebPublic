import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Testimonios Clientes - SunCar Cuba | 500+ Familias Satisfechas',
  description: 'Lee testimonios reales de nuestros clientes en Cuba. Más de 500 familias satisfechas con energía solar. Calificación promedio 4.9/5. Ahorro promedio del 85% en facturas.',
  keywords: 'testimonios energia solar Cuba, clientes satisfechos SunCar, reseñas paneles solares, experiencias energia solar Cuba, casos exito instalaciones solares',
  openGraph: {
    title: 'Testimonios Clientes - SunCar Cuba',
    description: 'Historias reales de familias cubanas que han transformado sus hogares con energía solar. 4.9/5 estrellas, 98% de recomendación.',
    type: 'website',
    locale: 'es_CU',
    url: 'https://suncar-cuba.com/testimonios',
    images: [{
      url: '/images/testimonios-suncar.jpg',
      width: 1200,
      height: 630,
      alt: 'Testimonios Clientes SunCar Cuba'
    }]
  },
  alternates: {
    canonical: 'https://suncar-cuba.com/testimonios'
  }
}

export default function TestimoniosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}