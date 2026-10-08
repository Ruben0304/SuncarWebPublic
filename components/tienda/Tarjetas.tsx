"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Package, Plus, ArrowUpRight, Zap } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatearPrecio } from "@/lib/ofertas/ofertas-publicas";
import type { ArticuloTienda } from "@/types/tienda";
import type { OfertaSimplificada } from "@/types/ofertas";
import t from "./tienda.module.css";

const POR_UNIDAD: Record<string, string> = {
  pieza: "c/u",
  set: "por set",
  m: "por metro",
};

interface TarjetaProductoProps {
  producto: ArticuloTienda;
  onAgregar: (producto: ArticuloTienda) => void;
  onVer: (producto: ArticuloTienda) => void;
  compacta?: boolean;
  /** Las primeras tarjetas visibles no esperan al lazy-load. */
  prioritaria?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function TarjetaProducto({
  producto,
  onAgregar,
  onVer,
  compacta = false,
  prioritaria = false,
  className = "",
  style,
}: TarjetaProductoProps) {
  const cantidad = useCart(
    (s) => s.items.find((i) => i.producto.id === producto.id)?.cantidad ?? 0,
  );
  const updateQuantity = useCart((s) => s.updateQuantity);

  return (
    <article
      style={style}
      className={`group flex flex-col overflow-hidden rounded-[22px] bg-white ring-1 ring-[#012928]/[0.06] shadow-[0_10px_30px_-18px_rgba(1,41,40,0.45)] transition-shadow hover:shadow-[0_18px_40px_-18px_rgba(1,41,40,0.5)] ${className}`}
    >
      <button
        type="button"
        onClick={() => onVer(producto)}
        className="relative block aspect-square w-full bg-gradient-to-b from-[#F2F2EF] to-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#012928]"
        aria-label={`Ver detalles de ${producto.modelo}`}
      >
        {producto.foto ? (
          <Image
            src={producto.foto}
            alt=""
            fill
            sizes={compacta ? "(max-width: 768px) 45vw, 220px" : "(max-width: 768px) 64vw, 200px"}
            className="object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            loading={prioritaria ? "eager" : "lazy"}
          />
        ) : (
          <Package className="absolute inset-0 m-auto h-10 w-10 text-slate-300" />
        )}
        {producto.potenciaKW != null && producto.potenciaKW >= 1 && (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-0.5 rounded-full bg-[#AFEB17] px-2 py-0.5 text-[10px] font-bold text-[#012928]">
            <Zap className="h-2.5 w-2.5" />
            {producto.potenciaKW} kW
          </span>
        )}
        {producto.precio_por_cantidad && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-[#F2C300] px-2 py-0.5 text-[10px] font-bold text-[#012928]">
            Dto. volumen
          </span>
        )}
      </button>

      <div className={`flex flex-1 flex-col ${compacta ? "p-3" : "p-4"}`}>
        {producto.marca_nombre && (
          <span className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {producto.marca_nombre}
          </span>
        )}
        <h3
          className={`line-clamp-2 font-semibold leading-snug text-[#012928] ${
            compacta ? "text-[13px]" : "text-[15px]"
          }`}
        >
          {producto.modelo}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0">
            <span
              className={`font-bold tabular-nums text-[#012928] ${
                compacta ? "text-lg" : "text-2xl"
              }`}
            >
              ${formatearPrecio(producto.precio)}
            </span>
            <span className="ml-1 text-[11px] text-slate-400">
              {POR_UNIDAD[producto.unidad] ?? producto.unidad}
            </span>
          </div>

          {cantidad > 0 ? (
            <div
              key="paso"
              className={`${t.pop} flex h-10 shrink-0 items-center rounded-full bg-[#012928] text-white`}
            >
              <button
                type="button"
                onClick={() => updateQuantity(producto.id, cantidad - 1)}
                className="flex h-10 w-9 items-center justify-center rounded-l-full active:bg-white/10"
                aria-label="Quitar uno"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[1.25rem] text-center text-sm font-bold tabular-nums">
                {cantidad}
              </span>
              <button
                type="button"
                onClick={() => onAgregar(producto)}
                className="flex h-10 w-9 items-center justify-center rounded-r-full active:bg-white/10"
                aria-label="Agregar otro"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onAgregar(producto)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#012928] text-white shadow-[0_6px_16px_-6px_rgba(1,41,40,0.7)] transition-transform hover:scale-105 active:scale-90"
              aria-label={`Agregar ${producto.modelo} al carrito`}
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/** "Oferta de 1x 5kW Inversor…" → "1x 5kW Inversor…" */
export function nombreKit(kit: OfertaSimplificada): string {
  return kit.descripcion.replace(/^oferta de\s*/i, "");
}

interface TarjetaKitProps {
  kit: OfertaSimplificada;
  className?: string;
  style?: React.CSSProperties;
}

export function TarjetaKit({ kit, className = "", style }: TarjetaKitProps) {
  const contenido = (
    <>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A052D]">
        {kit.imagen && (
          <Image
            src={kit.imagen}
            alt=""
            fill
            sizes="(max-width: 768px) 75vw, 300px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#012928]/85 via-[#012928]/10 to-transparent" />
        {kit.potenciaInversor && (
          <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-[#AFEB17] to-[#F2C300] px-2.5 py-1 text-[11px] font-bold text-[#012928]">
            {kit.potenciaInversor}
          </span>
        )}
        {kit.descuentos && (
          <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#012928]">
            {kit.descuentos}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="line-clamp-2 text-[13px] font-medium leading-snug text-white/90">
            {nombreKit(kit)}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div>
          <span className="text-xl font-bold tabular-nums text-[#012928]">
            ${formatearPrecio(kit.precio)}
          </span>
          <span className="ml-1 text-[11px] text-slate-400">
            {kit.moneda} · con instalación
          </span>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F2F2EF] text-[#012928] transition-colors group-hover:bg-[#012928] group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </>
  );

  const clases = `group flex flex-col overflow-hidden rounded-[22px] bg-white ring-1 ring-[#012928]/[0.06] shadow-[0_10px_30px_-18px_rgba(1,41,40,0.45)] ${className}`;

  if (!kit.id) {
    return (
      <div className={clases} style={style}>
        {contenido}
      </div>
    );
  }
  return (
    <Link href={`/ofertas/${encodeURIComponent(kit.id)}`} className={clases} style={style}>
      {contenido}
    </Link>
  );
}

export function TarjetaFantasma({ className = "" }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-[22px] bg-white ring-1 ring-[#012928]/[0.06] ${className}`}
    >
      <div
        className={`${t.brillo} aspect-square bg-gradient-to-r from-[#F2F2EF] via-white to-[#F2F2EF]`}
      />
      <div className="space-y-2 p-4">
        <div className="h-3 w-3/4 rounded-full bg-[#F2F2EF]" />
        <div className="h-3 w-1/2 rounded-full bg-[#F2F2EF]" />
        <div className="h-6 w-1/3 rounded-full bg-[#F2F2EF]" />
      </div>
    </div>
  );
}
