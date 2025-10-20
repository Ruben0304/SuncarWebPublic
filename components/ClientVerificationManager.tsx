'use client';

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useClient } from '@/hooks/useClient'
import ClientVerificationDialog from './ClientVerificationDialog'
import { clientStorage } from '@/lib/clientStorage'

interface ClientVerificationManagerProps {
  children: React.ReactNode;
}

export default function ClientVerificationManager({ children }: ClientVerificationManagerProps) {
  const { isLoading } = useClient()
  const [showDialog, setShowDialog] = useState(false)
  const [hasShownDialog, setHasShownDialog] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Skip the verification prompt on the homepage; component remains available for other routes.
    if (pathname === "/") {
      if (showDialog) {
        setShowDialog(false)
      }
      if (!hasShownDialog) {
        setHasShownDialog(true)
      }
      return
    }

    if (!isLoading && !hasShownDialog) {
      const hasStoredClient = clientStorage.isClientStored()

      if (!hasStoredClient) {
        const timer = setTimeout(() => {
          setShowDialog(true)
          setHasShownDialog(true)
        }, 1000)

        return () => clearTimeout(timer)
      }

      setHasShownDialog(true)
    }
  }, [hasShownDialog, isLoading, pathname, showDialog])

  return (
    <>
      {children}
      <ClientVerificationDialog 
        open={showDialog} 
        onOpenChange={setShowDialog} 
      />
    </>
  );
}
