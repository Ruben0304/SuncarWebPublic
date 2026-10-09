"use client"

import { useEffect, useRef, type RefObject } from "react"

interface RayosSolaresProps {
    /** Contenedor del visor: de él salen los puntos (hotspots) del sol y de los paneles. */
    contenedor: RefObject<HTMLElement | null>
}

type Punto = { x: number; y: number }

const SOL = "hotspot-sol"
const PANELES = ["hotspot-paneles-1", "hotspot-paneles-2"]
/** Un rayo dura esto (ms); entre uno y otro de un mismo tejado pasa un rato al azar. */
const DURACION_MS = 900
const PAUSA_MIN_MS = 600
const PAUSA_EXTRA_MS = 1100
/** Grosor del haz en el sol y en el panel (px): se abre como un haz de luz. */
const ANCHO_SOL = 3
const ANCHO_PANEL = 24

/**
 * De vez en cuando cae un haz de luz del sol sobre un grupo de paneles: recto, suave,
 * dorado con un borde violeta (ultravioleta), y un destello donde toca el panel. Aparece
 * y se apaga en poco más de un segundo. Se dibuja encima del visor, entre puntos
 * anclados al modelo (hotspots); las posiciones se piden al propio visor (queryHotspot).
 */
export default function RayosSolares({ contenedor }: RayosSolaresProps) {
    const gradientes = useRef<(SVGLinearGradientElement | null)[]>([])
    const haces = useRef<(SVGPolygonElement | null)[]>([])
    const nucleos = useRef<(SVGLineElement | null)[]>([])
    const impactos = useRef<(SVGCircleElement | null)[]>([])

    useEffect(() => {
        const cont = contenedor.current
        if (!cont) return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

        let visible = true
        const io = new IntersectionObserver(([e]) => {
            visible = e.isIntersecting
        })
        io.observe(cont)

        const viewer = cont.querySelector("model-viewer") as
            | (HTMLElement & { queryHotspot?: (n: string) => { canvasPosition: Punto } | null })
            | null
        const punto = (nombre: string): Punto | null => {
            const h = viewer?.queryHotspot?.(nombre)
            if (!viewer || !h) return null
            const v = viewer.getBoundingClientRect()
            const c = cont.getBoundingClientRect()
            return { x: v.left - c.left + h.canvasPosition.x, y: v.top - c.top + h.canvasPosition.y }
        }
        const ocultar = (i: number) => {
            haces.current[i]?.setAttribute("opacity", "0")
            nucleos.current[i]?.setAttribute("opacity", "0")
            impactos.current[i]?.setAttribute("opacity", "0")
        }

        // Cada tejado tiene su propio reloj: no caen a la vez ni a intervalos fijos.
        const siguiente = PANELES.map((_, i) => performance.now() + 900 + i * 600)
        const inicio = PANELES.map(() => -1)
        let raf = 0

        const frame = (t: number) => {
            raf = requestAnimationFrame(frame)
            if (!visible) return
            const sol = punto(SOL)
            PANELES.forEach((nombre, i) => {
                if (inicio[i] < 0) {
                    if (t < siguiente[i]) return ocultar(i)
                    inicio[i] = t
                }
                const p = (t - inicio[i]) / DURACION_MS
                if (p >= 1) {
                    inicio[i] = -1
                    siguiente[i] = t + PAUSA_MIN_MS + Math.random() * PAUSA_EXTRA_MS
                    return ocultar(i)
                }
                const panel = punto(nombre)
                if (!sol || !panel) return ocultar(i)
                const dx = panel.x - sol.x
                const dy = panel.y - sol.y
                const largo = Math.hypot(dx, dy)
                if (largo < 30) return ocultar(i)
                // Entra y sale suave, con un leve titileo.
                const envolvente = Math.pow(Math.sin(Math.PI * p), 0.8)
                const brillo = envolvente * (0.92 + Math.random() * 0.08)
                const nx = -dy / largo
                const ny = dx / largo
                const a = ANCHO_SOL / 2
                const b = (ANCHO_PANEL / 2) * (0.7 + 0.3 * envolvente)
                haces.current[i]?.setAttribute(
                    "points",
                    `${sol.x + nx * a},${sol.y + ny * a} ${panel.x + nx * b},${panel.y + ny * b} ${panel.x - nx * b},${panel.y - ny * b} ${sol.x - nx * a},${sol.y - ny * a}`,
                )
                const g = gradientes.current[i]
                g?.setAttribute("x1", String(sol.x))
                g?.setAttribute("y1", String(sol.y))
                g?.setAttribute("x2", String(panel.x))
                g?.setAttribute("y2", String(panel.y))
                const n = nucleos.current[i]
                n?.setAttribute("x1", String(sol.x))
                n?.setAttribute("y1", String(sol.y))
                n?.setAttribute("x2", String(panel.x))
                n?.setAttribute("y2", String(panel.y))
                const c = impactos.current[i]
                c?.setAttribute("cx", String(panel.x))
                c?.setAttribute("cy", String(panel.y))
                c?.setAttribute("r", String(10 + 22 * envolvente))
                haces.current[i]?.setAttribute("opacity", String(brillo * 0.85))
                n?.setAttribute("opacity", String(brillo * 0.6))
                c?.setAttribute("opacity", String(brillo))
            })
        }
        raf = requestAnimationFrame(frame)

        return () => {
            cancelAnimationFrame(raf)
            io.disconnect()
        }
    }, [contenedor])

    return (
        <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible" aria-hidden="true">
            <defs>
                <filter id="haz-difuso" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.2" />
                </filter>
                <radialGradient id="haz-impacto">
                    <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
                    <stop offset="0.35" stopColor="#FFE08A" stopOpacity="0.7" />
                    <stop offset="0.75" stopColor="#B07CFF" stopOpacity="0.3" />
                    <stop offset="1" stopColor="#B07CFF" stopOpacity="0" />
                </radialGradient>
                {PANELES.map((nombre, i) => (
                    <linearGradient
                        key={nombre}
                        id={`haz-color-${i}`}
                        ref={(el) => { gradientes.current[i] = el }}
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0" stopColor="#FFF4C2" stopOpacity="0.95" />
                        <stop offset="0.55" stopColor="#FFD84A" stopOpacity="0.6" />
                        <stop offset="1" stopColor="#B07CFF" stopOpacity="0.45" />
                    </linearGradient>
                ))}
            </defs>
            {PANELES.map((nombre, i) => (
                <g key={nombre}>
                    <polygon ref={(el) => { haces.current[i] = el }} opacity="0" fill={`url(#haz-color-${i})`} filter="url(#haz-difuso)" />
                    <line ref={(el) => { nucleos.current[i] = el }} opacity="0" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
                    <circle ref={(el) => { impactos.current[i] = el }} opacity="0" r="10" fill="url(#haz-impacto)" />
                </g>
            ))}
        </svg>
    )
}
