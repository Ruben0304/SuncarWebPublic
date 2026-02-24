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

const TrustedPartnersSection = dynamic(() => import("@/components/landing-sections/trusted-partners-section"), {
  ssr: false,
  loading: () => null
})

const ServicesSection = dynamic(() => import("@/components/landing-sections/services-section"), {
  ssr: false,
  loading: () => null
})

const FelicityPartnershipSection = dynamic(() => import("@/components/landing-sections/felicity-partnership-section"), {
  ssr: false,
  loading: () => null
})

const BrandsSection = dynamic(() => import("@/components/landing-sections/brands-section"), {
  ssr: false,
  loading: () => null
})

const BlackoutSection = dynamic(() => import("@/components/landing-sections/blackout-section"), {
  ssr: false,
  loading: () => null
})

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
    delay: 300,
    waitForLoading: true,
    isLoadingComplete
  })

  const orangeText = useTypewriter({
    text: "Para Tu Futuro",
    speed: 120,
    delay: blueText.isComplete ? 200 : 999999,
    waitForLoading: false,
    isLoadingComplete: true
  })

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {isChristmas ? <NavigationChristmas /> : <Navigation />}
      <ScrollProgress />

      {isChristmas ? (
        <HeroSectionChristmas blueText={blueText} orangeText={orangeText} />
      ) : (
        <HeroSection blueText={blueText} orangeText={orangeText} />
      )}

      {isChristmas && <ChristmasInstagramSection />}

      <LazySection minHeight={420} rootMargin="220px">
        <TrustedPartnersSection />
      </LazySection>

      <LazySection minHeight={760} rootMargin="240px">
        <ServicesSection />
      </LazySection>

      <LazySection minHeight={560} rootMargin="240px">
        <FelicityPartnershipSection />
      </LazySection>

      <LazySection minHeight={520} rootMargin="240px">
        <BrandsSection />
      </LazySection>

      <LazySection minHeight={720} rootMargin="300px">
        <BlackoutSection />
      </LazySection>

      <LazySection minHeight={640} rootMargin="280px">
        <SuncarInteractiveGame />
      </LazySection>

      <QuickContactSection />

      {isChristmas ? <FooterChristmas /> : <Footer />}
    </div>
  )
}
