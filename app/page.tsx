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
import LazySection from "@/components/LazySection"

import HeroSection from "@/components/landing-sections/hero-section"
import HeroSectionChristmas from "@/components/landing-sections/hero-section-christmas"
import ChristmasInstagramSection from "@/components/landing-sections/christmas-instagram-section"
import QuickContactSection from "@/components/landing-sections/quick-contact-section"
import KitsSection from "@/components/landing-sections/kits-section"
import ProductosSueltosSection from "@/components/landing-sections/productos-sueltos-section"

const TrustedPartnersSection = dynamic(() => import("@/components/landing-sections/trusted-partners-section"), {
  ssr: false,
  loading: () => null
})

const FelicityPartnershipSection = dynamic(() => import("@/components/landing-sections/felicity-partnership-section"), {
  ssr: false,
  loading: () => null
})

const BlackoutSection = dynamic(() => import("@/components/landing-sections/blackout-section"), {
  ssr: false,
  loading: () => null
})


export default function HomePage() {
  const [isChristmas, setIsChristmas] = useState(false)
  const { isLoadingComplete } = useLoadingContext()

  // Check if it's Christmas season
  useEffect(() => {
    setIsChristmas(isChristmasSeason())
  }, [])

  // Typewriter effects sincronizados con el loader
  const headlineLead = useTypewriter({
    text: "Energía",
    speed: 120,
    delay: 300,
    waitForLoading: true,
    isLoadingComplete
  })

  const headlineAccent = useTypewriter({
    text: "que transforma.",
    speed: 120,
    delay: headlineLead.isComplete ? 200 : 999999,
    waitForLoading: false,
    isLoadingComplete: true
  })

  return (
    <div className="min-h-screen bg-[#F2F2EF] overflow-x-hidden">
      {isChristmas ? <NavigationChristmas /> : <Navigation />}
      <ScrollProgress />

      {isChristmas ? (
        <HeroSectionChristmas headlineLead={headlineLead} headlineAccent={headlineAccent} />
      ) : (
        <HeroSection headlineLead={headlineLead} headlineAccent={headlineAccent} />
      )}

      {isChristmas && <ChristmasInstagramSection />}

      <LazySection minHeight={560} rootMargin="220px">
        <TrustedPartnersSection />
      </LazySection>

      {/* Sin LazySection: van en el HTML inicial y la foto trae su placeholder borroso */}
      <KitsSection />

      <ProductosSueltosSection />

      <LazySection minHeight={560} rootMargin="240px">
        <FelicityPartnershipSection />
      </LazySection>

      <LazySection minHeight={720} rootMargin="300px">
        <BlackoutSection />
      </LazySection>

      <QuickContactSection />

      {isChristmas ? <FooterChristmas /> : <Footer />}
    </div>
  )
}
