"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { Bookmark, Heart, MapPin, Maximize2, MessageCircle, MoreHorizontal, Send, X } from "lucide-react"

import { useContacto } from "@/hooks/useContacto"

// La foto vive en el S3, no en el repo: 1600×900 en WebP y Next.js sirve el
// tamaño justo para cada pantalla. Va con carga diferida (sin `priority`) y un
// placeholder borroso de ~150 bytes en línea, así la página no la espera.
const FOTO_OFICINA = "https://s3.suncarsrl.com/photos/web/oficina-3ra-y-2-1600.webp"
const FOTO_OFICINA_BLUR =
  "data:image/webp;base64,UklGRpYAAABXRUJQVlA4IIoAAAAQBACdASoYAA0APu1iqk2ppaQiMAgBMB2JZgCsACFw49q7bc63VG5HwAD+n8WaeINYGD7UHNVhHgqIfcSP6rp681Izfj9Oz7IBYulJScF+QkjR0pNfIjj7NhSf7N6SLWrR1GsYhu8ZASqcP21yP+94Ol5kwedu/sfZp6dIJIAH375iiUhwbZ2eQAA="
const COMO_LLEGAR = "https://maps.app.goo.gl/73N6ZAft7J7c33tq9"
const INSTAGRAM = "https://www.instagram.com/suncar.srl"
const USUARIO = "suncar.srl"

/** La visita a la oficina, con el aspecto de una publicación de Instagram. */
export default function OficinasSection() {
  const { contacto } = useContacto()
  const [meGusta, setMeGusta] = useState(false)
  const [ampliada, setAmpliada] = useState(false)

  return (
    <section className="py-16 lg:py-20 bg-[#F2F2EF]">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
            Visita nuestras{" "}
            <span className="bg-gradient-to-r from-[#AFEB17] to-[#F2C300] text-[#012928] px-2 rounded-lg box-decoration-clone">
              oficinas
            </span>
          </h2>
        </div>

        <article className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-[#dbdbdb] bg-white text-[#0f1419] shadow-lg">
          {/* Cabecera: avatar, cuenta y ubicación */}
          <header className="flex items-center gap-3 px-3.5 py-3">
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] p-[2px]"
              aria-label={`Instagram de ${USUARIO}`}
            >
              <span className="block rounded-full bg-white p-[2px]">
                <Image
                  src="/images/logo-icon.webp"
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-contain"
                />
              </span>
            </a>
            <div className="min-w-0 flex-1 leading-tight">
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold hover:opacity-60"
              >
                {USUARIO}
              </a>
              <a
                href={COMO_LLEGAR}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-xs hover:opacity-60"
              >
                3ra y 2, Miramar, Playa
              </a>
            </div>
            <MoreHorizontal className="h-5 w-5 shrink-0" aria-hidden />
          </header>

          {/* La foto, en 16:9 como el original */}
          <button
            type="button"
            onClick={() => setAmpliada(true)}
            aria-label="Ver la foto a pantalla completa"
            className="group relative block aspect-[16/9] w-full cursor-zoom-in bg-[#efefef]"
          >
            <Image
              src={FOTO_OFICINA}
              alt="Oficinas de SUNCAR en Ave. 3ra y Calle 2, Miramar, con paneles solares en la azotea"
              fill
              sizes="(min-width: 896px) 896px, 100vw"
              quality={75}
              placeholder="blur"
              blurDataURL={FOTO_OFICINA_BLUR}
              className="object-cover"
            />
            <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-transform group-hover:scale-110">
              <Maximize2 className="h-4 w-4" />
            </span>
          </button>

          {/* Acciones */}
          <div className="flex items-center gap-4 px-3.5 pt-3">
            <button
              type="button"
              onClick={() => setMeGusta((v) => !v)}
              aria-pressed={meGusta}
              aria-label="Me gusta"
              className="transition-transform active:scale-125 hover:opacity-60"
            >
              <Heart
                className={`h-6 w-6 transition-colors ${meGusta ? "fill-[#ff3040] text-[#ff3040]" : ""}`}
              />
            </button>
            <a
              href={`https://wa.me/${contacto.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escríbenos por WhatsApp"
              className="hover:opacity-60"
            >
              <MessageCircle className="h-6 w-6 -scale-x-100" />
            </a>
            <a
              href={COMO_LLEGAR}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Cómo llegar"
              className="hover:opacity-60"
            >
              <Send className="h-6 w-6" />
            </a>
            <Bookmark className="ml-auto h-6 w-6" aria-hidden />
          </div>

          {/* Texto de la publicación */}
          <div className="space-y-1.5 px-3.5 pb-4 pt-2.5 text-sm">
            <p className="font-semibold">
              {meGusta ? "A ti y a muchos clientes les gusta esto" : "Les gusta a muchos clientes"}
            </p>
            <p className="leading-relaxed">
              <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="mr-1.5 font-semibold">
                {USUARIO}
              </a>
              ☀️ Nuestra oficina también funciona con el sol. Pasa por 3ra y 2 en Playa, conoce los
              inversores, baterías y paneles en funcionamiento y llévate tu propuesta personalizada.{" "}
              <span className="text-[#00376b]">#EnergíaSolar #Cuba #Miramar #SUNCAR</span>
            </p>
            <p className="text-[#737373]">📍 {contacto.direccion}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
              <a
                href={COMO_LLEGAR}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#0095f6] hover:text-[#00376b]"
              >
                <MapPin className="mr-1 inline h-4 w-4 align-[-3px]" />
                Cómo llegar
              </a>
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#737373] hover:text-[#0f1419]"
              >
                Ver más en Instagram
              </a>
            </div>
          </div>
        </article>
      </div>

      {ampliada && <FotoPantallaCompleta onCerrar={() => setAmpliada(false)} />}
    </section>
  )
}

/** La foto a pantalla completa. Solo entonces se pide la versión grande. */
function FotoPantallaCompleta({ onCerrar }: { onCerrar: () => void }) {
  useEffect(() => {
    const teclado = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar()
    }
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", teclado)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener("keydown", teclado)
    }
  }, [onCerrar])

  // En el body: así ningún contenedor con transform o z-index lo recorta.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Foto de nuestras oficinas"
      onClick={onCerrar}
      className="fixed inset-0 z-[80] flex cursor-zoom-out items-center justify-center bg-[rgba(0,0,0,0.94)] p-2 sm:p-6"
    >
      <div className="relative aspect-[16/9] max-h-full w-full max-w-[min(100%,calc((100vh-3rem)*16/9))]">
        <Image
          src={FOTO_OFICINA}
          alt="Oficinas de SUNCAR en Ave. 3ra y Calle 2, Miramar, con paneles solares en la azotea"
          fill
          sizes="100vw"
          placeholder="blur"
          blurDataURL={FOTO_OFICINA_BLUR}
          className="object-contain"
        />
      </div>
      <button
        type="button"
        onClick={onCerrar}
        autoFocus
        aria-label="Cerrar"
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
      >
        <X className="h-6 w-6" />
      </button>
    </div>,
    document.body,
  )
}
