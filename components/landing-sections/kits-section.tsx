"use client"

import { Fragment, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { motion, useInView, useReducedMotion, type Variants } from "motion/react"
// Import estático: Next genera el placeholder borroso y sirve AVIF/WebP al tamaño justo.
// La foto tiene fondo transparente para fundirse con el verde de la sección.
import kitSolar from "@/public/images/home/kit-solar.webp"

const terminos = [
  { nombre: "Inversor", src: "/equipos/inversor-felicity-5kw.webp", width: 266, height: 360 },
  { nombre: "Batería", src: "/equipos/bateria-felicity-fla48100-5kwh.webp", width: 220, height: 360 },
  { nombre: "Paneles", src: "/equipos/panel.webp", width: 216, height: 360 },
  { nombre: "Elementos varios", src: "/equipos/gabinete.webp", width: 257, height: 240 },
]

// Chispas de energía que suben alrededor del kit (posiciones fijas para que no cambien entre renders).
const chispas = [
  { x: "8%", y: "70%", d: 5.5, r: 0, c: "#AFEB17" },
  { x: "18%", y: "30%", d: 6.5, r: 1.8, c: "#F2C300" },
  { x: "30%", y: "85%", d: 5, r: 3.1, c: "#AFEB17" },
  { x: "52%", y: "15%", d: 7, r: 0.9, c: "#F2C300" },
  { x: "68%", y: "78%", d: 6, r: 2.4, c: "#AFEB17" },
  { x: "82%", y: "40%", d: 5.8, r: 4, c: "#F2C300" },
  { x: "92%", y: "65%", d: 6.8, r: 1.2, c: "#AFEB17" },
  { x: "44%", y: "55%", d: 7.5, r: 3.6, c: "#F2C300" },
]

const SUAVE = [0.22, 1, 0.36, 1] as const
// La máscara del barrido pide la misma versión optimizada que ya cargó la foto (AVIF ligero).
const MASCARA = `url(/_next/image?url=${encodeURIComponent(kitSolar.src)}&w=640&q=75)`

// Momento en que la ecuación termina y el kit se "enciende".
const ENCENDIDO = 1.55

const ecuacion: Variants = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
}
const termino: Variants = {
  oculto: { opacity: 0, y: 14, scale: 0.9, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.7, ease: SUAVE } },
}
// Destello verde que recorre cada casilla al aparecer, como corriente pasando.
const casilla: Variants = {
  oculto: { boxShadow: "0 0 0 0 rgba(175,235,23,0)", borderColor: "rgba(255,255,255,0.1)" },
  visible: {
    boxShadow: ["0 0 0 0 rgba(175,235,23,0)", "0 0 28px 2px rgba(175,235,23,0.45)", "0 0 0 0 rgba(175,235,23,0)"],
    borderColor: ["rgba(255,255,255,0.1)", "rgba(175,235,23,0.8)", "rgba(255,255,255,0.1)"],
    transition: { duration: 1.1, ease: "easeOut", times: [0, 0.35, 1] },
  },
}
const signo: Variants = {
  oculto: { opacity: 0, rotate: -90, scale: 0.3 },
  visible: { opacity: 1, rotate: 0, scale: 1, transition: { duration: 0.5, ease: SUAVE } },
}
const palabras: Variants = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.09 } },
}
const palabra: Variants = {
  oculto: { opacity: 0, y: "70%", filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: SUAVE } },
}

