"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw } from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import Link from "next/link"
import AOS from "aos"

export default function TestimonialsPage() {
  const [currentVideo, setCurrentVideo] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

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
      name: "Cliente Satisfecho Testimonio 1",
      videoUrl: "https://s3.suncarsrl.com/testimonios/T1.mp4",
      thumbnail: "/images/placeholder.jpg",
      description: "Experiencia real de instalación de paneles solares con SunCar"
    },
    {
      id: 2,
      name: "Cliente Satisfecho Testimonio 2", 
      videoUrl: "https://s3.suncarsrl.com/testimonios/T1.mp4",
      thumbnail: "/images/placeholder.jpg",
      description: "Testimonio de cliente satisfecho con su instalación de energía solar"
    }
  ]

  const nextVideo = () => {
    setCurrentVideo((prev) => (prev + 1) % videoTestimonials.length)
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const prevVideo = () => {
    setCurrentVideo((prev) => (prev - 1 + videoTestimonials.length) % videoTestimonials.length)
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
      setIsFullscreen(!isFullscreen)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const resetVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      setCurrentTime(0)
      setIsPlaying(false)
    }
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
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Escucha directamente de nuestros clientes satisfechos sobre su experiencia con SunCar
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto" data-aos="fade-up" data-aos-delay="200">
            {/* Video Container */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-all duration-500">
              <div className="relative group">
                <video
                  ref={videoRef}
                  key={videoTestimonials[currentVideo].id}
                  className="w-full aspect-video object-cover"
                  poster={videoTestimonials[currentVideo].thumbnail}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                >
                  <source src={videoTestimonials[currentVideo].videoUrl} type="video/mp4" />
                  Tu navegador no soporta la reproducción de video.
                </video>

                {/* Video Controls Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <button
                    onClick={togglePlay}
                    className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-primary shadow-xl hover:bg-white hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
                  >
                    {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
                  </button>
                </div>



                {/* Video Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4">
                  <div className="flex items-center gap-4 text-white">
                    <button
                      onClick={togglePlay}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    
                    <span className="text-sm font-mono min-w-[60px]">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                    
                    <button
                      onClick={toggleMute}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    
                    <button
                      onClick={resetVideo}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={toggleFullscreen}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-8">
                <div className="text-center space-y-4">
                                     <div className="flex items-center justify-center gap-4">
                     <div className="w-16 h-16 bg-secondary-gradient rounded-full flex items-center justify-center text-white font-bold text-xl">
                       {videoTestimonials[currentVideo].name.charAt(0)}
                     </div>
                     <div>
                       <div className="font-bold text-primary text-2xl">{videoTestimonials[currentVideo].name}</div>
                     </div>
                   </div>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    {videoTestimonials[currentVideo].description}
                  </p>
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

            {/* Video Counter */}
            <div className="text-center mt-4 text-gray-500">
              {currentVideo + 1} de {videoTestimonials.length} testimonios
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