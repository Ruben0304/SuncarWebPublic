"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, TrendingUp, Tag, Share2, Clock, User } from "lucide-react"
import Navigation from "@/components/navigation"
import NavigationChristmas from "@/components/navigation-christmas"
import Footer from "@/components/footer"
import { CategoryBadge, type Categoria } from "@/components/blog"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import { isChristmasSeason } from "@/lib/christmas-utils"

// Tipos basados en la API
type Estado = "borrador" | "publicado" | "archivado"

interface BlogPublicoDetalle {
  id: string
  titulo: string
  slug: string
  resumen: string
  contenido: string
  imagen_principal: string | null
  imagenes_adicionales: string[]
  categoria: Categoria
  tags: string[]
  autor: string
  estado: Estado
  fecha_creacion: string
  fecha_publicacion: string | null
  fecha_actualizacion: string
  seo_meta_descripcion: string | null
  visitas: number
}

export default function BlogDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [blog, setBlog] = useState<BlogPublicoDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isChristmas, setIsChristmas] = useState(false)

  useEffect(() => {
    setIsChristmas(isChristmasSeason())
  }, [])

  useEffect(() => {
    if (slug) {
      fetchBlog()
    }
  }, [slug])

  const fetchBlog = async () => {
    try {
      setLoading(true)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
      const response = await fetch(`${backendUrl}/api/blog/${slug}`)
      const result = await response.json()

      if (result.success && result.data) {
        setBlog(result.data)
      } else {
        setError(result.message || "Blog no encontrado")
      }
    } catch (err) {
      setError("Error de conexión al cargar el blog")
      console.error("Error fetching blog:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Fecha no disponible"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    const minutes = Math.ceil(wordCount / wordsPerMinute)
    return minutes
  }

  // Normalizar contenido markdown (convertir \r\n a \n)
  const normalizeMarkdown = (content: string) => {
    return content
      .replace(/\r\n/g, '\n')  // Normalizar saltos de línea Windows
      .replace(/\r/g, '\n')     // Normalizar saltos de línea Mac antiguos
  }

  const handleShare = async () => {
    const shareData = {
      title: blog?.titulo || "Artículo de Suncar",
      text: blog?.resumen || "",
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href)
      alert("Enlace copiado al portapapeles")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {isChristmas ? <NavigationChristmas /> : <Navigation />}
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white">
        {isChristmas ? <NavigationChristmas /> : <Navigation />}
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block p-12 bg-gray-50 rounded-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {error || "Blog no encontrado"}
              </h2>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-secondary-gradient text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al blog
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {isChristmas ? <NavigationChristmas /> : <Navigation />}

      {/* Clean Article Header - Medium Style */}
      <article className="pt-20 pb-8">
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumb - Subtle */}
          <div className="max-w-3xl mx-auto mb-8 pt-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al blog
            </Link>
          </div>

          {/* Header Content - Centered, Clean */}
          <header className="max-w-3xl mx-auto mb-12">
            {/* Category Badge - Subtle */}
            <div className="mb-6">
              <CategoryBadge categoria={blog.categoria} size="lg" />
            </div>

            {/* Title - Large, Bold, Black */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
              {blog.titulo}
            </h1>

            {/* Summary - Larger subtitle */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed font-light">
              {blog.resumen}
            </p>

            {/* Author & Meta Info - Clean horizontal layout */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center text-white font-bold text-lg">
                    {blog.autor.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{blog.autor}</div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{formatDate(blog.fecha_publicacion)}</span>
                      <span>•</span>
                      <span>{estimateReadingTime(blog.contenido)} min de lectura</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir
                </button>
              </div>
            </div>
          </header>

          {/* Featured Image - Better proportions, contained */}
          {blog.imagen_principal && (
            <figure className="max-w-4xl mx-auto mb-12">
              <div className="relative rounded-lg overflow-hidden shadow-xl aspect-[16/9] bg-gray-100">
                <img
                  src={blog.imagen_principal}
                  alt={blog.titulo}
                  className="w-full h-full object-cover"
                />
              </div>
            </figure>
          )}

          {/* Main Content - Single Column, Reader-Focused */}
          <div className="max-w-3xl mx-auto">
            {/* Article Body with Beautiful Typography */}
            <div className="prose prose-xl max-w-none
                prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
                prose-h1:text-5xl prose-h1:mb-8 prose-h1:mt-16 prose-h1:leading-tight
                prose-h2:text-4xl prose-h2:mb-6 prose-h2:mt-14 prose-h2:leading-tight
                prose-h3:text-3xl prose-h3:mb-5 prose-h3:mt-12 prose-h3:leading-tight
                prose-h4:text-2xl prose-h4:mb-4 prose-h4:mt-10
                prose-p:text-gray-700 prose-p:leading-[1.9] prose-p:mb-8 prose-p:text-[1.125rem] prose-p:font-normal
                prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline hover:prose-a:text-orange-600
                prose-strong:text-gray-900 prose-strong:font-bold
                prose-em:text-gray-600 prose-em:italic
                prose-ul:my-8 prose-ul:list-disc prose-ul:pl-8 prose-ul:space-y-3
                prose-ol:my-8 prose-ol:list-decimal prose-ol:pl-8 prose-ol:space-y-3
                prose-li:text-gray-700 prose-li:my-3 prose-li:leading-[1.8] prose-li:text-[1.125rem]
                prose-li>p:my-2 prose-li>p:leading-[1.8]
                prose-blockquote:border-l-4 prose-blockquote:border-gray-900 prose-blockquote:pl-8 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:my-10 prose-blockquote:py-2 prose-blockquote:font-medium prose-blockquote:text-xl prose-blockquote:leading-relaxed
                prose-code:bg-gray-100 prose-code:text-gray-900 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-base prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-6 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-10 prose-pre:border prose-pre:border-gray-800
                prose-img:rounded-lg prose-img:my-12 prose-img:w-full prose-img:shadow-md
                prose-hr:border-gray-200 prose-hr:my-16
                prose-table:border-collapse prose-table:w-full prose-table:my-10
                prose-thead:bg-gray-50
                prose-th:border prose-th:border-gray-200 prose-th:p-4 prose-th:text-left prose-th:font-semibold prose-th:text-gray-900
                prose-td:border prose-td:border-gray-200 prose-td:p-4 prose-td:text-gray-700
              ">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  p: ({ node, ...props }) => <p className="mb-8 text-[1.125rem] leading-[1.9] text-gray-700" {...props} />,
                  h1: ({ node, ...props }) => <h1 className="text-5xl font-bold text-gray-900 mb-8 mt-16 leading-tight tracking-tight" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-4xl font-bold text-gray-900 mb-6 mt-14 leading-tight tracking-tight" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-3xl font-bold text-gray-900 mb-5 mt-12 leading-tight tracking-tight" {...props} />,
                  h4: ({ node, ...props }) => <h4 className="text-2xl font-bold text-gray-900 mb-4 mt-10" {...props} />,
                  ul: ({ node, ...props }) => <ul className="my-8 list-disc pl-8 space-y-3" {...props} />,
                  ol: ({ node, ...props }) => <ol className="my-8 list-decimal pl-8 space-y-3" {...props} />,
                  li: ({ node, ...props }) => <li className="text-gray-700 my-3 leading-[1.8] text-[1.125rem]" {...props} />,
                  blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-900 pl-8 italic text-gray-700 my-10 py-2 font-medium text-xl leading-relaxed" {...props} />,
                  hr: ({ node, ...props }) => <hr className="border-gray-200 my-16" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                  em: ({ node, ...props }) => <em className="italic text-gray-600" {...props} />,
                  a: ({ node, ...props }) => <a className="text-primary font-medium no-underline hover:underline hover:text-orange-600" {...props} />,
                  code: ({ node, inline, ...props }) =>
                    inline ? (
                      <code className="bg-gray-100 text-gray-900 px-2 py-1 rounded text-base font-mono" {...props} />
                    ) : (
                      <code className="block" {...props} />
                    ),
                  pre: ({ node, ...props }) => <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto my-10 border border-gray-800" {...props} />,
                }}
              >
                {normalizeMarkdown(blog.contenido)}
              </ReactMarkdown>
            </div>

            {/* Tags - Clean, minimal */}
            {blog.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-md hover:bg-gray-200 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Images Gallery - Improved */}
            {blog.imagenes_adicionales && blog.imagenes_adicionales.length > 0 && (
              <div className="mt-12 pt-12 border-t border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Galería de Imágenes</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {blog.imagenes_adicionales.map((img, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden shadow-md group aspect-[4/3] bg-gray-100">
                      <img
                        src={img}
                        alt={`${blog.titulo} - Imagen ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats & Share Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>{blog.visitas} visitas</span>
                  </div>
                </div>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir artículo
                </button>
              </div>
            </div>

            {/* CTA Section - Elegant */}
            <div className="mt-16 p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">¿Interesado en energía solar?</h3>
                <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                  Solicita una cotización personalizada para tu hogar o negocio y descubre cuánto puedes ahorrar
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Link
                    href="/cotizacion"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-blue-900 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Cotizar Ahora
                  </Link>
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 border border-gray-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Ver más artículos
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  )
}
