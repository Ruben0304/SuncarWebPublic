"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

interface RevelarProps {
  children: ReactNode
  /** Retraso en ms: escalona las tarjetas de una misma fila. */
  retraso?: number
  className?: string
}

/** Sube y aparece la primera vez que entra en pantalla. */
export default function Revelar({ children, retraso = 0, className = "" }: RevelarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return
        setVisible(true)
        observer.disconnect()
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${retraso}ms` : "0ms" }}
      className={`${className} transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
        visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-95 opacity-0 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:opacity-100"
      }`}
    >
      {children}
    </div>
  )
}
