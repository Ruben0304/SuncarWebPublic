"use client"

import { useState } from "react"
import LoadingScreen from "./LoadingScreen"
import { LoadingProvider, useLoadingContext } from "@/hooks/useLoadingContext"

interface ClientWrapperProps {
  children: React.ReactNode
}

function ClientWrapperContent({ children }: ClientWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const { setLoadingComplete } = useLoadingContext()

  const handleLoadingComplete = () => {
    setIsLoading(false)
    setLoadingComplete(true)
    setTimeout(() => {
      // Delay adicional para suavizar la transición
    }, 200)
  }

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
      <div
        className={`transition-opacity duration-500 ${
          isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {children}
      </div>
    </>
  )
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <LoadingProvider>
      <ClientWrapperContent>{children}</ClientWrapperContent>
    </LoadingProvider>
  )
}