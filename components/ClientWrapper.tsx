"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import LoadingScreen from "./LoadingScreen"
import { LoadingProvider, useLoadingContext } from "@/hooks/useLoadingContext"
import { ClientProvider } from "@/hooks/useClient"
import ClientVerificationManager from "./ClientVerificationManager"

const UnifiedChatAssistant = dynamic(() => import("./UnifiedChatAssistant"), {
  ssr: false,
  loading: () => null
})

interface ClientWrapperProps {
  children: React.ReactNode
}

function ClientWrapperContent({ children }: ClientWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [shouldRenderChat, setShouldRenderChat] = useState(false)
  const { setLoadingComplete } = useLoadingContext()

  const handleLoadingComplete = () => {
    setIsLoading(false)
    setLoadingComplete(true)
    setTimeout(() => {
      // Delay adicional para suavizar la transición
    }, 200)
  }

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShouldRenderChat(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

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
      {shouldRenderChat && <UnifiedChatAssistant />}
    </>
  )
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <LoadingProvider>
      <ClientProvider>
        <ClientVerificationManager>
          <ClientWrapperContent>{children}</ClientWrapperContent>
        </ClientVerificationManager>
      </ClientProvider>
    </LoadingProvider>
  )
}
