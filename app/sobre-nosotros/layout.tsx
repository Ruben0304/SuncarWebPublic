import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sobre Nosotros | Suncar - Energía Solar en Cuba',
  description: 'Conoce más sobre Suncar, empresa líder en soluciones de energía solar en Cuba. Más de 5 años transformando hogares cubanos con tecnología solar de calidad.',
  keywords: 'sobre nosotros, Suncar, energía solar Cuba, empresa solar, misión visión valores',
}

export default function SobreNosotrosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}