"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Star, MapPin, Zap, Battery, Calendar, ArrowRight, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from "next/image";
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

interface Project {
  id: number;
  title: string;
  location: string;
  type: string;
  capacity: string;
  savings: string;
  date: string;
  investment: string;
  payback: string;
  images: string[];
  description: string;
  features: string[];
  testimonial: {
    text: string;
    author: string;
    rating: number;
  };
}

const ProjectsPage = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const projects: Project[] = [
    {
      id: 1,
      title: "Residencia Familiar González",
      location: "La Habana, Cuba",
      type: "Residencial",
      capacity: "8.5 kW",
      savings: "85%",
      date: "Marzo 2024",
      investment: "$12,500",
      payback: "3.2 años",
      images: [
        "/images/projects/1.jpg",
        "/images/projects/1.jpg",
        "/images/projects/1.jpg"
      ],
      description: "Instalación completa de sistema solar residencial con 24 paneles monocristalinos y sistema de baterías inteligentes. Reducción del 85% en costos eléctricos.",
      features: [
        "24 Paneles Monocristalinos 350W",
        "Sistema de Baterías Litio 20kWh",
        "Inversor Híbrido 8kW",
        "Monitoreo Inteligente 24/7"
      ],
      testimonial: {
        text: "Excelente servicio. Los paneles solares han reducido mi factura eléctrica en un 80%. El equipo de Suncar fue muy profesional.",
        author: "María González",
        rating: 5
      }
    },
    {
      id: 2,
      title: "Casa Mendoza",
      location: "Santiago de Cuba, Cuba",
      type: "Residencial",
      capacity: "6.2 kW",
      savings: "78%",
      date: "Febrero 2024",
      investment: "$9,800",
      payback: "2.8 años",
      images: [
        "/images/projects/2.jpg",
        "/images/projects/2.jpg",
        "/images/projects/2.jpg"
      ],
      description: "Proyecto de energía solar para hogar de tamaño medio con enfoque en eficiencia energética y sostenibilidad ambiental.",
      features: [
        "18 Paneles Policristalinos 340W",
        "Sistema de Baterías 15kWh",
        "Inversor Grid-Tie 6kW",
        "App de Monitoreo Móvil"
      ],
      testimonial: {
        text: "La instalación fue rápida y eficiente. Ya llevo 6 meses ahorrando significativamente en electricidad.",
        author: "Carlos Mendoza",
        rating: 5
      }
    },
    {
      id: 3,
      title: "Hogar Rodríguez",
      location: "Camagüey, Cuba",
      type: "Residencial",
      capacity: "10.5 kW",
      savings: "92%",
      date: "Enero 2024",
      investment: "$15,200",
      payback: "3.5 años",
      images: [
        "/images/projects/3.png",
        "/images/projects/3.png",
        "/images/projects/3.png"
      ],
      description: "Instalación solar de alta capacidad con sistema de almacenamiento avanzado para independencia energética total.",
      features: [
        "30 Paneles Monocristalinos 350W",
        "Sistema de Baterías 25kWh",
        "Inversor Híbrido 10kW",
        "Sistema de Respaldo Automático"
      ],
      testimonial: {
        text: "Suncar cumplió todas sus promesas. El sistema funciona perfectamente y el soporte técnico es excepcional.",
        author: "Ana Rodríguez",
        rating: 5
      }
    },
    {
      id: 4,
      title: "Casa Fernández",
      location: "Playa, Cuba",
      type: "Residencial Plus",
      capacity: "12.0 kW",
      savings: "88%",
      date: "Diciembre 2023",
      investment: "$17,800",
      payback: "3.8 años",
      images: [
        "/images/projects/4.jpg",
        "/images/projects/4.jpg",
        "/images/projects/4.jpg"
      ],
      description: "Proyecto premium con paneles de última generación y sistema de automatización domótica integrada.",
      features: [
        "34 Paneles Bifaciales 365W",
        "Sistema de Baterías 30kWh",
        "Inversor Inteligente 12kW",
        "Integración Domótica"
      ],
      testimonial: {
        text: "La inversión más inteligente que hemos hecho. El sistema es impresionante y muy eficiente.",
        author: "Roberto Martínez",
        rating: 5
      }
    },
    {
      id: 5,
      title: "Residencia López",
      location: "Holguín, Cuba",
      type: "Residencial",
      capacity: "7.8 kW",
      savings: "81%",
      date: "Noviembre 2023",
      investment: "$11,500",
      payback: "3.1 años",
      images: [
        "/images/projects/5.jpg",
        "/images/projects/5.jpg",
        "/images/projects/5.jpg"
      ],
      description: "Instalación solar optimizada para maximizar el aprovechamiento de espacios reducidos con alta eficiencia.",
      features: [
        "22 Paneles Monocristalinos 355W",
        "Sistema de Baterías 18kWh",
        "Inversor MPPT 8kW",
        "Optimizadores de Potencia"
      ],
      testimonial: {
        text: "Increíble cómo transformaron nuestro hogar. Ahora tenemos energía limpia y barata.",
        author: "Isabel López",
        rating: 5
      }
    },
    {
      id: 6,
      title: "Villa Martínez",
      location: "Cienfuegos, Cuba",
      type: "Residencial",
      capacity: "9.2 kW",
      savings: "87%",
      date: "Octubre 2023",
      investment: "$13,200",
      payback: "3.3 años",
      images: [
        "/images/projects/6.jpg",
        "/images/projects/6.jpg",
        "/images/projects/6.jpg"
      ],
      description: "Proyecto solar con enfoque en sustentabilidad y reducción de huella de carbono familiar.",
      features: [
        "26 Paneles Monocristalinos 350W",
        "Sistema de Baterías 22kWh",
        "Inversor Híbrido 9kW",
        "Medidor Bidireccional"
      ],
      testimonial: {
        text: "Estamos muy contentos con el resultado. La calidad del trabajo es excelente.",
        author: "Jorge Fernández",
        rating: 5
      }
    }
  ];

  const stats = [
    { value: "500+", label: "Proyectos Completados", icon: "🏠" },
    { value: "50MW+", label: "Capacidad Instalada", icon: "⚡" },
    { value: "85%", label: "Ahorro Promedio", icon: "💰" },
    { value: "98%", label: "Satisfacción Cliente", icon: "⭐" }
  ];

  useEffect(() => {
    if (isPlaying && selectedProject) {
      intervalRef.current = window.setInterval(() => {
        setCurrentImageIndex((prev) => 
          prev === selectedProject.images.length - 1 ? 0 : prev + 1
        );
      }, 3000);
    } else {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, selectedProject]);

  const nextImage = () => {
    if (!selectedProject) return;
    setCurrentImageIndex((prev) => 
      prev === selectedProject.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!selectedProject) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? selectedProject.images.length - 1 : prev - 1
    );
  };

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
    setIsPlaying(false);
  };

  const closeProject = () => {
    setSelectedProject(null);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary to-blue-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Animated background elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* <div className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-semibold rounded-full mb-6 transform hover:scale-105 transition-transform duration-300">
              Nuestros Proyectos
            </div> */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-loose" style={{ marginTop: '100px' }}>
              <span className="inline-block animate-fade-in-up">Transformando</span>{" "}
              <span className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
                Hogares Cubanos
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 animate-fade-in-up animation-delay-400">
              Descubre cómo hemos ayudado a más de 500 familias a alcanzar la independencia energética
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in-up animation-delay-600">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 opacity-100 animate-none">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-blue-100 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Projects Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Proyectos Destacados
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cada proyecto es único y está diseñado para maximizar el ahorro energético
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer"
                onClick={() => openProject(project)}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden">
                  <Image
                    src={project.images[0]}
                    alt={project.title}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index < 3}
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {project.type}
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-blue-900 px-3 py-1 rounded-full text-sm font-semibold">
                    {project.capacity}
                  </div>
                  {/* Animaciones eliminadas, solo overlays y badges */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                    <MapPin className="w-4 h-4" />
                    {project.location}
                  </div>
                  
                  <h3 className="text-xl font-bold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{project.savings}</div>
                        <div className="text-xs text-gray-500">Ahorro</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{project.payback}</div>
                        <div className="text-xs text-gray-500">Retorno</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                      <span className="text-sm font-semibold mr-2">Ver más</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="relative">
              <button
                onClick={closeProject}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                ×
              </button>

              {/* Image Carousel */}
              <div className="relative h-64 md:h-80 bg-gray-200 overflow-hidden">
                <Image
                  src={selectedProject.images[currentImageIndex]}
                  alt={selectedProject.title}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-30"></div>
                {/* Controles y dots abajo */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <button
                    onClick={prevImage}
                    className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    title="Imagen anterior"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    {selectedProject.images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={nextImage}
                    className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    title="Imagen siguiente"
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
              </div>

              <div className="p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      {selectedProject.location}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">
                      {selectedProject.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {selectedProject.description}
                    </p>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-blue-900">Características del Sistema:</h4>
                      {selectedProject.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedProject.capacity}</div>
                        <div className="text-sm text-gray-500">Capacidad</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedProject.savings}</div>
                        <div className="text-sm text-gray-500">Ahorro</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">{selectedProject.investment}</div>
                        <div className="text-sm text-gray-500">Inversión</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-orange-600">{selectedProject.payback}</div>
                        <div className="text-sm text-gray-500">Retorno</div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-3">Testimonio del Cliente</h4>
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(selectedProject.testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-700 italic mb-3">
                        "{selectedProject.testimonial.text}"
                      </p>
                      <div className="text-sm font-semibold text-blue-900">
                        - {selectedProject.testimonial.author}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Tu Hogar Será el Próximo?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a las más de 500 familias que ya disfrutan de energía solar limpia y económica
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Solicitar Cotización
            </button>
            <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300">
              Ver Más Proyectos
            </button>
          </div>
        </div>
      </section>
      <Footer />
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scale-in 0.4s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .animation-delay-600 {
          animation-delay: 600ms;
        }
        
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        
        .slow {
          animation-duration: 3s;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ProjectsPage;