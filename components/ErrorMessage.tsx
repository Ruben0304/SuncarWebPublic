'use client'

import React from 'react'
import { AlertCircle, Wrench, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'

interface ErrorMessageProps {
  message?: string
  onDismiss?: () => void
  variant?: 'inline' | 'toast'
  showIcon?: boolean
}

/**
 * Componente para mostrar mensajes de error de forma elegante
 * Puede usarse inline en formularios o como toast
 */
export function ErrorMessage({
  message = 'Estamos trabajando en mejoras para ofrecerte un mejor servicio.',
  onDismiss,
  variant = 'inline',
  showIcon = true,
}: ErrorMessageProps) {
  if (!message) return null

  if (variant === 'toast') {
    return (
      <div className="fixed top-4 right-4 z-50 max-w-md animate-fade-in-right">
        <Alert className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-700 shadow-lg">
          <div className="flex items-start gap-3">
            {showIcon && (
              <div className="flex-shrink-0">
                <div className="relative">
                  <Wrench className="h-5 w-5 text-orange-600 dark:text-orange-400 animate-pulse" />
                  <div className="absolute inset-0 bg-orange-400 rounded-full blur-md opacity-30 animate-pulse" />
                </div>
              </div>
            )}
            
            <div className="flex-1 space-y-1">
              <AlertTitle className="text-orange-900 dark:text-orange-100 font-semibold">
                Estamos mejorando
              </AlertTitle>
              <AlertDescription className="text-orange-800 dark:text-orange-200 text-sm">
                {message}
              </AlertDescription>
            </div>

            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="flex-shrink-0 h-6 w-6 p-0 hover:bg-orange-100 dark:hover:bg-orange-800"
              >
                <X className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </Button>
            )}
          </div>
        </Alert>
      </div>
    )
  }

  return (
    <Alert className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-700">
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className="flex-shrink-0 mt-0.5">
            <div className="relative">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <div className="absolute inset-0 bg-orange-400 rounded-full blur-md opacity-20" />
            </div>
          </div>
        )}
        
        <div className="flex-1 space-y-1">
          <AlertTitle className="text-orange-900 dark:text-orange-100 font-semibold text-sm">
            Trabajando en mejoras
          </AlertTitle>
          <AlertDescription className="text-orange-800 dark:text-orange-200 text-sm leading-relaxed">
            {message}
          </AlertDescription>
        </div>

        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="flex-shrink-0 h-6 w-6 p-0 hover:bg-orange-100 dark:hover:bg-orange-800"
          >
            <X className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </Button>
        )}
      </div>
    </Alert>
  )
}
