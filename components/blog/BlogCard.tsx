import React from "react"
import Link from "next/link"
import { Calendar, TrendingUp, Tag, ArrowRight } from "lucide-react"
import { Categoria } from "./CategoryBadge"

interface BlogCardProps {
  id: string
  titulo: string
  slug: string
  resumen: string
  imagen_principal: string | null
  categoria: Categoria
  tags: string[]
  autor: string
  fecha_publicacion: string | null
  visitas: number
  index?: number
}

export default function BlogCard({
  id,
  titulo,
  slug,
  resumen,
  imagen_principal,
  categoria,
  tags,
  autor,
  fecha_publicacion,
  visitas,
  index = 0,
}: BlogCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Fecha no disponible"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <article
      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
      style={{
        animation: `fade-in-up 0.6s ease-out ${index * 0.1}s backwards`,
      }}
    >
      {/* Image */}
      <Link href={`/blog/${slug}`} className="block relative h-64 overflow-hidden bg-gray-200">
        {imagen_principal ? (
          <img
            src={imagen_principal}
            alt={titulo}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-blue-900">
            <span className="text-6xl">☀️</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(fecha_publicacion)}
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {visitas} visitas
          </div>
        </div>

        {/* Title */}
        <Link href={`/blog/${slug}`}>
          <h3 className="text-xl font-bold text-primary group-hover:text-orange-600 transition-colors duration-300 line-clamp-2">
            {titulo}
          </h3>
        </Link>

        {/* Summary */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{resumen}</p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Read More */}
        <Link
          href={`/blog/${slug}`}
          className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:text-orange-600 transition-colors duration-300"
        >
          Leer más
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
        </Link>

        {/* Author */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">Por {autor}</p>
        </div>
      </div>
    </article>
  )
}
