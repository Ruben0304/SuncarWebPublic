import { imageSrcset, optimizedImage, type ImageOptions } from "@/lib/image";

// Solo lo que /_image acepta: archivos propios y los dominios de astro.config.mjs.
const REMOTOS = /^https:\/\/(s3\.suncarsrl\.com|[^/]+\.supabase\.co)\//;

export function esOptimizable(src: string | null | undefined): src is string {
  if (!src || /\.svg(\?|$)/i.test(src)) return false;
  if (src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("/_image")) return false;
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  return REMOTOS.test(src);
}

/** `src` y `srcset` para una imagen: optimizados si se puede, tal cual si no. */
export function imagenResponsive(src: string, anchos: number[], opciones: ImageOptions = {}) {
  if (!esOptimizable(src)) return { src, srcset: undefined };
  return {
    src: optimizedImage(src, anchos[Math.min(1, anchos.length - 1)], opciones),
    srcset: imageSrcset(src, anchos, opciones),
  };
}
