'use client';

import { useState, useEffect } from 'react';
import { useClient } from '@/hooks/useClient';
import ClientVerificationDialog from './ClientVerificationDialog';
import { clientStorage } from '@/lib/clientStorage';

interface ClientVerificationManagerProps {
  children: React.ReactNode;
}

export default function ClientVerificationManager({ children }: ClientVerificationManagerProps) {
  const { isClient, isLoading } = useClient();
  const [showDialog, setShowDialog] = useState(false);
  const [hasShownDialog, setHasShownDialog] = useState(false);

  useEffect(() => {
    if (!isLoading && !hasShownDialog) {
      // Check if client data already exists in storage
      const hasStoredClient = clientStorage.isClientStored();
      
      // If no stored client data, show the verification dialog
      if (!hasStoredClient) {
        // Add a small delay to ensure the loading screen has finished
        const timer = setTimeout(() => {
          setShowDialog(true);
          setHasShownDialog(true);
        }, 1000);
        
        return () => clearTimeout(timer);
      } else {
        setHasShownDialog(true);
      }
    }
  }, [isLoading, hasShownDialog]);

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