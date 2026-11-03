// URL del optimizador de imágenes de Astro (el equivalente a /_next/image).
// Redimensiona, convierte a WebP y cachea un año. Funciona con rutas locales
// (`/images/...`) y remotas (`https://s3.suncarsrl.com/...`, ya permitidas en
// astro.config.mjs). Sirve tanto en islas Svelte como en las de React.
export type ImageOptions = { quality?: number; format?: "webp" | "avif" };

// El SVG ya es vectorial (y /_image no convierte SVG a WebP): se sirve tal cual.
const esSvg = (src: string) => /\.svg(\?|$)/i.test(src);

export function optimizedImage(src: string, width: number, options: ImageOptions = {}): string {
  if (esSvg(src)) return src;
  const params = new URLSearchParams({
    href: src,
    w: String(width),
    f: options.format ?? "webp",
    q: String(options.quality ?? 75),
  });
  return `/_image?${params.toString()}`;
}

export function imageSrcset(src: string, widths: number[], options: ImageOptions = {}): string {
  if (esSvg(src)) return "";
  return widths.map((width) => `${optimizedImage(src, width, options)} ${width}w`).join(", ");
}
