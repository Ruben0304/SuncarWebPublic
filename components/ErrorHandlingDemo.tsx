'use client'

/**
 * Componente de demostración del sistema de manejo de errores
 * Muestra los diferentes tipos de mensajes de error disponibles
 */

import { useState } from 'react'
import { ErrorMessage } from './ErrorMessage'
import { MaintenanceMessage } from './MaintenanceMessage'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useErrorHandler } from '@/hooks/useErrorHandler'

export function ErrorHandlingDemo() {
  const [showMaintenance, setShowMaintenance] = useState(false)
  const [showInlineError, setShowInlineError] = useState(false)
  const [showToastError, setShowToastError] = useState(false)
  const { error, handleError, clearError } = useErrorHandler()

  const simulateNetworkError = () => {
    const error = new TypeError('Failed to fetch')
    handleError(error, 'Demo.simulateNetworkError')
    setShowInlineError(true)
  }

  const simulateServerError = () => {
    const error = { status: 500 }
    handleError(error, 'Demo.simulateServerError')
    setShowToastError(true)
  }

  const simulate404Error = () => {
    const error = { status: 404 }
    handleError(error, 'Demo.simulate404Error')
    setShowInlineError(true)
  }

  if (showMaintenance) {
    return <MaintenanceMessage />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Manejo de Errores
          </h1>
          <p className="text-lg text-gray-600">
            Demostración de los diferentes tipos de mensajes de error
          </p>
        </div>

        {/* Pantalla de Mantenimiento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🖥️</span>
              Pantalla Completa de Mantenimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Se muestra cuando hay un error crítico que rompe la aplicación.
              Incluye animaciones, mensaje amigable y botón para reintentar.
            </p>
            <Button
              onClick={() => setShowMaintenance(true)}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
            >
              Ver Pantalla de Mantenimiento
            </Button>
          </CardContent>
        </Card>

        {/* Mensaje Inline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Mensaje Inline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Se muestra dentro de formularios o secciones específicas.
              Compacto y elegante.
            </p>
            
            <div className="space-x-2">
              <Button
                onClick={simulateNetworkError}
                variant="outline"
              >
                Simular Error de Red
              </Button>
              <Button
                onClick={simulate404Error}
                variant="outline"
              >
                Simular Error 404
              </Button>
            </div>

            {showInlineError && error && (
              <ErrorMessage
                message={error}
                onDismiss={() => {
                  clearError()
                  setShowInlineError(false)
                }}
                variant="inline"
              />
            )}
          </CardContent>
        </Card>

        {/* Toast/Notificación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🔔</span>
              Toast / Notificación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Aparece como notificación flotante en la esquina superior derecha.
              Ideal para errores temporales.
            </p>
            
            <Button
              onClick={simulateServerError}
              variant="outline"
            >
              Simular Error de Servidor
            </Button>

            {showToastError && error && (
              <ErrorMessage
                message={error}
                onDismiss={() => {
                  clearError()
                  setShowToastError(false)
                }}
                variant="toast"
              />
            )}
          </CardContent>
        </Card>

        {/* Ejemplos de Mensajes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💬</span>
              Ejemplos de Mensajes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm font-semibold text-orange-900 mb-1">
                  Error de Red:
                </p>
                <p className="text-sm text-orange-700">
                  "Estamos trabajando en mejoras. Por favor, intenta nuevamente en unos momentos."
                </p>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm font-semibold text-orange-900 mb-1">
                  Error 500:
                </p>
                <p className="text-sm text-orange-700">
                  "Estamos realizando mejoras en nuestros sistemas. Volveremos pronto."
                </p>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm font-semibold text-orange-900 mb-1">
                  Error 404:
                </p>
                <p className="text-sm text-orange-700">
                  "El recurso solicitado no está disponible en este momento."
                </p>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm font-semibold text-orange-900 mb-1">
                  Timeout:
                </p>
                <p className="text-sm text-orange-700">
                  "La solicitud está tomando más tiempo del esperado. Estamos optimizando nuestros servicios."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Características */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              Características
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Mensajes amigables en lugar de errores técnicos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Diseño elegante con colores de SunCar (naranja/amarillo)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Animaciones suaves y profesionales</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Responsive (móvil, tablet, desktop)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Accesible (ARIA, teclado, lectores de pantalla)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Botones de acción (Reintentar, Cerrar)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Información de contacto incluida</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