export default function KitsSection() {
  const ref = useRef<HTMLElement>(null)
  const enVista = useInView(ref, { once: true, amount: 0.4 })
  const sinMovimiento = useReducedMotion()
  const estado = enVista || sinMovimiento ? "visible" : "oculto"
  const animar = enVista && !sinMovimiento

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#012928] text-white">
      {/* Retícula muy tenue que da profundidad sin competir con el kit */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_70%_50%,black,transparent_70%)]" />

      <div className="container relative mx-auto grid items-center gap-10 px-6 py-14 md:grid-cols-2 md:gap-8 md:px-8 lg:py-16">
        {/* Texto */}
        <div>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
            <span className="h-px w-10 bg-white/30" />
            Kits fotovoltaicos
          </p>

          <h2 className="mt-5 text-4xl font-bold leading-[0.95] tracking-tight lg:text-5xl xl:text-6xl">
            Un kit.
            <span className="block text-white/35">Cero apagones.</span>
          </h2>

          {/* Inversor + Batería + Paneles + Elementos varios = Tu próximo kit */}
          <motion.div
            variants={ecuacion}
            initial="oculto"
            animate={estado}
            className="mt-8 max-w-md"
            aria-label="Inversor más batería más paneles más elementos varios es igual a tu próximo kit"
          >
            <div className="flex items-start justify-between gap-1" aria-hidden="true">
              {terminos.map((t, i) => (
                <Fragment key={t.nombre}>
                  {i > 0 && (
                    <motion.span variants={signo} className="flex h-14 items-center text-lg font-light text-white/40 lg:h-16">
                      +
                    </motion.span>
                  )}
                  <motion.div variants={termino} className="flex w-14 flex-col items-center gap-2 lg:w-16">
                    <motion.div
                      variants={casilla}
                      className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-white/[0.04] backdrop-blur-sm lg:h-16 lg:w-16"
                    >
                      <Image
                        src={t.src}
                        alt=""
                        width={t.width}
                        height={t.height}
                        sizes="64px"
                        className="h-[62%] w-auto object-contain"
                      />
                    </motion.div>
                    <span className="text-center text-[11px] font-semibold leading-tight text-white/70">{t.nombre}</span>
                  </motion.div>
                </Fragment>
              ))}
            </div>

            <div className="mt-5 flex items-baseline gap-3" aria-hidden="true">
              <motion.span variants={signo} className="text-3xl font-light text-white/40">
                =
              </motion.span>
              <motion.span variants={palabras} className="flex gap-[0.25em] text-3xl font-bold tracking-tight lg:text-4xl">
                <motion.span variants={palabra} className="inline-block">Tu</motion.span>
                <motion.span variants={palabra} className="inline-block">próximo</motion.span>
                <motion.span
                  variants={palabra}
                  className="inline-block bg-gradient-to-r from-[#AFEB17] to-[#F2C300] bg-clip-text text-transparent"
                >
                  kit
                </motion.span>
              </motion.span>
            </div>
          </motion.div>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="/ofertas"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-[#012928] transition-transform duration-300 hover:-translate-y-0.5"
            >
              Ver kits
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            {/* Borde de luz giratorio, al estilo Apple Intelligence */}
            <Link
              href="/ofertas?modo=armar"
              className="group relative inline-flex overflow-hidden rounded-full p-px"
            >
              <motion.span
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 aspect-square w-[160%] bg-[conic-gradient(from_0deg,#AFEB17,#F2C300,#ffffff,#AFEB17)]"
                style={{ x: "-50%", y: "-50%" }}
                animate={sinMovimiento ? undefined : { rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative inline-flex items-center gap-2 rounded-full bg-[#012928] px-6 py-3.5 font-semibold text-white transition-colors duration-300 group-hover:bg-[#023b39]">
                <Sparkles className="h-4 w-4 text-[#F2C300]" />
                Kit sugerido para ti con IA
              </span>
            </Link>
          </div>
        </div>

        {/* El kit: siempre visible; al cerrar la ecuación se "enciende" */}
        <div className="relative mx-auto w-full max-w-[340px] md:max-w-[500px]">
          {/* Halo que late detrás del kit */}
          <motion.div
            className="pointer-events-none absolute -inset-[10%] rounded-full bg-[radial-gradient(closest-side,rgba(242,195,0,0.22),rgba(175,235,23,0.08)_55%,transparent)]"
            initial={{ opacity: 0.45, scale: 0.85 }}
            animate={
              animar
                ? { opacity: [0.45, 1, 0.7, 0.9, 0.7], scale: [0.85, 1.08, 1, 1.03, 1] }
                : { opacity: 0.7, scale: 1 }
            }
            transition={
              animar
                ? { delay: ENCENDIDO, duration: 6, times: [0, 0.12, 0.4, 0.7, 1], repeat: Infinity, repeatType: "mirror" }
                : undefined
            }
          />

          {/* Chispas */}
          {chispas.map((c, i) => (
            <motion.span
              key={i}
              className="pointer-events-none absolute h-1 w-1 rounded-full"
              style={{ left: c.x, top: c.y, backgroundColor: c.c, boxShadow: `0 0 8px ${c.c}` }}
              initial={{ opacity: 0 }}
              animate={animar ? { opacity: [0, 0.9, 0], y: [0, -46] } : { opacity: 0 }}
              transition={animar ? { delay: ENCENDIDO + c.r, duration: c.d, repeat: Infinity, ease: "easeOut" } : undefined}
            />
          ))}

          <motion.div
            className="relative"
            animate={animar ? { y: [0, -8, 0] } : { y: 0 }}
            transition={animar ? { delay: ENCENDIDO, duration: 6, repeat: Infinity, ease: "easeInOut" } : undefined}
          >
            <Image
              src={kitSolar}
              alt="Kit solar completo: paneles fotovoltaicos, inversor y batería Felicity Solar"
              sizes="(max-width: 768px) 90vw, 500px"
              placeholder="blur"
              className="relative h-auto w-full"
            />

            {/* Barrido de luz recortado con la silueta del kit */}
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden"
              style={{
                WebkitMaskImage: MASCARA,
                maskImage: MASCARA,
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
              }}
            >
              <motion.div
                className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent"
                initial={{ x: "0%" }}
                animate={animar ? { x: ["0%", "400%"] } : { x: "0%" }}
                transition={
                  animar
                    ? { delay: ENCENDIDO, duration: 1.4, ease: [0.45, 0, 0.2, 1], repeat: Infinity, repeatDelay: 5 }
                    : undefined
                }
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
