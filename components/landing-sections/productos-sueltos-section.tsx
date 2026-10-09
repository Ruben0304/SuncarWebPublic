import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import Revelar from "./revelar"
import { ZONAS, type ZonaId } from "@/components/tienda/zonas"

// Cada tarjeta abre directamente su catálogo en /productos (el hash elige la zona).
const destacados: { zona: ZonaId; src: string; width: number; height: number }[] = [
  { zona: "paneles", src: "/equipos/panel.webp", width: 216, height: 360 },
  { zona: "inversor", src: "/equipos/inversor-felicity-5kw.webp", width: 266, height: 360 },
  { zona: "baterias", src: "/equipos/bateria-felicity-fla48100-5kwh.webp", width: 220, height: 360 },
  { zona: "protecciones", src: "/equipos/transferencial.webp", width: 132, height: 240 },
  { zona: "electrodomesticos", src: "/equipos/lavadora.webp", width: 262, height: 360 },
]

const categorias = destacados.map((d) => ({ ...d, ...ZONAS.find((z) => z.id === d.zona)! }))

export default function ProductosSueltosSection() {
  return (
    <section className="pt-4 pb-12 sm:pt-6 sm:pb-16 lg:pt-8 lg:pb-24 bg-[#F2F2EF]">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <span className="inline-block rounded-full bg-[#012928] px-4 py-1.5 text-sm font-semibold text-white">
              Tienda online
            </span>
            <h2 className="text-3xl font-bold leading-tight text-[#012928] sm:text-4xl lg:text-5xl">
              Productos en venta
            </h2>
            <p className="text-base leading-relaxed text-[#012928]/70 lg:text-lg">
              ¿Ya tienes tu sistema o quieres ampliarlo? Compra solo la pieza que te hace falta, con
              precios por provincia.
            </p>
          </div>

          <Link
            href="/productos"
            className="group inline-flex w-fit items-center gap-2 rounded-xl bg-[#012928] px-6 py-3.5 font-semibold text-white shadow-lg transition-transform duration-300 hover:-translate-y-0.5"
          >
            Ver toda la tienda
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">
          {categorias.map((categoria, i) => (
            // En móvil (2 columnas) la quinta tarjeta ocupa la fila entera en vez de quedar sola.
            <Revelar
              key={categoria.id}
              retraso={(i % 5) * 90}
              className={i === categorias.length - 1 && categorias.length % 2 ? "col-span-2 lg:col-span-1" : ""}
            >
            <Link
              href={`/productos#${categoria.id}`}
              className={`group flex h-full flex-col overflow-hidden rounded-3xl border border-[#012928]/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(1,41,40,0.45)]`}
            >
              <div className="relative flex h-40 items-center justify-center bg-[radial-gradient(circle_at_50%_60%,#ffffff_0%,#ECEDE8_75%)] sm:h-52">
                <Image
                  src={categoria.src}
                  alt={categoria.nombre}
                  width={categoria.width}
                  height={categoria.height}
                  sizes="160px"
                  className="h-[72%] w-auto object-contain drop-shadow-[0_12px_14px_rgba(1,41,40,0.18)] transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#012928] text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-4 sm:p-5">
                <h3 className="font-bold text-[#012928] sm:text-lg">{categoria.nombre}</h3>
                <p className="text-xs leading-snug text-[#012928]/60 sm:text-sm">{categoria.frase}</p>
              </div>
            </Link>
            </Revelar>
          ))}
        </div>
      </div>
    </section>
  )
}
