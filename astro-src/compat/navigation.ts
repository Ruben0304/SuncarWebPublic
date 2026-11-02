import { useEffect, useState } from "react";

/**
 * Sustituto de next/navigation#usePathname. Dentro de una isla de Astro no
 * hay router de Next: se lee `location.pathname` del navegador tras montar.
 * Devuelve null en el primer render (SSR/antes de montar), igual que el
 * comportamiento que ya toleraba el código original.
 */
export function usePathname(): string | null {
  const [pathname, setPathname] = useState<string | null>(null);
  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);
  return pathname;
}

/**
 * Sustituto de next/navigation#useRouter. No hay router de cliente de Next
 * dentro de una isla: `push`/`replace` navegan de verdad (recarga completa),
 * que es lo único que necesita el único uso real (router.push a otra página).
 */
export function useRouter() {
  return {
    push: (href: string) => {
      window.location.href = href;
    },
    replace: (href: string) => {
      window.location.replace(href);
    },
    back: () => window.history.back(),
    refresh: () => window.location.reload(),
  };
}
