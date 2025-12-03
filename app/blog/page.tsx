"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Navigation from "@/components/navigation"
import NavigationChristmas from "@/components/navigation-christmas"
import Footer from "@/components/footer"
import { BlogCard, CATEGORIAS_INFO, type Categoria } from "@/components/blog"
import { isChristmasSeason } from "@/lib/christmas-utils"

// Tipos basados en la API
interface BlogPublicoListadoItem {
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
}

function BlogContent() {
  const searchParams = useSearchParams()
  const categoriaParam = searchParams.get("categoria") as Categoria | null

  const [blogs, setBlogs] = useState<BlogPublicoListadoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isChristmas, setIsChristmas] = useState(false)

  useEffect(() => {
    setIsChristmas(isChristmasSeason())
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
      const response = await fetch(`${backendUrl}/api/blog/`)
      const result = await response.json()

      if (result.success) {
        setBlogs(result.data)
      } else {
        setError(result.message || "Error al cargar los blogs")
      }
    } catch (err) {
      setError("Error de conexión al cargar los blogs")
      console.error("Error fetching blogs:", err)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar blogs por categoría si hay un parámetro
  const displayBlogs = categoriaParam
    ? blogs.filter(blog => blog.categoria === categoriaParam)
    : blogs

  const categoryInfo = categoriaParam ? CATEGORIAS_INFO[categoriaParam] : null

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {isChristmas ? <NavigationChristmas /> : <Navigation />}

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-4 py-24 md:px-6 lg:px-8 bg-gradient-to-br from-primary via-blue-900 to-primary overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-secondary-gradient rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-20 w-40 h-40 bg-orange-500/20 rounded-full opacity-30 blur-3xl animate-pulse animation-delay-1000"></div>

        <div className="container mx-auto text-center relative z-10">
          <div className="space-y-6 max-w-4xl mx-auto">
            {categoryInfo && (
              <div className="mb-4">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm"
                >
                  ← Volver a todos los artículos
                </Link>
              </div>
            )}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              {categoryInfo ? (
                <>
                  <span className="flex items-center justify-center gap-3">
                    <span className="text-5xl">{categoryInfo.icon}</span>
                    {categoryInfo.label}
                  </span>
                </>
              ) : (
                <>
                  Blog de
                  <span className="block bg-secondary-gradient bg-clip-text text-transparent mt-2 leading-tight pb-1">
                    Energía Solar
                  </span>
                </>
              )}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              {categoryInfo
                ? `Artículos sobre ${categoryInfo.label.toLowerCase()}`
                : "Información, consejos y novedades sobre energía solar, instalaciones fotovoltaicas y sostenibilidad"
              }
            </p>
          </div>
        </div>
      </section>

      {/* Blog Grid Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="inline-block p-8 bg-red-50 rounded-2xl">
                <p className="text-red-600 text-lg font-medium">{error}</p>
                <button
                  onClick={fetchBlogs}
                  className="mt-4 px-6 py-2 bg-secondary-gradient text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : displayBlogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-block p-8 bg-gray-50 rounded-2xl">
                <p className="text-gray-600 text-lg">
                  {categoryInfo
                    ? `No hay artículos disponibles en la categoría ${categoryInfo.label}`
                    : "No hay artículos disponibles"
                  }
                </p>
                {categoryInfo && (
                  <Link
                    href="/blog"
                    className="mt-4 inline-block px-6 py-2 bg-secondary-gradient text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Ver todos los artículos
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayBlogs.map((blog, index) => (
                <BlogCard key={blog.id} {...blog} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function BlogPage() {
  const [isChristmas, setIsChristmas] = useState(false)

  useEffect(() => {
    setIsChristmas(isChristmasSeason())
  }, [])

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white overflow-x-hidden">
        {isChristmas ? <NavigationChristmas /> : <Navigation />}
        <section className="relative min-h-[60vh] flex items-center justify-center px-4 py-24 md:px-6 lg:px-8 bg-gradient-to-br from-primary via-blue-900 to-primary overflow-hidden">
          <div className="container mx-auto text-center">
            <div className="h-16 w-16 mx-auto animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          </div>
        </section>
        <Footer />
      </div>
    }>
      <BlogContent />
    </Suspense>
  )
}
