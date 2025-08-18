import type { Metadata } from 'next'
import '../styles/globals.css'
import ChatAssistant from "@/components/feats/chat/ChatAssistant";
import ClientWrapper from "@/components/ClientWrapper";

export const metadata: Metadata = {
  title: {
    default: 'SunCar Cuba - Paneles Solares y Baterías en Cuba',
    template: '%s | SunCar Cuba'
  },
  description: 'Transforma tu hogar con energía solar limpia y renovable. SunCar Cuba ofrece sistemas de paneles solares y baterías que reducen tu factura eléctrica hasta 90%. Instalación profesional en Cuba.',
  keywords: 'energia solar Cuba, paneles solares hogar, SunCar Cuba, energia renovable Cuba, sistemas solares residenciales, baterias solares, instalacion paneles solares La Habana',
  authors: [{ name: 'SunCar Cuba' }],
  creator: 'SunCar Cuba',
  publisher: 'SunCar Cuba',
  applicationName: 'SunCar Cuba',
  generator: 'Next.js',
  category: 'Energy',
  classification: 'Business',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_CU',
    url: 'https://suncarsrl.com',
    siteName: 'SunCar Cuba',
    title: 'SunCar Cuba - Energía Solar para Tu Hogar',
    description: 'Reduce tu factura eléctrica hasta 90% con nuestros sistemas de paneles solares y baterías de última generación. Instalación profesional en Cuba.',
    images: [
      {
        url: '/images/hero-suncar.jpg',
        width: 1200,
        height: 630,
        alt: 'SunCar Cuba - Energía Solar para Tu Hogar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@SunCarCuba',
    creator: '@SunCarCuba',
    title: 'SunCar Cuba - Energía Solar para Tu Hogar',
    description: 'Reduce tu factura eléctrica hasta 90% con nuestros sistemas de paneles solares y baterías de última generación.',
    images: ['/images/hero-suncar.jpg'],
  },
  // alternates: {
  //   canonical: 'https://suncar-cuba.com',
  //   languages: {
  //     'es-CU': 'https://suncar-cuba.com',
  //     'es': 'https://suncar-cuba.com',
  //   },
  // },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code'
  },
  other: {
    'geo.region': 'CU',
    'geo.country': 'Cuba',
    'geo.placename': 'La Habana',
    'ICBM': '23.1136,-82.3666',
    'DC.title': 'SunCar Cuba - Energía Solar',
    'DC.creator': 'SunCar Cuba',
    'DC.subject': 'Energía Solar, Paneles Solares, Cuba',
    'DC.description': 'Soluciones de energía solar fotovoltaica en Cuba',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "SunCar Cuba",
              "alternateName": "Suncar",
              "url": "https://suncarsrl.com",
              "logo": "https://suncarsrl.com/images/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+5363962417",
                "contactType": "customer service",
                "areaServed": "CU",
                "availableLanguage": "Spanish"
              },
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Calle 24 entre 1ra y 3ra, Playa",
                "addressLocality": "La Habana",
                "addressCountry": "CU"
              },
              "sameAs": [
                "https://facebook.com/SunCarCuba",
                "https://instagram.com/SunCarCuba",
                "https://linkedin.com/company/suncar-cuba"
              ],
              "description": "SunCar Cuba es líder en soluciones de energía solar fotovoltaica para hogares y empresas en Cuba. Ofrecemos instalación de paneles solares, sistemas autónomos y consultoría energética.",
              "foundingDate": "2020",
              "industry": "Renewable Energy",
              "areaServed": {
                "@type": "Country",
                "name": "Cuba"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Servicios de Energía Solar",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Instalación de Paneles Solares Residenciales",
                      "description": "Instalación profesional de sistemas solares para hogares"
                    }
                  },
                  {
                    "@type": "Offer", 
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Sistemas Solares Comerciales",
                      "description": "Soluciones de energía solar para empresas y comercios"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service", 
                      "name": "Consultoría Energética",
                      "description": "Asesoramiento profesional en eficiencia energética"
                    }
                  }
                ]
              }
            })
          }}
        />
        <link rel="canonical" href="https://suncarsrl.com" />
        <meta name="geo.region" content="CU" />
        <meta name="geo.country" content="Cuba" />
        <meta name="geo.placename" content="La Habana" />
        <meta name="ICBM" content="23.1136,-82.3666" />
        <meta name="apple-mobile-web-app-title" content="Suncar" />
      </head>
      <body className="overflow-x-hidden">
        <ClientWrapper>
          {children}
          {/*<ChatAssistant />*/}
        </ClientWrapper>
      </body>
    </html>
  )
}
