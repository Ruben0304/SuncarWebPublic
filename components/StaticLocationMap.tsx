"use client"

import React, { useEffect, useState } from 'react'
import GoogleMapView from '@/components/maps/GoogleMapView'

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
  const [map, setMap] = useState<google.maps.Map | null>(null)

  useEffect(() => {
    if (!map) return
    const position = { lat, lng }

    const contenido = document.createElement('div')
    contenido.style.cssText = 'text-align:center;padding:4px 8px'
    const titulo = document.createElement('h3')
    titulo.textContent = 'Oficina Suncar'
    titulo.style.cssText = 'font-weight:600;color:#012928;margin:0 0 6px'
    const direccion = document.createElement('p')
    direccion.textContent = address
    direccion.style.cssText = 'font-size:14px;color:#4b5563;margin:0 0 6px'
    const coordenadas = document.createElement('p')
    coordenadas.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    coordenadas.style.cssText = 'font-size:12px;color:#6b7280;margin:0'
    contenido.append(titulo, direccion, coordenadas)

    const info = new google.maps.InfoWindow({ content: contenido })
    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      title: 'Oficina Suncar',
    })
    marker.addEventListener('gmp-click', () => info.open({ map, anchor: marker }))
    map.setCenter(position)

    return () => {
      info.close()
      marker.map = null
    }
  }, [map, lat, lng, address])

  return (
    <GoogleMapView
      librerias={['marker']}
      onMap={setMap}
      className="rounded-lg border border-gray-200"
      style={{ height, width: '100%' }}
      options={{
        center: { lat, lng },
        zoom: 15,
        // DEMO_MAP_ID habilita los marcadores avanzados sin crear un estilo en la consola.
        mapId: 'DEMO_MAP_ID',
        gestureHandling: 'cooperative',
        disableDoubleClickZoom: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      }}
    />
  )
}
