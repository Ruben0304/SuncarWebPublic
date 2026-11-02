"use client";

import AppShell from "./AppShell";
import Navigation from "./navigation";
import Footer from "./footer";
import { useTypewriter } from "@/hooks/useTypewriter";
import { useLoadingContext } from "@/hooks/useLoadingContext";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import LazySection from "@/components/LazySection";

import HeroSection from "./landing-sections/hero-section";
import QuickContactSection from "./landing-sections/quick-contact-section";
import KitsSection from "./landing-sections/kits-section";
import ProductosSueltosSection from "./landing-sections/productos-sueltos-section";
import OficinasSection from "./landing-sections/oficinas-section";
import TrustedPartnersSection from "./landing-sections/trusted-partners-section";
import FelicityPartnershipSection from "./landing-sections/felicity-partnership-section";
import BlackoutSection from "./landing-sections/blackout-section";

/**
 * Equivalente de app/layout.tsx (GoogleMapsProvider + ClientWrapper) +
 * app/page.tsx, fusionados en una sola isla: ambos comparten contexto de
 * React (loading, cliente, mapas) que no puede cruzar el límite entre islas
 * independientes de Astro. El tema de Navidad no se porta (isChristmasSeason
 * siempre devuelve false hoy: no hay código vivo que migrar).
 */
function HomePageContent() {
  const { isLoadingComplete } = useLoadingContext();

  const headlineLead = useTypewriter({
    text: "Energía",
    speed: 120,
    delay: 300,
    waitForLoading: true,
    isLoadingComplete,
  });

  const headlineAccent = useTypewriter({
    text: "que transforma.",
    speed: 120,
    delay: headlineLead.isComplete ? 200 : 999999,
    waitForLoading: false,
    isLoadingComplete: true,
  });

  return (
    <div className="min-h-screen bg-[#F2F2EF] overflow-x-hidden">
      <Navigation />
      <ScrollProgress />

      <HeroSection headlineLead={headlineLead} headlineAccent={headlineAccent} />

      <LazySection minHeight={560} rootMargin="220px">
        <TrustedPartnersSection />
      </LazySection>

      <KitsSection />
      <ProductosSueltosSection />

      <LazySection minHeight={560} rootMargin="240px">
        <FelicityPartnershipSection />
      </LazySection>

      <LazySection minHeight={720} rootMargin="300px">
        <BlackoutSection />
      </LazySection>

      <OficinasSection />
      <QuickContactSection />

      <Footer />
    </div>
  );
}

export default function HomePageApp() {
  return (
    <AppShell>
      <HomePageContent />
    </AppShell>
  );
}
