"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play, Pause, X, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

interface GalleryImages {
  exterior: string[]
  interior: string[]
  nosotros: string[]
}

const createImagePaths = (folder: string, prefix: string, count: number) =>
  Array.from({ length: count }, (_, index) => {
    const imageIndex = count - index
    return `https://s3.suncarsrl.com/galeria/${folder}/${prefix}${imageIndex}.jpg`
  })

const galleryData: GalleryImages = {
  exterior: createImagePaths("instalaciones_exterior", "IE", 26),
  interior: createImagePaths("instalaciones_interior", "II", 8),
  nosotros: createImagePaths("nosotros", "N", 5),
}

const categoryTitles = {
  exterior: "Instalaciones de Exterior",
  interior: "Instalaciones de Interior", 
  nosotros: "Nosotros"
}

const categoryDescriptions = {
  exterior: "Nuestras instalaciones solares residenciales y comerciales en exteriores",
  interior: "Sistemas de energía solar y equipos instalados en interiores",
  nosotros: "Conoce a nuestro equipo de profesionales"
}

export default function GaleriaPage() {
  const [activeCategory, setActiveCategory] = useState<keyof GalleryImages>("exterior")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [isZoomed, setIsZoomed] = useState(false)

  const currentImages = galleryData[activeCategory]

  useEffect(() => {
    setCurrentImageIndex(0)
  }, [activeCategory])

  useEffect(() => {
    if (!isAutoPlay) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === currentImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 4000)

    return () => clearInterval(interval)
  }, [currentImages.length, isAutoPlay])

  // Handle keyboard events for zoom modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isZoomed) {
        setIsZoomed(false)
      }
    }

    if (isZoomed) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isZoomed])

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === currentImages.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? currentImages.length - 1 : prevIndex - 1
    )
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white pt-36 pb-16 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-100/30"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-tr from-blue-200/30 to-transparent rounded-full blur-2xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Galería de Proyectos
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Descubre nuestros proyectos de energía solar, instalaciones y conoce a nuestro equipo profesional
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {Object.keys(galleryData).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category as keyof GalleryImages)}
              className={`
                px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105
                ${activeCategory === category 
                  ? "bg-secondary-gradient text-white shadow-lg" 
                  : "bg-white text-gray-700 border border-gray-200 hover:border-primary hover:text-primary"
                }
              `}
            >
              {categoryTitles[category as keyof typeof categoryTitles]}
              <Badge className="ml-2 bg-primary/10 text-primary">
                {galleryData[category as keyof GalleryImages].length}
              </Badge>
            </button>
          ))}
        </div>

        {/* Category Description */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary mb-2">
            {categoryTitles[activeCategory]}
          </h2>
          <p className="text-gray-600">
            {categoryDescriptions[activeCategory]}
          </p>
        </div>

        {/* Main Gallery Display */}
        <div className="mb-8">
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Main Image */}
            <div className="relative h-96 md:h-[500px] lg:h-[600px] bg-gray-100 flex items-center justify-center">
              <img
                src={currentImages[currentImageIndex]}
                alt={`${categoryTitles[activeCategory]} - Imagen ${currentImageIndex + 1}`}
                className="object-contain transition-all duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
              
              {/* Zoom Button */}
              <button
                onClick={() => setIsZoomed(true)}
                className="absolute top-4 left-4 bg-white/80 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all duration-300 z-10"
              >
                <ZoomIn size={20} />
              </button>
              
              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              >
                <ChevronRight size={24} />
              </button>

              {/* Auto-play Control */}
              <button
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all duration-300"
              >
                {isAutoPlay ? <Pause size={20} /> : <Play size={20} />}
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-4 py-2 rounded-full">
                {currentImageIndex + 1} / {currentImages.length}
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Gallery */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 mb-8">
          {currentImages.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`
                relative aspect-square rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105
                ${index === currentImageIndex 
                  ? "ring-4 ring-primary shadow-lg" 
                  : "hover:ring-2 hover:ring-primary/50"
                }
              `}
            >
              <img
                src={image}
                alt={`Miniatura ${index + 1}`}
                className="object-cover"
              />
              {index === currentImageIndex && (
                <div className="absolute inset-0 bg-primary/20" />
              )}
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div 
            className="bg-secondary-gradient h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentImageIndex + 1) / currentImages.length) * 100}%` }}
          />
        </div>

        {/* Auto-play Status */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
            {isAutoPlay ? (
              <>
                <Play size={16} className="text-green-600" />
                <span className="text-sm text-gray-700">Reproducción automática activa</span>
              </>
            ) : (
              <>
                <Pause size={16} className="text-gray-600" />
                <span className="text-sm text-gray-700">Reproducción automática pausada</span>
              </>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={currentImages[currentImageIndex]}
              alt={`${categoryTitles[activeCategory]} - Imagen ${currentImageIndex + 1}`}
              className="object-contain"
            />
            
            {/* Close Button */}
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
            >
              <X size={24} />
            </button>

            {/* Navigation in Modal */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
            >
              <ChevronRight size={24} />
            </button>

            {/* Image Counter in Modal */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
              {currentImageIndex + 1} / {currentImages.length}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
