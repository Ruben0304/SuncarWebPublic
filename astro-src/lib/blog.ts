// Tipos y ayudantes del blog que comparten el servidor (frontmatter de los
// .astro) y el navegador (la isla que entra en acción si el servidor no
// consiguió los datos).

export type Categoria =
  | "instalacion"
  | "mantenimiento"
  | "casos_exito"
  | "ahorro_energetico"
  | "novedades"
  | "normativas";

export const CATEGORIAS_INFO: Record<Categoria, { label: string; color: string; icon: string }> = {
  instalacion: { label: "Instalación", color: "from-[#012928] to-[#023d3a]", icon: "⚡" },
  mantenimiento: { label: "Mantenimiento", color: "from-[#F2C300] to-[#AFEB17]", icon: "🔧" },
  casos_exito: { label: "Casos de Éxito", color: "from-[#012928] to-[#023d3a]", icon: "⭐" },
  ahorro_energetico: { label: "Ahorro Energético", color: "from-[#F2C300] to-[#AFEB17]", icon: "💰" },
  novedades: { label: "Novedades", color: "from-[#012928] to-[#023d3a]", icon: "🆕" },
  normativas: { label: "Normativas", color: "from-[#F2C300] to-[#AFEB17]", icon: "📋" },
};

export function esCategoria(valor: string | null | undefined): valor is Categoria {
  return !!valor && Object.prototype.hasOwnProperty.call(CATEGORIAS_INFO, valor);
}

export interface BlogListadoItem {
  id: string;
  titulo: string;
  slug: string;
  resumen: string;
  imagen_principal: string | null;
  categoria: Categoria;
  tags: string[];
  autor: string;
  fecha_publicacion: string | null;
  visitas: number;
}

export interface BlogDetalle {
  id: string;
  titulo: string;
  slug: string;
  resumen: string;
  contenido: string;
  imagen_principal: string | null;
  imagenes_adicionales: string[];
  categoria: Categoria;
  tags: string[];
  autor: string;
  estado: "borrador" | "publicado" | "archivado";
  fecha_creacion: string;
  fecha_publicacion: string | null;
  fecha_actualizacion: string;
  seo_meta_descripcion: string | null;
  visitas: number;
}

export function formatearFecha(fecha: string | null): string {
  if (!fecha) return "Fecha no disponible";
  return new Date(fecha).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function minutosDeLectura(contenido: string): number {
  return Math.ceil(contenido.split(/\s+/).length / 200);
}

/** Mismo backend que usaba la isla de React desde el navegador. */
export function backendDelNavegador(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
}
