"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
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
  const [shouldRenderChat, setShouldRenderChat] = useState(false)
  const { setLoadingComplete } = useLoadingContext()

  useEffect(() => {
    // Ensure components waiting on the loader can proceed immediately
    setLoadingComplete(true)
  }, [setLoadingComplete])

  useEffect(() => {
    const timer = setTimeout(() => setShouldRenderChat(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <div className="transition-opacity duration-500 opacity-100">
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
