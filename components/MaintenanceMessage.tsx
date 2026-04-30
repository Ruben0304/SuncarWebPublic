'use client'

import React, { useEffect, useState } from 'react'
import { Wrench, Sun, Zap, RefreshCw } from 'lucide-react'
import { Button } from './ui/button'

export function MaintenanceMessage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-200/30 dark:bg-yellow-500/10 rounded-full blur-3xl animate-pulse animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-200/20 dark:bg-amber-500/5 rounded-full blur-3xl animate-pulse animation-delay-500" />
      </div>

      <div 
        className={`relative max-w-2xl w-full transition-all duration-1000 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Main card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-orange-100 dark:border-gray-700">
          {/* Icon section */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Rotating sun icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Sun className="w-24 h-24 text-yellow-400 animate-spin" style={{ animationDuration: '20s' }} />
              </div>
              
              {/* Center icons */}
              <div className="relative z-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full p-6 shadow-lg">
                <Wrench className="w-12 h-12 text-white animate-pulse" />
              </div>
              
              {/* Orbiting zap icons */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
                <Zap className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-6 text-orange-500" />
              </div>
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s', animationDelay: '2s' }}>
                <Zap className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className="text-center space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              <span className="bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                Estamos Mejorando
              </span>
            </h1>
            
            <div className="space-y-3">
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-medium">
                🔧 Trabajando en mejoras para ti
              </p>
              
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Nuestro equipo está optimizando la plataforma para brindarte una mejor experiencia. 
                Como la energía solar que nunca se detiene, estamos trabajando constantemente para servirte mejor.
              </p>
            </div>

            {/* Features being improved */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Optimizando rendimiento
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700">
                <div className="text-2xl mb-2">🛠️</div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mejorando funcionalidades
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-4 border border-amber-200 dark:border-amber-700">
                <div className="text-2xl mb-2">✨</div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Puliendo detalles
                </p>
              </div>
            </div>

            {/* Action button */}
            <div className="pt-6">
              <Button
                onClick={handleRefresh}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Intentar nuevamente
              </Button>
            </div>

            {/* Footer message */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
              Si el problema persiste, contáctanos en{' '}
              <a 
                href="tel:+5363962417" 
                className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
              >
                +53 63962417
              </a>
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full opacity-20 blur-2xl animate-pulse" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-20 blur-2xl animate-pulse animation-delay-1000" />
      </div>
    </div>
  )
}
