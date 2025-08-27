'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClientData } from '@/services';
import { clientStorage } from '@/lib/clientStorage';

interface ClientContextType {
  clientData: ClientData | null;
  isClient: boolean;
  isLoading: boolean;
  setClientData: (data: ClientData) => void;
  clearClient: () => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

interface ClientProviderProps {
  children: ReactNode;
}

export function ClientProvider({ children }: ClientProviderProps) {
  const [clientData, setClientDataState] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar datos del cliente desde localStorage al iniciar
    const storedClientData = clientStorage.getClientData();
    if (storedClientData) {
      setClientDataState(storedClientData);
    }
    setIsLoading(false);
  }, []);

  const setClientData = (data: ClientData) => {
    setClientDataState(data);
    clientStorage.setClientData(data);
  };

  const clearClient = () => {
    setClientDataState(null);
    clientStorage.clearClientData();
  };

  const value: ClientContextType = {
    clientData,
    isClient: clientData !== null,
    isLoading,
    setClientData,
    clearClient,
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient(): ClientContextType {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}