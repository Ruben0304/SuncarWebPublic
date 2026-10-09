"use client"

/// <reference types="../types/model-viewer" />

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import "@google/model-viewer"
import { POSTER_CASA } from "@/lib/poster-casa"
import RayosSolares from "@/components/rayos-solares"

const POSTER = POSTER_CASA

// model-viewer no usa next/image: se le pasa la URL del optimizador para que el
// póster llegue en AVIF/WebP y al ancho de la pantalla, no el PNG original.
const posterOptimizado = () => {
    const ancho = typeof window !== "undefined" && window.innerWidth < 768 ? 640 : 1200
    return `/_next/image?url=${encodeURIComponent(POSTER)}&w=${ancho}&q=75`
}

export default function SolarHouseModel() {
    const modelViewerRef = useRef<any>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [webGLError, setWebGLError] = useState(false)
    useEffect(() => {
        // Check if WebGL is available
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

        if (!gl) {
            setWebGLError(true)
            return
        }

        // Optional: Add event listeners or configurations here
        const modelViewer = modelViewerRef.current

        if (modelViewer) {
            modelViewer.addEventListener('error', (error: any) => {
                console.error('Error loading 3D model:', error)
                setWebGLError(true)
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

    // Si WebGL no está disponible, mostrar imagen estática
    if (webGLError) {
        return (
            <div className="relative w-full h-full min-h-[460px] md:min-h-[520px] lg:min-h-[680px] pt-12">
                <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                        src={POSTER}
                        alt="Casa con paneles solares - Suncar"
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-contain"
                    />
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md">
                    <p className="text-xs text-slate-600 text-center">
                        Modelo 3D no disponible en este navegador
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div ref={containerRef} className={`relative w-full pt-12 group ${isFullscreen ? "" : "lg:w-[135%] lg:-ml-[17.5%]"}`}>
            <model-viewer
                ref={modelViewerRef}
                // Versión suave (~310 KB). Hay otras dos sin cargar: solar_house_ligero.glb (~240 KB, simplificada de más: el sol y
                // las curvas se ven poligonales) y solar_house_calidad.glb (~490 KB, la de más calidad, sin tele ni ajustes).
                src="/3dmodels/solar_house.glb"
                poster={posterOptimizado()}
                alt="Modelo 3D de casa con paneles solares - Suncar"
                camera-controls
                disable-zoom
                disable-pan
                touch-action="pan-y"
                shadow-intensity="0"
                exposure="1"
                camera-orbit="0deg 88deg 85%"
                // Centro del modelo (25, 171, 40) con el objetivo 35 más abajo: la casa sube un poco dentro del visor.
                camera-target="25m 136m 40m"
                field-of-view="25deg"
                max-camera-orbit="auto 90deg 85%"
                min-camera-orbit="auto 50deg 85%"
                interpolation-decay="200"
                style={{
                    width: '100%',
                    overflow: 'visible',
                    backgroundColor: 'transparent',
                    '--poster-color': 'transparent',
                    '--progress-bar-color': 'transparent'
                } as any}
                loading="lazy"
                reveal="auto"
                ar
                ar-modes="webxr scene-viewer quick-look"
                className={`w-full bg-transparent ${isFullscreen ? "h-screen" : "h-[480px] md:h-[600px] lg:h-[760px]"}`}
            >

                {/* Puntos anclados al modelo (en sus unidades): el sol y el centro de cada grupo de paneles.
                    RayosSolares dibuja entre ellos. */}
                <div slot="hotspot-sol" data-position="120.5m 319.8m 58.8m" data-normal="0m 0m 1m" className="pointer-events-none h-0 w-0" />
                <div slot="hotspot-paneles-1" data-position="-56m 246.6m 75.7m" data-normal="0m 1m 0m" className="pointer-events-none h-0 w-0" />
                <div slot="hotspot-paneles-2" data-position="61.8m 162m 74.2m" data-normal="0m 1m 0m" className="pointer-events-none h-0 w-0" />

                {/* AR button */}
                <button
                    slot="ar-button"
                    className="hidden md:flex absolute bottom-4 right-4 items-center gap-2 px-6 py-3 bg-[#012928] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
                <div slot="error" className="absolute inset-0 flex items-center justify-center bg-transparent">
                    <div className="text-center space-y-2 p-6 bg-white/90 backdrop-blur-sm rounded-lg">
                        <svg className="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-600 font-semibold">Error al cargar el modelo 3D</p>
                        <p className="text-sm text-gray-600">Por favor, intenta recargar la página</p>
                    </div>
                </div>
            </model-viewer>

            <RayosSolares contenedor={containerRef} />

            {/* Floating particles around the model */}
            <div className="hidden md:contents">
            <div className="floating-particle particle-1" style={{ top: '10%', left: '20%' }}></div>
            <div className="floating-particle particle-2" style={{ top: '30%', right: '15%' }}></div>
            <div className="floating-particle particle-3" style={{ bottom: '20%', left: '10%' }}></div>
            <div className="floating-particle particle-4" style={{ bottom: '40%', right: '20%' }}></div>
            <div className="floating-particle particle-5" style={{ top: '60%', left: '5%' }}></div>
            <div className="floating-particle particle-6" style={{ top: '20%', right: '5%' }}></div>
            </div>

            {/* Decorative elements */}
            <div className="hidden md:block absolute -top-4 -right-4 w-24 h-24 bg-secondary-gradient rounded-full opacity-20 blur-xl animate-pulse pointer-events-none"></div>
            <div className="hidden md:block absolute -bottom-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse animation-delay-500 pointer-events-none"></div>
        </div>
    )
}

