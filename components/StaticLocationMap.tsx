"use client"

import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface StaticLocationMapProps {
  lat: number
  lng: number
  address: string
  height?: string
}

export default function StaticLocationMap({ 
  lat, 
  lng, 
  address, 
  height = "300px" 
}: StaticLocationMapProps) {
  const position: [number, number] = [lat, lng]

  return (
    <div className="relative">
      <MapContainer
        center={position}
        zoom={15}
        style={{ height, width: '100%' }}
        className="rounded-lg border border-gray-200"
        scrollWheelZoom={false}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={false}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="text-center p-2">
              <h3 className="font-semibold text-primary mb-2">Oficina Suncar</h3>
              <p className="text-sm text-gray-600 mb-2">{address}</p>
              <p className="text-xs text-gray-500">
                {lat.toFixed(6)}, {lng.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}