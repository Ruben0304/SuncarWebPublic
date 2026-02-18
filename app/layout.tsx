import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import "../styles/globals.css";
import "../styles/nprogress.css";
import ClientWrapper from "@/components/ClientWrapper";
import ProgressBarSuspense from "@/components/ProgressBarSuspense";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SunCar Cuba - Paneles Solares y Baterías en Cuba",
    template: "%s | SunCar Cuba",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  description:
    "Soluciona los problemas eléctricos de tu hogar con energía solar confiable. SunCar Cuba ofrece sistemas de paneles solares y baterías que garantizan electricidad 24/7, incluso durante apagones. Instalación profesional en Cuba.",
  keywords:
    "energia solar Cuba, paneles solares hogar, SunCar Cuba, energia renovable Cuba, sistemas solares residenciales, baterias solares, instalacion paneles solares La Habana",
  authors: [{ name: "SunCar Cuba" }],
  creator: "SunCar Cuba",
  publisher: "SunCar Cuba",
  applicationName: "SunCar Cuba",
  generator: "Next.js",
  category: "Energy",
  classification: "Business",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL("https://suncarsrl.com"),
  openGraph: {
    type: "website",
    locale: "es_CU",
    url: "https://suncarsrl.com",
    siteName: "SunCar Cuba",
    title: "SunCar Cuba - Solución al Déficit Energético en Cuba",
    description:
      "Elimina los problemas de electricidad con nuestros sistemas de paneles solares y baterías. Garantizamos energía 24/7 incluso durante apagones. Instalación profesional en Cuba.",
    images: [
      {
        url: "/images/hero-suncar.jpg",
        width: 1200,
        height: 630,
        alt: "SunCar Cuba - Energía Solar para Tu Hogar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@SunCarCuba",
    creator: "@SunCarCuba",
    title: "SunCar Cuba - Solución al Déficit Energético en Cuba",
    description:
      "Elimina los problemas de electricidad con nuestros sistemas de paneles solares y baterías. Garantizamos energía 24/7 incluso durante apagones.",
    images: ["/images/hero-suncar.jpg"],
  },
  // alternates: {
  //   canonical: 'https://suncar-cuba.com',
  //   languages: {
  //     'es-CU': 'https://suncar-cuba.com',
  //     'es': 'https://suncar-cuba.com',
  //   },
  // },
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  //   yahoo: 'your-yahoo-verification-code'
  // },
  other: {
    "geo.region": "CU",
    "geo.country": "Cuba",
    "geo.placename": "La Habana",
    ICBM: "23.1136,-82.3666",
    "DC.title": "SunCar Cuba - Energía Solar",
    "DC.creator": "SunCar Cuba",
    "DC.subject": "Energía Solar, Paneles Solares, Cuba",
    "DC.description": "Soluciones de energía solar fotovoltaica en Cuba",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cinzel.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SunCar Cuba",
              alternateName: "Suncar",
              url: "https://suncarsrl.com",
              logo: "https://suncarsrl.com/images/logo.png",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+5363962417",
                contactType: "customer service",
                areaServed: "CU",
                availableLanguage: "Spanish",
              },
              address: {
                "@type": "PostalAddress",
                streetAddress: "Calle 24 entre 1ra y 3ra, Playa",
                addressLocality: "La Habana",
                addressCountry: "CU",
              },
              sameAs: [
                "https://facebook.com/SunCarCuba",
                "https://instagram.com/SunCarCuba",
                "https://linkedin.com/company/suncar-cuba",
              ],
              description:
                "SunCar Cuba es líder en soluciones al déficit energético con sistemas solares que garantizan electricidad 24/7. Eliminamos los problemas de apagones con paneles solares, baterías y sistemas autónomos para hogares y empresas en Cuba.",
              foundingDate: "2020",
              industry: "Renewable Energy",
              areaServed: {
                "@type": "Country",
                name: "Cuba",
              },
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Servicios de Energía Solar",
                itemListElement: [
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Instalación de Paneles Solares Residenciales",
                      description:
                        "Instalación profesional de sistemas solares para hogares",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Sistemas Solares Comerciales",
                      description:
                        "Soluciones de energía solar para empresas y comercios",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Consultoría Energética",
                      description:
                        "Asesoramiento profesional en eficiencia energética",
                    },
                  },
                ],
              },
            }),
          }}
        />
        <link rel="canonical" href="https://suncarsrl.com" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <meta name="geo.region" content="CU" />
        <meta name="geo.country" content="Cuba" />
        <meta name="geo.placename" content="La Habana" />
        <meta name="ICBM" content="23.1136,-82.3666" />
        <meta name="apple-mobile-web-app-title" content="Suncar" />
      </head>
      <body className="overflow-x-hidden">
        <ProgressBarSuspense />
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
