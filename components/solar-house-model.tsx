"use client"

/// <reference types="../types/model-viewer" />

import { useEffect, useRef, useState } from "react"
import "@google/model-viewer"

export default function SolarHouseModel() {
    const modelViewerRef = useRef<any>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Optional: Add event listeners or configurations here
        const modelViewer = modelViewerRef.current

        if (modelViewer) {
            modelViewer.addEventListener('load', () => {
                console.log('3D model loaded successfully')
                setIsLoading(false)
            })

            modelViewer.addEventListener('error', (error: any) => {
                console.error('Error loading 3D model:', error)
                setIsLoading(false)
            })
        }

        // Listen for fullscreen changes
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
        }
    }, [])

    const toggleFullscreen = async () => {
        if (!containerRef.current) return

        try {
            if (!document.fullscreenElement) {
                await containerRef.current.requestFullscreen()
            } else {
                await document.exitFullscreen()
            }
        } catch (error) {
            console.error('Error toggling fullscreen:', error)
        }
    }

    return (
        <div ref={containerRef} className="relative w-full h-full min-h-[500px] md:min-h-[600px] lg:min-h-[700px] pt-12 group">
            <model-viewer
                ref={modelViewerRef}
                src="https://s3.suncarsrl.com/3dmodels/solar_house.glb"
                poster="https://s3.suncarsrl.com/web/3d_placeholder.jpg"
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

                {/* Fullscreen button - subtle and appears on hover */}
                <button
                    onClick={toggleFullscreen}
                    className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm text-gray-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-primary hover:scale-110 z-10"
                    title={isFullscreen ? "Salir de pantalla completa" : "Ver en pantalla completa"}
                >
                    {isFullscreen ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    )}
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

            {/* Subtle Loading Indicator */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
                <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-lg flex items-center gap-3 border border-white/50">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium text-primary/80">Cargando modelo interactivo 3D...</span>
                </div>
            </div>

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
