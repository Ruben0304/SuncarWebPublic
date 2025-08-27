"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import Link from "next/link"
import AOS from "aos"

export default function TestimonialsPage() {
  const [currentVideo, setCurrentVideo] = useState(0)

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    })
  }, [])

  const videoTestimonials = [
    {
      id: 1,
      name: "María González",
      category: "Hogar",
      videoUrl: "https://www.youtube.com/watch?v=wRpDhmVns5w&pp=ygUTcHJvYmFuZG8gdGVzdCB2aWRlbw%3D%3D",
      thumbnail: "/images/testimonial-1.jpg"
    },
    {
      id: 2,
      name: "Carlos Mendoza",
      category: "Hogar",
      videoUrl: "https://www.youtube.com/watch?v=wRpDhmVns5w&pp=ygUTcHJvYmFuZG8gdGVzdCB2aWRlbw%3D%3D",
      thumbnail: "/images/testimonial-2.jpg"
    },
    {
      id: 3,
      name: "Ana Rodríguez",
      category: "Hogar",
      videoUrl: "https://www.youtube.com/watch?v=wRpDhmVns5w&pp=ygUTcHJvYmFuZG8gdGVzdCB2aWRlbw%3D%3D",
      thumbnail: "/images/testimonial-3.jpg"
    },
    {
      id: 4,
      name: "Roberto Pérez",
      category: "Empresa",
      videoUrl: "https://www.youtube.com/watch?v=wRpDhmVns5w&pp=ygUTcHJvYmFuZG8gdGVzdCB2aWRlbw%3D%3D",
      thumbnail: "/images/testimonial-4.jpg"
    },
    {
      id: 5,
      name: "Luisa Fernández",
      category: "Hogar",
      videoUrl: "https://www.youtube.com/watch?v=wRpDhmVns5w&pp=ygUTcHJvYmFuZG8gdGVzdCB2aWRlbw%3D%3D",
      thumbnail: "/images/testimonial-5.jpg"
    },
    {
      id: 6,
      name: "José Martínez",
      category: "Hogar",
      videoUrl: "https://www.youtube.com/watch?v=wRpDhmVns5w&pp=ygUTcHJvYmFuZG8gdGVzdCB2aWRlbw%3D%3D",
      thumbnail: "/images/testimonial-6.jpg"
    }
  ]

  const nextVideo = () => {
    setCurrentVideo((prev) => (prev + 1) % videoTestimonials.length)
  }

  const prevVideo = () => {
    setCurrentVideo((prev) => (prev - 1 + videoTestimonials.length) % videoTestimonials.length)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-24 bg-gradient-to-br from-primary to-blue-800 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center text-white space-y-6" style={{ marginTop: '100px' }}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="block animate-fade-in-up">Lo Que Dicen</span>
              <span className="block bg-secondary-gradient bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
                Nuestros Clientes
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
              Historias reales de familias cubanas que han transformado sus hogares con energía solar y han logrado independencia energética
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-white/30 rounded-full animate-bounce animation-delay-1000"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-white/20 rounded-full animate-bounce animation-delay-1200"></div>
        <div className="absolute bottom-40 left-20 w-1 h-1 bg-white/40 rounded-full animate-bounce animation-delay-800"></div>
      </section>

      {/* Video Testimonials Slider */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Testimonios en Video
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto" data-aos="fade-up" data-aos-delay="200">
            {/* Video Container */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-all duration-500">
              <div className="relative">
                <video
                  key={videoTestimonials[currentVideo].id}
                  className="w-full aspect-video object-cover"
                  poster={videoTestimonials[currentVideo].thumbnail}
                  controls
                  autoPlay={false}
                  preload="metadata"
                >
                  <source src={videoTestimonials[currentVideo].videoUrl} type="video/mp4" />
                  Tu navegador no soporta la reproducción de video.
                </video>

                {/* Category Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${
                    videoTestimonials[currentVideo].category === 'Empresa' 
                      ? 'bg-green-500/90 text-white' 
                      : 'bg-blue-500/90 text-white'
                  }`}>
                    {videoTestimonials[currentVideo].category}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-8">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-16 h-16 bg-secondary-gradient rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {videoTestimonials[currentVideo].name.charAt(0)}
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-primary text-2xl">{videoTestimonials[currentVideo].name}</div>
                    <div className="text-lg text-gray-600">{videoTestimonials[currentVideo].category}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevVideo}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-primary shadow-xl hover:bg-white hover:scale-110 transition-all duration-300 z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            <button
              onClick={nextVideo}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-primary shadow-xl hover:bg-white hover:scale-110 transition-all duration-300 z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-3 mt-8">
              {videoTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentVideo(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentVideo === index 
                      ? 'bg-primary scale-125' 
                      : 'bg-gray-300 hover:bg-primary/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-primary">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              ¿Quieres Ser Nuestro Próximo Cliente Satisfecho?
            </h2>
            <p className="text-lg text-blue-100">
              Únete a cientos de familias cubanas que ya disfrutan de los beneficios de la energía solar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cotizacion">
                <button className="px-8 py-4 bg-secondary-gradient text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Solicitar Cotización
                </button>
              </Link>
              <Link href="/servicios">
                <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary transition-all duration-300">
                  Ver Servicios
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}