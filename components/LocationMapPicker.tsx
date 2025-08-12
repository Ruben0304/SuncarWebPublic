"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface LocationMapPickerProps {
  onLocationChange: (lat: number, lng: number, address: string) => void
  initialLat?: number
  initialLng?: number
  height?: string
}

// Component to handle map clicks
function LocationMarker({ position, onPositionChange }: { 
  position: [number, number], 
  onPositionChange: (position: [number, number]) => void 
}) {
  const map = useMapEvents({
    click(e) {
      const newPosition: [number, number] = [e.latlng.lat, e.latlng.lng]
      onPositionChange(newPosition)
    },
  })

  return position ? (
    <Marker 
      position={position} 
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target
          const position = marker.getLatLng()
          const newPosition: [number, number] = [position.lat, position.lng]
          onPositionChange(newPosition)
        },
      }}
    />
  ) : null
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
        const parts = cleanedAddress.split(', ')
        const filteredParts = parts.filter((part, index) => {
          const isLaHabana = part.toLowerCase().includes('la habana')
          if (!isLaHabana) return true
          // Keep only if it's the last occurrence
          const remainingParts = parts.slice(index + 1)
          return !remainingParts.some(p => p.toLowerCase().includes('la habana'))
        })
        cleanedAddress = filteredParts.join(', ')
      }
      
      return cleanedAddress
    }
  }

  // Reverse geocoding function to get address from coordinates
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setLoading(true)
    try {
      // Using OpenStreetMap's Nominatim service for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      )
      const data = await response.json()
      
      if (data && (data.display_name || data.address)) {
        const formattedAddress = formatAddress(data)
        setAddress(formattedAddress)
        onLocationChange(lat, lng, formattedAddress)
      } else {
        const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        setAddress(fallbackAddress)
        onLocationChange(lat, lng, fallbackAddress)
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error)
      const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      setAddress(fallbackAddress)
      onLocationChange(lat, lng, fallbackAddress)
    } finally {
      setLoading(false)
    }
  }, [onLocationChange])

  // Handle position changes
  const handlePositionChange = useCallback((newPosition: [number, number]) => {
    setPosition(newPosition)
    reverseGeocode(newPosition[0], newPosition[1])
  }, [reverseGeocode])

  // Initialize with default position - set default address without geocoding
  useEffect(() => {
    const defaultAddress = `${initialLat.toFixed(6)}, ${initialLng.toFixed(6)}`
    setAddress(defaultAddress)
    onLocationChange(initialLat, initialLng, defaultAddress)
  }, []) // Empty dependency array - only run once on mount

  return (
    <div className="space-y-4">
      <div className="relative">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height, width: '100%' }}
          className="rounded-lg border border-gray-300 z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={position} 
            onPositionChange={handlePositionChange}
          />
        </MapContainer>
        
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