"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Phone,
  Mail,
  MessageCircle,
  Globe,
  Linkedin,
  Instagram,
  Facebook,
  MapPin,
  UserPlus,
  QrCode,
  Share2,
  Check,
} from "lucide-react"
import { getBackendUrl } from "@/lib/backend-url"

interface Redes {
  linkedin?: string | null
  instagram?: string | null
  facebook?: string | null
  web?: string | null
}

interface TarjetaPublica {
  slug: string
  nombre: string
  titulo?: string | null
  empresa: string
  foto_url?: string | null
  bio?: string | null
  telefono?: string | null
  whatsapp?: string | null
  email?: string | null
  sede?: string | null
  redes: Redes
  url_publica?: string | null
  qr_url?: string | null
  vcard_url?: string | null
}

// Deja solo dígitos para el enlace wa.me
const soloDigitos = (v?: string | null) => (v || "").replace(/[^\d]/g, "")

const iniciales = (nombre: string) =>
  nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("")

export default function TarjetaPage() {
  const params = useParams()
  const slug = params.slug as string
  const [tarjeta, setTarjeta] = useState<TarjetaPublica | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showQr, setShowQr] = useState(false)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (slug) fetchTarjeta()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const fetchTarjeta = async () => {
    try {
      setLoading(true)
      const backendUrl = getBackendUrl()
      const response = await fetch(`${backendUrl}/api/tarjetas/${slug}`)
      const result = await response.json()
      if (result.success && result.data) {
        setTarjeta(result.data)
      } else {
        setError(result.message || "Tarjeta no encontrada")
      }
    } catch (err) {
      console.error("Error fetching tarjeta:", err)
      setError("Error de conexión al cargar la tarjeta")
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const url = tarjeta?.url_publica || (typeof window !== "undefined" ? window.location.href : "")
    const shareData = {
      title: tarjeta ? `${tarjeta.nombre} — ${tarjeta.empresa}` : "Tarjeta SunCar",
      text: tarjeta?.titulo || "",
      url,
    }
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share(shareData)
      } catch {
        /* usuario canceló */
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-white/5 border border-white/10 p-8 animate-pulse">
          <div className="mx-auto h-28 w-28 rounded-full bg-white/10" />
          <div className="mt-6 mx-auto h-6 w-1/2 rounded bg-white/10" />
          <div className="mt-3 mx-auto h-4 w-2/3 rounded bg-white/10" />
          <div className="mt-8 space-y-3">
            <div className="h-12 rounded-xl bg-white/10" />
            <div className="h-12 rounded-xl bg-white/10" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !tarjeta) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4 text-center">
        <div>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
            <QrCode className="h-8 w-8 text-solar-radiance" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Tarjeta no disponible</h1>
          <p className="text-white/60 mb-8">{error || "No encontramos esta tarjeta de presentación."}</p>
          <Link
            href="https://suncarsrl.com"
            className="inline-flex items-center gap-2 rounded-full bg-solar-radiance px-6 py-3 font-semibold text-primary hover:brightness-105 transition"
          >
            Ir a SunCar
          </Link>
        </div>
      </div>
    )
  }

  const t = tarjeta
  const whatsappDigits = soloDigitos(t.whatsapp)
  const hasRedes = t.redes && (t.redes.linkedin || t.redes.instagram || t.redes.facebook || t.redes.web)

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden">
      {/* Glows de fondo con la marca */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-solar-radiance/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-24 h-72 w-72 rounded-full bg-volt-green/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-10">
        {/* Logo */}
        <Link href="https://suncarsrl.com" className="mb-6">
          <img src="/images/logo-horizontal-white.png" alt="SunCar" className="h-8 w-auto opacity-90" />
        </Link>

        {/* Tarjeta */}
        <div className="w-full overflow-hidden rounded-3xl bg-white shadow-2xl animate-elegant-scale-in">
          {/* Portada: verde marca uniforme con brillos sutiles y filo dorado */}
          <div className="relative h-32 overflow-hidden bg-primary">
            <div className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full bg-solar-radiance/20 blur-2xl" />
            <div className="pointer-events-none absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-volt-green/10 blur-2xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-icon-white.png" alt="" className="absolute right-4 top-4 h-6 w-auto opacity-60" />
            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-transparent via-solar-radiance to-transparent" />
          </div>

          {/* Cabecera con avatar */}
          <div className="px-6 pb-6">
            <div className="-mt-16 mb-5 flex justify-center">
              {t.foto_url ? (
                <img
                  src={t.foto_url}
                  alt={t.nombre}
                  className="h-32 w-32 rounded-full border-4 border-white bg-white object-cover object-top shadow-xl ring-1 ring-black/5"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-primary text-4xl font-bold text-white shadow-xl ring-1 ring-black/5">
                  {iniciales(t.nombre)}
                </div>
              )}
            </div>

            <div className="text-center">
              <h1 className="text-balance text-[1.7rem] font-bold leading-tight tracking-tight text-gray-900">
                {t.nombre}
              </h1>
              {t.titulo && (
                <p className="mt-1.5 text-[1.05rem] font-semibold text-primary">{t.titulo}</p>
              )}

              {/* Chip de empresa */}
              <div className="mt-4 flex justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo-icon.png" alt="" className="h-3.5 w-auto" />
                  {t.empresa}
                </span>
              </div>

              {/* Ubicación en su propia línea (soporta direcciones largas) */}
              {t.sede && (
                <p className="mx-auto mt-3 flex max-w-[17rem] items-start justify-center gap-1.5 text-sm leading-relaxed text-gray-500">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-solar-radiance" />
                  <span>{t.sede}</span>
                </p>
              )}
            </div>

            {t.bio && (
              <>
                <div className="mx-auto mb-4 mt-5 h-px w-16 bg-gray-200" />
                <p className="text-center text-[15px] leading-relaxed text-gray-600">{t.bio}</p>
              </>
            )}

            {/* CTA principal: Guardar contacto (vCard) */}
            {t.vcard_url && (
              <a
                href={t.vcard_url}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-semibold text-white shadow-lg transition hover:brightness-110"
              >
                <UserPlus className="h-5 w-5" />
                Guardar contacto
              </a>
            )}

            {/* Acciones rápidas: se reparten el ancho según cuántas existan */}
            <div className="mt-3 flex gap-3">
              {t.telefono && (
                <a
                  href={`tel:${t.telefono}`}
                  className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-gray-200 py-3 text-gray-700 transition hover:border-primary hover:text-primary"
                >
                  <Phone className="h-5 w-5" />
                  <span className="text-xs font-medium">Llamar</span>
                </a>
              )}
              {whatsappDigits && (
                <a
                  href={`https://wa.me/${whatsappDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-gray-200 py-3 text-gray-700 transition hover:border-[#25D366] hover:text-[#25D366]"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs font-medium">WhatsApp</span>
                </a>
              )}
              {t.email && (
                <a
                  href={`mailto:${t.email}`}
                  className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-gray-200 py-3 text-gray-700 transition hover:border-primary hover:text-primary"
                >
                  <Mail className="h-5 w-5" />
                  <span className="text-xs font-medium">Email</span>
                </a>
              )}
            </div>

            {/* Redes sociales */}
            {hasRedes && (
              <div className="mt-4 flex items-center justify-center gap-3">
                {t.redes.linkedin && (
                  <a
                    href={t.redes.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-primary hover:text-white"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {t.redes.instagram && (
                  <a
                    href={t.redes.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-primary hover:text-white"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {t.redes.facebook && (
                  <a
                    href={t.redes.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-primary hover:text-white"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {t.redes.web && (
                  <a
                    href={t.redes.web}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Sitio web"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-primary hover:text-white"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}

            {/* Utilidades: QR + Compartir */}
            <div className="mt-6 flex items-center justify-center gap-2 border-t border-gray-100 pt-4">
              {t.qr_url && (
                <button
                  onClick={() => setShowQr((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                >
                  <QrCode className="h-4 w-4" />
                  {showQr ? "Ocultar QR" : "Ver QR"}
                </button>
              )}
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
              >
                {copiado ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
                {copiado ? "Enlace copiado" : "Compartir"}
              </button>
            </div>

            {showQr && t.qr_url && (
              <div className="mt-4 flex flex-col items-center gap-2 animate-fade-in">
                <div className="rounded-2xl border border-gray-200 bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.qr_url} alt={`QR de ${t.nombre}`} className="h-44 w-44" />
                </div>
                <p className="text-xs text-gray-400">Escanea para abrir esta tarjeta</p>
              </div>
            )}
          </div>
        </div>

        {/* Pie */}
        <Link
          href="https://suncarsrl.com"
          className="mt-6 text-xs font-medium text-white/50 transition hover:text-white/80"
        >
          Tarjeta virtual · suncarsrl.com
        </Link>
      </div>
    </div>
  )
}
