import type { CSSProperties, ImgHTMLAttributes } from "react";

type StaticImg = { src: string; width?: number; height?: number };

interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> {
  src: string | StaticImg;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  /** Aceptado por compatibilidad con next/image; sin pipeline propio no genera blur real. */
  placeholder?: string;
  blurDataURL?: string;
}

/**
 * Sustituto de next/image dentro de las islas de Astro: no hay pipeline de
 * optimización de Next (`/_next/image`) corriendo aquí, así que esto es un
 * <img> nativo con lazy-loading. Las imágenes en sí siguen optimizadas por
 * Astro en los archivos .astro vía `astro:assets`; este shim es solo para el
 * código React que antes asumía next/image.
 */
export default function Image({
  src,
  fill,
  priority,
  placeholder,
  blurDataURL,
  style,
  width,
  height,
  ...props
}: ImageProps) {
  const resolvedSrc = typeof src === "string" ? src : src.src;
  const resolvedWidth = typeof src === "string" ? width : width ?? src.width;
  const resolvedHeight = typeof src === "string" ? height : height ?? src.height;

  const fillStyle: CSSProperties | undefined = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }
    : undefined;

  return (
    <img
      src={resolvedSrc}
      width={resolvedWidth}
      height={resolvedHeight}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={{ ...fillStyle, ...style }}
      {...props}
    />
  );
}
