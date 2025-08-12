"use client"

import { useEffect, useRef, useState } from "react"

interface LoadingScreenProps {
  onLoadingComplete: () => void
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(1)
  const startTimeRef = useRef<number>(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const checkRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const minLoadTime = 2500
    startTimeRef.current = Date.now()

    intervalRef.current = setInterval(() => {
      setProgress(prev => Math.min(99, prev + 1 + Math.random() * 2))
    }, 100)

    const check = () => {
      const elapsed = Date.now() - startTimeRef.current
      if (elapsed >= minLoadTime) {
        setProgress(100)
        setTimeout(() => onLoadingComplete(), 300)
      } else {
        checkRef.current = setTimeout(check, 120)
      }
    }

    checkRef.current = setTimeout(check, 800)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (checkRef.current) clearTimeout(checkRef.current)
    }
  }, [onLoadingComplete])

  // Progreso circular
  const size = 90
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - Math.min(progress, 100) / 100)

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-10">
      {/* Imagen plana sin sombra ni bordes redondeados */}
      <div className="animate-fade-in">
        <img
          src="/images/loader.jpg"
          alt="Suncar - Energía Solar"
          className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 object-contain"
        />
      </div>

      {/* Progreso circular con % (azul) */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb" /* gray-200 */
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#3b82f6" /* blue-500 */
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-semibold">
          {Math.round(progress)}%
        </div>
      </div>

      <div className="text-center">
        <p className="text-base sm:text-lg md:text-xl font-semibold text-primary">Cargando...</p>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-primary to-secondary-gradient rounded-full animate-float-particle opacity-60"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          />
        ))}
      </div>
    </div>
  )
}