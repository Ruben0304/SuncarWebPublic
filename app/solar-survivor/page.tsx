"use client"

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Zap,
  Download,
  Battery,
  Lightbulb,
  Wind,
  Droplet,
  Wifi,
  Users,
  Star,
  Trophy,
  Target,
  Gauge,
  Home,
  Sun,
  Moon,
  AlertTriangle,
  ChevronDown,
  Play,
  ArrowLeft
} from 'lucide-react'

export default function SolarSurvivorPage() {
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    setTimeout(() => setIsVisible(true), 100)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const downloadAPK = () => {
    const apkUrl = 'https://s3.suncarsrl.com/files/Solar%20Survivor.apk'
    window.open(apkUrl, '_blank')
  }

  // Predefined particle positions to avoid hydration mismatch
  const particles = [
    { left: 10, top: 20, size: 2, delay: 0, duration: 20 },
    { left: 25, top: 15, size: 3, delay: 1, duration: 22 },
    { left: 45, top: 30, size: 1, delay: 2, duration: 18 },
    { left: 60, top: 10, size: 2, delay: 3, duration: 25 },
    { left: 75, top: 40, size: 3, delay: 0.5, duration: 21 },
    { left: 15, top: 60, size: 2, delay: 1.5, duration: 19 },
    { left: 35, top: 70, size: 1, delay: 2.5, duration: 23 },
    { left: 55, top: 55, size: 3, delay: 3.5, duration: 20 },
    { left: 80, top: 65, size: 2, delay: 4, duration: 24 },
    { left: 20, top: 85, size: 1, delay: 0.8, duration: 22 },
    { left: 50, top: 90, size: 2, delay: 1.8, duration: 19 },
    { left: 70, top: 80, size: 3, delay: 2.8, duration: 21 },
    { left: 90, top: 25, size: 2, delay: 3.8, duration: 23 },
    { left: 5, top: 45, size: 1, delay: 4.5, duration: 18 },
    { left: 85, top: 50, size: 3, delay: 1.2, duration: 25 },
    { left: 30, top: 5, size: 2, delay: 2.2, duration: 20 },
    { left: 65, top: 35, size: 1, delay: 3.2, duration: 22 },
    { left: 40, top: 95, size: 2, delay: 4.2, duration: 19 },
    { left: 95, top: 75, size: 3, delay: 0.3, duration: 24 },
    { left: 12, top: 50, size: 2, delay: 1.3, duration: 21 }
  ]

  // Predefined CTA particles
  const ctaParticles = [
    { left: 15, top: 20, delay: 0 },
    { left: 35, top: 15, delay: 0.5 },
    { left: 55, top: 25, delay: 1 },
    { left: 75, top: 18, delay: 1.5 },
    { left: 25, top: 45, delay: 2 },
    { left: 45, top: 50, delay: 2.5 },
    { left: 65, top: 55, delay: 0.3 },
    { left: 85, top: 48, delay: 0.8 },
    { left: 10, top: 70, delay: 1.3 },
    { left: 30, top: 75, delay: 1.8 },
    { left: 50, top: 80, delay: 2.3 },
    { left: 70, top: 72, delay: 2.8 },
    { left: 90, top: 78, delay: 0.6 },
    { left: 20, top: 35, delay: 1.1 },
    { left: 80, top: 90, delay: 1.6 }
  ]

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Animated Background with Gradient */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-black transition-opacity duration-1000"
          style={{ opacity: 1 - scrollY / 1000 }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-tr from-orange-900/30 via-transparent to-yellow-900/30"
          style={{ opacity: Math.min(1, scrollY / 500) }}
        />

        {/* Subtle animated particles */}
        <div className="absolute inset-0 opacity-40">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20 animate-float-particle"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`
              }}
            />
          ))}
        </div>

        {/* Gradient orbs */}
        <div
          className="absolute top-20 right-20 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl transition-opacity duration-1000"
          style={{ opacity: 0.5 - scrollY / 2000 }}
        />
        <div
          className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl transition-opacity duration-1000"
          style={{ opacity: Math.min(0.5, scrollY / 1000) }}
        />
      </div>

      {/* Back to Home Button */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-white/20 transition-all duration-300 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-semibold">Volver</span>
      </Link>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative min-h-screen flex items-center justify-center px-4 py-20"
        >
          <div
            className={`container mx-auto text-center transition-all duration-1500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
            }`}
          >
            {/* Logo */}
            <div
              className="relative mb-12 transition-all duration-700"
              style={{
                transform: `translateY(${scrollY * 0.15}px) scale(${1 - scrollY / 3000})`,
                opacity: 1 - scrollY / 800
              }}
            >
              <div className="relative w-64 h-64 md:w-96 md:h-96 mx-auto">
                <Image
                  src="/images/logo-juego.png"
                  alt="Solar Survivor Logo"
                  fill
                  className="object-contain drop-shadow-2xl animate-float"
                  priority
                />

                {/* Elegant glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full blur-3xl animate-pulse" />
              </div>
            </div>

            {/* Title */}
            <div
              style={{
                transform: `translateY(${scrollY * 0.1}px)`,
                opacity: 1 - scrollY / 600
              }}
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 relative">
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 animate-gradient-x">
                  SOLAR SURVIVOR
                </span>
              </h1>

              <p className="text-xl md:text-3xl text-blue-200 mb-8 font-light tracking-wide animate-fade-in-up animation-delay-500">
                Sobrevive a los apagones. Domina la energía solar.
              </p>

              <p className="text-lg md:text-xl text-yellow-300/80 mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-1000">
                Un simulador de apagones donde cada decisión cuenta. Gestiona tus paneles solares,
                conecta electrodomésticos estratégicamente y mantén el confort de tu familia.
              </p>

              {/* Download Button */}
              <button
                onClick={downloadAPK}
                className="group relative px-12 py-6 bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600 text-white text-xl md:text-2xl font-bold rounded-2xl shadow-2xl hover:shadow-orange-500/50 transition-all duration-500 transform hover:scale-105 overflow-hidden animate-fade-in-up animation-delay-1500"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                <div className="relative flex items-center gap-4 z-10">
                  <Download className="w-8 h-8 group-hover:animate-bounce" />
                  <span>Descargar APK</span>
                  <Zap className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                </div>
              </button>
            </div>

            {/* Scroll Indicator */}
            <div
              className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce transition-opacity duration-500"
              style={{ opacity: 1 - scrollY / 300 }}
            >
              <ChevronDown className="w-8 h-8 text-white/50" />
            </div>
          </div>
        </section>

        {/* Features Section with Scroll Reveal */}
        <section className="relative py-32 px-4">
          <div className="container mx-auto">
            <div
              className="transition-all duration-1000"
              style={{
                transform: `translateY(${Math.max(0, 100 - scrollY * 0.3)}px)`,
                opacity: Math.min(1, (scrollY - 200) / 400)
              }}
            >
              <h2 className="text-4xl md:text-6xl font-black text-center mb-20 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Características del Juego
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {[
                {
                  icon: <AlertTriangle className="w-12 h-12" />,
                  title: "Simulador de Apagones",
                  description: "Enfrenta situaciones reales de cortes eléctricos y toma decisiones críticas para mantener tu hogar funcionando.",
                  color: "from-red-500 to-orange-500",
                  delay: 0
                },
                {
                  icon: <Sun className="w-12 h-12" />,
                  title: "Gestión Solar",
                  description: "Administra tus paneles solares y baterías. Decide cuándo almacenar energía y cuándo usarla estratégicamente.",
                  color: "from-yellow-400 to-orange-400",
                  delay: 100
                },
                {
                  icon: <Lightbulb className="w-12 h-12" />,
                  title: "Electrodomésticos Estratégicos",
                  description: "Decide qué equipos conectar: refrigerador, ventilador, internet, televisión. Cada uno afecta tu energía y confort.",
                  color: "from-blue-400 to-cyan-400",
                  delay: 200
                },
                {
                  icon: <Gauge className="w-12 h-12" />,
                  title: "Medidor de Confort",
                  description: "Mantén el balance perfecto entre higiene, alimentación, entretenimiento y bienestar familiar.",
                  color: "from-green-400 to-emerald-400",
                  delay: 300
                },
                {
                  icon: <Trophy className="w-12 h-12" />,
                  title: "Sistema de Puntuación",
                  description: "Gana puntos por decisiones inteligentes. Compite por el mejor puntaje y desbloquea logros épicos.",
                  color: "from-purple-400 to-pink-400",
                  delay: 400
                },
                {
                  icon: <Target className="w-12 h-12" />,
                  title: "Situaciones Difíciles",
                  description: "Enfrenta escenarios desafiantes: días nublados, averías, emergencias familiares. ¿Podrás sobrevivir?",
                  color: "from-indigo-400 to-blue-400",
                  delay: 500
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group relative bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-white/30 transition-all duration-700 hover:scale-105 hover:-translate-y-2"
                  style={{
                    transform: `translateY(${Math.max(0, 150 - (scrollY - 400) * 0.2 - index * 10)}px)`,
                    opacity: Math.min(1, (scrollY - 400 - index * 50) / 300),
                    transitionDelay: `${feature.delay}ms`
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-700 blur-xl`} />

                  <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-500`}>
                    {feature.icon}
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-blue-200/80 leading-relaxed">{feature.description}</p>

                  <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-white/5 rounded-tr-2xl transition-colors duration-500 group-hover:border-white/20" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-white/5 rounded-bl-2xl transition-colors duration-500 group-hover:border-white/20" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comfort Metrics Section */}
        <section className="relative py-32 px-4 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent">
          <div className="container mx-auto">
            <div
              className="transition-all duration-1000"
              style={{
                transform: `translateY(${Math.max(0, 100 - (scrollY - 1200) * 0.3)}px)`,
                opacity: Math.min(1, (scrollY - 1200) / 400)
              }}
            >
              <h2 className="text-4xl md:text-6xl font-black text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                Sistema de Confort
              </h2>

              <p className="text-xl text-center text-blue-200 mb-20 max-w-3xl mx-auto">
                Mantén el equilibrio perfecto en estos aspectos vitales para sobrevivir
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                { icon: <Droplet className="w-10 h-10" />, label: "Higiene", color: "from-blue-400 to-cyan-400", value: 85 },
                { icon: <Home className="w-10 h-10" />, label: "Alimentos", color: "from-orange-400 to-red-400", value: 92 },
                { icon: <Wifi className="w-10 h-10" />, label: "Internet", color: "from-purple-400 to-pink-400", value: 78 },
                { icon: <Users className="w-10 h-10" />, label: "Familia", color: "from-yellow-400 to-orange-400", value: 88 }
              ].map((metric, index) => (
                <div
                  key={index}
                  className="relative group transition-all duration-700"
                  style={{
                    transform: `translateY(${Math.max(0, 80 - (scrollY - 1500) * 0.15 - index * 10)}px) scale(${Math.min(1, (scrollY - 1500 + index * 50) / 300)})`,
                    opacity: Math.min(1, (scrollY - 1500 + index * 50) / 300)
                  }}
                >
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-white/30 transition-all duration-700 text-center hover:scale-110 hover:-translate-y-2">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${metric.color} flex items-center justify-center mx-auto mb-4 text-white group-hover:rotate-12 transition-transform duration-500`}>
                      {metric.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{metric.label}</h3>

                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-4">
                      <div
                        className={`h-full bg-gradient-to-r ${metric.color} transition-all duration-1000`}
                        style={{
                          width: `${Math.min(metric.value, (scrollY - 1600) / 10)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-blue-200 mt-2">{metric.value}% óptimo</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gameplay Section */}
        <section className="relative py-32 px-4">
          <div className="container mx-auto max-w-6xl">
            <div
              className="transition-all duration-1000"
              style={{
                transform: `translateY(${Math.max(0, 100 - (scrollY - 2200) * 0.3)}px)`,
                opacity: Math.min(1, (scrollY - 2200) / 400)
              }}
            >
              <h2 className="text-4xl md:text-6xl font-black text-center mb-20 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500">
                Jugabilidad Épica
              </h2>
            </div>

            <div className="space-y-32">
              {/* Day/Night Cycle */}
              <div
                className="grid md:grid-cols-2 gap-12 items-center transition-all duration-1000"
                style={{
                  transform: `translateX(${Math.max(-100, -100 + (scrollY - 2400) * 0.2)}px)`,
                  opacity: Math.min(1, (scrollY - 2400) / 400)
                }}
              >
                <div>
                  <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-4">
                    <Sun className="w-10 h-10 text-yellow-400" />
                    Ciclo Día/Noche
                  </h3>
                  <p className="text-lg text-blue-200 leading-relaxed mb-6">
                    Durante el día, tus paneles solares generan energía que puedes usar inmediatamente o almacenar en baterías.
                    Cuando cae la noche o hay un apagón, dependerás de tu energía almacenada.
                  </p>
                  <div className="flex gap-4">
                    <div className="flex-1 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-4 text-white transform hover:scale-105 transition-transform duration-500">
                      <Sun className="w-8 h-8 mb-2" />
                      <div className="text-sm font-semibold">Día</div>
                      <div className="text-xs opacity-80">Generar energía</div>
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl p-4 text-white transform hover:scale-105 transition-transform duration-500">
                      <Moon className="w-8 h-8 mb-2" />
                      <div className="text-sm font-semibold">Noche</div>
                      <div className="text-xs opacity-80">Usar baterías</div>
                    </div>
                  </div>
                </div>

                <div className="relative h-80 bg-gradient-to-b from-yellow-400/10 to-blue-900/10 rounded-2xl overflow-hidden border border-white/10">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-40 h-40">
                      <Sun className="absolute inset-0 w-full h-full text-yellow-400/50 animate-spin-slow" />
                      <Moon className="absolute inset-0 w-full h-full text-blue-300/50 animate-spin-reverse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Appliances Management */}
              <div
                className="grid md:grid-cols-2 gap-12 items-center transition-all duration-1000"
                style={{
                  transform: `translateX(${Math.min(100, 100 - (scrollY - 2800) * 0.2)}px)`,
                  opacity: Math.min(1, (scrollY - 2800) / 400)
                }}
              >
                <div className="order-2 md:order-1 relative h-80 bg-gradient-to-br from-blue-900/10 to-purple-900/10 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-4 p-8">
                    {[Lightbulb, Wind, Battery].map((Icon, i) => (
                      <div
                        key={i}
                        className="w-20 h-20 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer group border border-white/10 hover:border-white/30"
                        style={{
                          transform: `scale(${Math.min(1, (scrollY - 2900 - i * 100) / 200)})`,
                          opacity: Math.min(1, (scrollY - 2900 - i * 100) / 200)
                        }}
                      >
                        <Icon className="w-10 h-10 text-blue-400 group-hover:scale-125 transition-transform duration-500" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-1 md:order-2">
                  <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-4">
                    <Battery className="w-10 h-10 text-green-400" />
                    Gestión de Equipos
                  </h3>
                  <p className="text-lg text-blue-200 leading-relaxed mb-6">
                    Conecta y desconecta electrodomésticos según tu energía disponible.
                    ¿Priorizas el refrigerador para conservar alimentos o el ventilador para mantener el confort?
                    Cada decisión tiene consecuencias.
                  </p>
                  <div className="space-y-2">
                    {['Refrigerador', 'Ventilador', 'Router WiFi', 'Televisión'].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10 hover:border-white/30 transition-all duration-500 hover:translate-x-2"
                        style={{
                          transform: `translateX(${Math.max(-50, -50 + (scrollY - 3000 - i * 50) * 0.1)}px)`,
                          opacity: Math.min(1, (scrollY - 3000 - i * 50) / 200)
                        }}
                      >
                        <span className="text-white font-semibold">{item}</span>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 text-sm">{50 + i * 30}W</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-32 px-4">
          <div
            className="container mx-auto max-w-4xl text-center transition-all duration-1000"
            style={{
              transform: `scale(${Math.min(1, (scrollY - 3400) / 400)})`,
              opacity: Math.min(1, (scrollY - 3400) / 400)
            }}
          >
            <div className="relative bg-gradient-to-br from-orange-600/20 via-yellow-600/20 to-orange-600/20 backdrop-blur-xl rounded-3xl p-12 border border-orange-500/30 overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                {ctaParticles.map((particle, i) => (
                  <Zap
                    key={i}
                    className="absolute text-yellow-400 animate-float-particle"
                    style={{
                      left: `${particle.left}%`,
                      top: `${particle.top}%`,
                      animationDelay: `${particle.delay}s`,
                      width: '20px',
                      height: '20px'
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10">
                <Star className="w-20 h-20 text-yellow-400 mx-auto mb-6 animate-spin-slow" />

                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  ¿Listo para el Desafío?
                </h2>

                <p className="text-xl text-blue-100 mb-10">
                  Descarga Solar Survivor ahora y demuestra que puedes sobrevivir
                  a cualquier apagón con energía solar inteligente.
                </p>

                <button
                  onClick={downloadAPK}
                  className="group relative px-16 py-7 bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600 text-white text-2xl font-black rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all duration-500 transform hover:scale-110 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                  <div className="relative flex items-center gap-4 z-10">
                    <Download className="w-10 h-10 group-hover:animate-bounce" />
                    <span>DESCARGAR AHORA</span>
                    <Play className="w-10 h-10 group-hover:scale-125 transition-transform" />
                  </div>
                </button>

                <p className="text-sm text-blue-200/60 mt-6">
                  Compatible con Android 5.0 o superior • Tamaño: ~50MB
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Spacer for smooth ending */}
        <div className="h-32"></div>
      </div>
    </div>
  )
}
