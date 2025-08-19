'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'

// Configuración de NProgress
NProgress.configure({
  showSpinner: false,
  speed: 500,
  minimum: 0.3
})

export default function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Detener el progress cuando la navegación es completa
    NProgress.done()
  }, [pathname, searchParams])

  useEffect(() => {
    // Configurar interceptores para enlaces
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const anchor = target.closest('a')
      
      if (anchor && anchor.href && !anchor.href.startsWith('mailto:') && !anchor.href.startsWith('tel:')) {
        const url = new URL(anchor.href)
        const currentUrl = new URL(window.location.href)
        
        // Solo mostrar progress si es navegación interna y diferente página
        if (url.hostname === currentUrl.hostname && url.pathname !== currentUrl.pathname) {
          NProgress.start()
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)
    
    return () => {
      document.removeEventListener('click', handleAnchorClick)
    }
  }, [])

  return null
}