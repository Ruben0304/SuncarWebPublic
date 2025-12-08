"use client"

import dynamic from "next/dynamic"
import Navigation from "@/components/navigation"
import NavigationChristmas from "@/components/navigation-christmas"
import Footer from "@/components/footer"
import FooterChristmas from "@/components/footer-christmas"
import React, { useEffect, useState } from "react"
import { useTypewriter } from "@/hooks/useTypewriter"
import { useLoadingContext } from "@/hooks/useLoadingContext"
import { ScrollProgress } from "@/components/ui/scroll-progress"
import { isChristmasSeason } from "@/lib/christmas-utils"

// Import landing sections
import HeroSection from "@/components/landing-sections/hero-section"
import HeroSectionChristmas from "@/components/landing-sections/hero-section-christmas"
import ChristmasInstagramSection from "@/components/landing-sections/christmas-instagram-section"
import TrustedPartnersSection from "@/components/landing-sections/trusted-partners-section"
import ServicesSection from "@/components/landing-sections/services-section"
import FelicityPartnershipSection from "@/components/landing-sections/felicity-partnership-section"
import BrandsSection from "@/components/landing-sections/brands-section"
import QuickContactSection from "@/components/landing-sections/quick-contact-section"

const SuncarInteractiveGame = dynamic(() => import("@/components/SuncarInteractiveGame"), {
  ssr: false,
  loading: () => (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-3xl bg-white/5" />
      </div>
    </section>
  )
})

export default function HomePage() {
  const [count, setCount] = useState(0)
  const [isChristmas, setIsChristmas] = useState(false)
  const { isLoadingComplete } = useLoadingContext()

  // Check if it's Christmas season
  useEffect(() => {
    setIsChristmas(isChristmasSeason())
  }, [])

  // Typewriter effects sincronizados con el loader
  const blueText = useTypewriter({
    text: "Energía Solar",
    speed: 120,
    delay: 300, // Inicia casi inmediatamente después del loader
    waitForLoading: true,
    isLoadingComplete
  })

  const orangeText = useTypewriter({
    text: "Para Tu Futuro",
    speed: 120,
    delay: blueText.isComplete ? 200 : 999999,
    waitForLoading: false, // No necesita esperar al loader ya que depende del blueText
    isLoadingComplete: true
  })

  useEffect(() => {
    // Solo iniciar el contador cuando el loading haya terminado y el typewriter esté completo
    if (!isLoadingComplete || !orangeText.isComplete) return

    const startDelay = setTimeout(() => {
      let start = 0
      const end = 1200
      const incrementTime = 20 // ms
      const step = Math.ceil(end / 100) // velocidad

      const timer = setInterval(() => {
        start += step
        if (start >= end) {
          start = end
          clearInterval(timer)
        }
        setCount(start)
      }, incrementTime)

      return () => clearInterval(timer)
    }, 500) // Pequeño delay después de que termine el typewriter

    return () => clearTimeout(startDelay)
  }, [isLoadingComplete, orangeText.isComplete])

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Conditional Navigation - Christmas or Regular */}
      {isChristmas ? <NavigationChristmas /> : <Navigation />}
      <ScrollProgress />

      {/* Hero Section - Christmas or Regular */}
      {isChristmas ? (
        <HeroSectionChristmas blueText={blueText} orangeText={orangeText} />
      ) : (
        <HeroSection blueText={blueText} orangeText={orangeText} />
      )}

      {/* Christmas Instagram Section - Only during Christmas season */}
      {isChristmas && <ChristmasInstagramSection />}

      {/* Trusted Partners Section */}
      <TrustedPartnersSection />

      {/* Services Section */}
      <ServicesSection />

      {/* Felicity Solar Partnership Section */}
      <FelicityPartnershipSection />

      {/* Brands We Sell Section */}
      <BrandsSection />

      {/* Interactive Suncar Game Section */}
      <SuncarInteractiveGame />

      {/* Quick Contact Section */}
      <QuickContactSection />

      {/* Footer - Christmas or Regular */}
      {isChristmas ? <FooterChristmas /> : <Footer />}
    </div>
  )
}
