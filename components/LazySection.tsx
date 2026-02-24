"use client"

import { ReactNode, useEffect, useRef, useState } from "react"

interface LazySectionProps {
  children: ReactNode
  minHeight?: number
  rootMargin?: string
  fallback?: ReactNode
  className?: string
}

export default function LazySection({
  children,
  minHeight = 320,
  rootMargin = "200px",
  fallback,
  className
}: LazySectionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin])

  return (
    <div ref={containerRef} className={className}>
      {isVisible
        ? children
        : fallback ?? (
            <div
              className="w-full"
              style={{ minHeight }}
              aria-hidden="true"
            />
          )}
    </div>
  )
}
