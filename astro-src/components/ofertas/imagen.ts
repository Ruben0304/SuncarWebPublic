import { imageSrcset, optimizedImage } from "@/lib/image";
import { esOptimizable } from "~/lib/imagenes";

// Mismos anchos y reglas con los que el sitio servía las imágenes de los kits
// por el optimizador: `srcset` hasta el doble del ancho pedido y `sizes` como
// lo daba la página (o el ancho mismo, o la pantalla entera si rellena).
const ANCHOS = [384, 640, 828, 1080, 1200, 1920];

const anchosHasta = (max: number) => {
  const ok = ANCHOS.filter((a) => a <= max);
  return ok.length ? ok : [ANCHOS[0]];
};
const anchoCercano = (w: number) => ANCHOS.find((a) => a >= w) ?? ANCHOS[ANCHOS.length - 1];

interface Opciones {
  /** Ancho en pantalla; sin él (o con `rellena`) se asume una imagen que llena su caja. */
  width?: number;
  rellena?: boolean;
  sizes?: string;
  quality?: number;
}

export function atributosImagen(src: string, { width, rellena, sizes, quality }: Opciones = {}) {
  if (!esOptimizable(src)) return { src, srcset: undefined, sizes: undefined };
  const llena = rellena || !width;
  return {
    src: optimizedImage(src, anchoCercano((width ?? 828) * 2), { quality }),
    srcset: imageSrcset(src, anchosHasta(llena ? 1920 : (width as number) * 2), { quality }),
    sizes: sizes ?? (llena ? "100vw" : `${width}px`),
  };
}
