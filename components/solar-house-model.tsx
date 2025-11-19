"use client"

/// <reference types="../types/model-viewer" />

import { useEffect, useRef } from "react"
import "@google/model-viewer"

export default function SolarHouseModel() {
    const modelViewerRef = useRef<any>(null)

    useEffect(() => {
        // Optional: Add event listeners or configurations here
        const modelViewer = modelViewerRef.current

        if (modelViewer) {
            modelViewer.addEventListener('load', () => {
                console.log('3D model loaded successfully')
            })

            modelViewer.addEventListener('error', (error: any) => {
                console.error('Error loading 3D model:', error)
            })
        }
    }, [])

    return (
        <div className="relative w-full h-full min-h-[500px] md:min-h-[600px] lg:min-h-[700px] pt-12">
            <model-viewer
                ref={modelViewerRef}
                src="https://s3.suncarsrl.com/3dmodels/solar_house.glb"
                alt="Modelo 3D de casa con paneles solares - Suncar"
                camera-controls
                disable-zoom
                disable-pan
                touch-action="pan-y"
                shadow-intensity="0"
                exposure="1"
                camera-orbit="0deg 75deg 72%"
                field-of-view="25deg"
                max-camera-orbit="auto 90deg auto"
                min-camera-orbit="auto 50deg auto"
                interpolation-decay="200"
                style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '500px',
                    backgroundColor: '#ffffff',
                    '--poster-color': '#ffffff',
                    '--progress-bar-color': 'transparent'
                } as any}
                loading="eager"
                reveal="auto"
                ar
                ar-modes="webxr scene-viewer quick-look"
                className="w-full h-full bg-white"
            >
                {/* Loading indicator */}
                <div slot="poster" className="absolute inset-0 flex items-center justify-center bg-white">
                    <div className="text-center space-y-4">
                        <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="text-primary font-semibold">Cargando modelo 3D...</p>
                    </div>
                </div>

                {/* AR button */}
                <button
                    slot="ar-button"
                    className="hidden md:flex absolute bottom-4 right-4 items-center gap-2 px-6 py-3 bg-secondary-gradient text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Ver en AR
                </button>

                {/* Error message */}
                <div slot="error" className="absolute inset-0 flex items-center justify-center bg-white">
                    <div className="text-center space-y-2 p-6">
                        <svg className="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-600 font-semibold">Error al cargar el modelo 3D</p>
                        <p className="text-sm text-gray-600">Por favor, intenta recargar la página</p>
                    </div>
                </div>
            </model-viewer>

            {/* Floating particles around the model */}
            <div className="floating-particle particle-1" style={{ top: '10%', left: '20%' }}></div>
            <div className="floating-particle particle-2" style={{ top: '30%', right: '15%' }}></div>
            <div className="floating-particle particle-3" style={{ bottom: '20%', left: '10%' }}></div>
            <div className="floating-particle particle-4" style={{ bottom: '40%', right: '20%' }}></div>
            <div className="floating-particle particle-5" style={{ top: '60%', left: '5%' }}></div>
            <div className="floating-particle particle-6" style={{ top: '20%', right: '5%' }}></div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary-gradient rounded-full opacity-20 blur-xl animate-pulse pointer-events-none"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse animation-delay-500 pointer-events-none"></div>
        </div>
    )
}
