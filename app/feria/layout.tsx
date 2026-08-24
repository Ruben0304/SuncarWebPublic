import type { Metadata } from "next"

/**
 * `/feria` es una herramienta interna del stand, no una página del sitio.
 * Vive en la web pública porque no hay infra nueva, pero no tiene por qué
 * aparecer en Google ni competir con las páginas comerciales.
 */
export const metadata: Metadata = {
  title: "Feria Varadero",
  robots: { index: false, follow: false },
}

export default function FeriaLayout({ children }: { children: React.ReactNode }) {
  return children
}
