"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isLoadingComplete: boolean;
  setLoadingComplete: (complete: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  const setLoadingComplete = (complete: boolean) => {
    setIsLoadingComplete(complete);
  };

  return (
    <LoadingContext.Provider value={{ isLoadingComplete, setLoadingComplete }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoadingContext = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoadingContext must be used within a LoadingProvider');
  }
  return context;
};