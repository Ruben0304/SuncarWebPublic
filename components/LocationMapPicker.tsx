"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react'
import GoogleMapView from '@/components/maps/GoogleMapView'

interface LocationMapPickerProps {
  onLocationChange: (lat: number, lng: number, address: string) => void
  initialLat?: number
  initialLng?: number
  height?: string
}

export default function LocationMapPicker({ 
  onLocationChange, 
  initialLat = 23.1136, // Havana, Cuba coordinates
  initialLng = -82.3666, 
  height = "400px" 
}: LocationMapPickerProps) {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng])
  const [address, setAddress] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)
  const onLocationChangeRef = useRef(onLocationChange)
  onLocationChangeRef.current = onLocationChange

  // Function to format and clean the address
  const formatAddress = (addressData: any): string => {
    if (!addressData || !addressData.address) {
      return addressData?.display_name || ''
    }

    const addr = addressData.address
    const addressParts: string[] = []

    // Add house number and road if available
    if (addr.house_number && addr.road) {
      addressParts.push(`${addr.road} ${addr.house_number}`)
    } else if (addr.road) {
      addressParts.push(addr.road)
    }

    // Add neighborhood, suburb, or quarter
    if (addr.neighbourhood) {
      addressParts.push(addr.neighbourhood)
    } else if (addr.suburb) {
      addressParts.push(addr.suburb)
    } else if (addr.quarter) {
      addressParts.push(addr.quarter)
    }

    // Add municipality, avoiding duplicates
    const municipality = addr.municipality || addr.city_district || addr.borough
    if (municipality && !addressParts.some(part => part.toLowerCase().includes(municipality.toLowerCase()))) {
      addressParts.push(municipality)
    }

    // Add city, avoiding duplicates with municipality
    if (addr.city && addr.city !== municipality && !addressParts.some(part => part.toLowerCase().includes(addr.city.toLowerCase()))) {
      // Only add city if it's not "La Habana" or if there are no other location parts
      if (addr.city.toLowerCase() !== 'la habana' || addressParts.length === 0) {
        addressParts.push(addr.city)
      }
    }

    // If we have parts, join them, otherwise fall back to display_name cleaned up
    if (addressParts.length > 0) {
      return addressParts.join(', ')
    } else {
      // Clean up display_name by removing redundant "La Habana" references
      let cleanedAddress = addressData.display_name
      
      // Remove duplicate "La Habana" references
      const laHabanaCount = (cleanedAddress.match(/La Habana/gi) || []).length
      if (laHabanaCount > 1) {
        // Keep only the last "La Habana" reference
        const parts: string[] = cleanedAddress.split(', ')
        const filteredParts = parts.filter((part: string, index: number) => {
          const isLaHabana = part.toLowerCase().includes('la habana')
          if (!isLaHabana) return true
          // Keep only if it's the last occurrence
          const remainingParts = parts.slice(index + 1)
          return !remainingParts.some((p: string) => p.toLowerCase().includes('la habana'))
        })
        cleanedAddress = filteredParts.join(', ')
      }
      
      return cleanedAddress
    }
  }

  // Dirección a partir de coordenadas: Google primero, y Nominatim si falla.
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setLoading(true)
    const publicar = (texto: string) => {
      setAddress(texto)
      onLocationChangeRef.current(lat, lng, texto)
    }
    try {
      let texto = ''
      try {
        const { results } = await new google.maps.Geocoder().geocode({
          location: { lat, lng },
          language: 'es',
        })
        // Los "plus codes" (87XJ+4F) no le dicen nada al cliente.
        const mejor = results.find((r) => !r.types.includes('plus_code')) ?? results[0]
        texto = mejor?.formatted_address ?? ''
      } catch {
        // Geocoding API no disponible: se usa Nominatim.
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        )
        const data = await response.json()
        if (data && (data.display_name || data.address)) texto = formatAddress(data)
      }
      publicar(texto || `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    } catch (error) {
      console.error('Error in reverse geocoding:', error)
      publicar(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle position changes
  const handlePositionChange = useCallback((newPosition: [number, number]) => {
    setPosition(newPosition)
    markerRef.current && (markerRef.current.position = { lat: newPosition[0], lng: newPosition[1] })
    reverseGeocode(newPosition[0], newPosition[1])
  }, [reverseGeocode])

  // Marcador arrastrable y clic en el mapa
  useEffect(() => {
    if (!map) return
    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat: initialLat, lng: initialLng },
      gmpDraggable: true,
      title: 'Arrastra para elegir la ubicación',
    })
    markerRef.current = marker
    const alSoltar = () => {
      const p = marker.position as google.maps.LatLngLiteral | google.maps.LatLng | null
      if (!p) return
      const lat = typeof p.lat === 'function' ? p.lat() : p.lat
      const lng = typeof p.lng === 'function' ? p.lng() : p.lng
      handlePositionChange([lat, lng])
    }
    marker.addEventListener('gmp-dragend', alSoltar)
    const alHacerClic = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) handlePositionChange([e.latLng.lat(), e.latLng.lng()])
    })
    return () => {
      marker.removeEventListener('gmp-dragend', alSoltar)
      alHacerClic.remove()
      marker.map = null
      markerRef.current = null
    }
    // el punto de partida solo cuenta al crear el mapa
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  // Initialize with default position - set default address without geocoding
  useEffect(() => {
    const defaultAddress = `${initialLat.toFixed(6)}, ${initialLng.toFixed(6)}`
    setAddress(defaultAddress)
    onLocationChange(initialLat, initialLng, defaultAddress)
  }, []) // Empty dependency array - only run once on mount

  return (
    <div className="space-y-4">
      <div className="relative">
        <GoogleMapView
          librerias={['marker']}
          onMap={setMap}
          className="rounded-lg border border-gray-300 z-0"
          style={{ height, width: '100%' }}
          options={{
            center: { lat: position[0], lng: position[1] },
            zoom: 13,
            // DEMO_MAP_ID habilita los marcadores avanzados sin crear un estilo en la consola.
            mapId: 'DEMO_MAP_ID',
            gestureHandling: 'greedy',
            mapTypeControl: false,
            streetViewControl: false,
          }}
        />
        
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-lg">
            <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
              <span className="text-primary font-medium">Obteniendo dirección...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Instrucciones:</strong> Haz clic en el mapa o arrastra el marcador para seleccionar la ubicación exacta donde se instalará el sistema solar.
        </p>
      </div>
      
      {/* Selected address display */}
      {address && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Ubicación seleccionada:</p>
              <p className="text-sm text-gray-600 break-words">{address}</p>
              <p className="text-xs text-gray-500 mt-1">
                Coordenadas: {position[0].toFixed(6)}, {position[1].toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}