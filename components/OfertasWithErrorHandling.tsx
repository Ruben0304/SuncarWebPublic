'use client'

/**
 * Ejemplo de componente que usa el sistema de manejo de errores global
 * Este es un ejemplo de cómo integrar el manejo de errores en cualquier componente
 */

import { useEffect, useState } from 'react'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { fetchWithErrorHandling } from '@/lib/errorHandler'
import { ErrorMessage } from './ErrorMessage'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'

interface Oferta {
  id: string
  descripcion: string
  precio: number
  moneda: string
}

export function OfertasWithErrorHandling() {
  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [loading, setLoading] = useState(true)
  const { error, handleError, clearError } = useErrorHandler()

  const loadOfertas = async () => {
    try {
      setLoading(true)
      clearError()

      // Usar fetchWithErrorHandling para manejo automático de errores
      const response = await fetchWithErrorHandling<{
        success: boolean
        data: Oferta[]
      }>('/api/ofertas/simplified')

      setOfertas(response.data)
    } catch (err) {
      // El error ya viene con mensaje amigable gracias a fetchWithErrorHandling
      handleError(err, 'OfertasWithErrorHandling.loadOfertas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOfertas()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando ofertas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Mostrar error si existe */}
      {error && (
        <div className="mb-6">
          <ErrorMessage
            message={error}
            onDismiss={clearError}
            variant="inline"
          />
          <div className="mt-4 text-center">
            <Button
              onClick={loadOfertas}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
            >
              Intentar nuevamente
            </Button>
          </div>
        </div>
      )}

      {/* Mostrar ofertas si no hay error */}
      {!error && ofertas.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ofertas.map((oferta) => (
            <Card key={oferta.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {oferta.descripcion}
                </h3>
                <p className="text-2xl font-bold text-orange-600">
                  {oferta.precio.toLocaleString()} {oferta.moneda}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mensaje cuando no hay ofertas */}
      {!error && !loading && ofertas.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-600 mb-4">No hay ofertas disponibles</p>
          <Button onClick={loadOfertas}>Recargar</Button>
        </div>
      )}
    </div>
  )
}
