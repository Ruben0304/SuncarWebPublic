"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { CheckCircle, Image as ImageIcon, Loader2, Package, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChipVoltaje } from "@/components/ofertas/ChipVoltaje";
import { ordenarElementosKit } from "@/lib/ofertas/elementos-kit";
import type { Oferta, OfertaElemento } from "@/types/ofertas";

// Los dos modales de la oferta: "Ver qué trae el kit" y "Ver garantías del
// kit". Tienen el mismo cuerpo que antes tenían las tarjetas de la página, con
// la cabecera fija y el contenido con scroll propio, y se cierran con la X,
// con Escape o tocando fuera.

function Modal({
  abierto,
  onCerrar,
  icono,
  titulo,
  descripcion,
  children,
}: {
  abierto: boolean;
  onCerrar: () => void;
  icono: ReactNode;
  titulo: string;
  descripcion: string;
  children: ReactNode;
}) {
  return (
    <Dialog open={abierto} onOpenChange={(abre) => !abre && onCerrar()}>
      <DialogContent className="flex max-h-[calc(100%-2rem)] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-200 px-6 pb-4 pt-6 pr-14 text-left">
          <DialogTitle className="flex items-center gap-3 text-xl">
            {icono}
            {titulo}
          </DialogTitle>
          <DialogDescription className="line-clamp-2">{descripcion}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-6 py-5">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

interface Props {
  /** null mientras se pide: el modal abre ya y muestra "cargando". */
  oferta: Oferta | null;
  /** Nombre del kit para la cabecera, que se conoce antes que el detalle. */
  descripcion: string;
  cargando?: boolean;
  error?: boolean;
  abierto: boolean;
  onCerrar: () => void;
}

/** "Cargando" o "no se pudo", o null si ya hay detalle que mostrar. */
function Estado({ oferta, cargando, error }: Pick<Props, "oferta" | "cargando" | "error">) {
  if (cargando) {
    return (
      <p role="status" className="flex items-center gap-2 text-gray-600">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Cargando…
      </p>
    );
  }
  if (error || !oferta) {
    return (
      <p role="alert" className="text-gray-600">
        No pudimos cargar el detalle del kit. Cierra e inténtalo de nuevo.
      </p>
    );
  }
  return null;
}

/** Una línea del kit: foto, categoría y nombre; la cantidad solo en los equipos principales. */
function ElementoKit({
  elemento,
  compacto,
  fotoRota,
  onFotoRota,
}: {
  elemento: OfertaElemento;
  /** Material complementario: más pequeño y sin cantidad. */
  compacto?: boolean;
  fotoRota: boolean;
  onFotoRota: () => void;
}) {
  const hayFoto = Boolean(elemento.foto) && !fotoRota;
  const lado = compacto ? "h-11 w-11" : "h-16 w-16";
  return (
    <div
      className={
        compacto
          ? "flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/70 p-2.5"
          : "flex items-start gap-4 rounded-lg border bg-gray-50 p-4 transition-colors hover:bg-gray-100"
      }
    >
      {hayFoto ? (
        <div
          className={`relative ${lado} flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white`}
        >
          <Image
            src={elemento.foto as string}
            alt={elemento.descripcion || "Elemento"}
            fill
            className="object-contain p-1"
            sizes={compacto ? "44px" : "64px"}
            quality={60}
            onError={onFotoRota}
          />
        </div>
      ) : (
        <div
          className={`flex ${lado} flex-shrink-0 items-center justify-center rounded-lg border border-[#F2C300]/25 bg-[#F2C300]/15`}
        >
          <ImageIcon
            className={`${compacto ? "h-4 w-4" : "h-6 w-6"} text-[#F2C300]/80`}
            aria-hidden="true"
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        {elemento.categoria && (
          <Badge
            variant="outline"
            className={compacto ? "mb-1 px-1.5 py-0 text-[10px]" : "mb-2 text-xs"}
          >
            {elemento.categoria}
          </Badge>
        )}
        {elemento.descripcion &&
          (compacto ? (
            <p className="text-sm leading-snug text-gray-800">{elemento.descripcion}</p>
          ) : (
            <h4 className="mb-1 font-semibold text-gray-900">{elemento.descripcion}</h4>
          ))}
        {!compacto && elemento.cantidad && (
          <p className="text-sm text-gray-600">
            Cantidad: <span className="font-medium">{elemento.cantidad}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export function ModalElementos({ oferta, descripcion, cargando, error, abierto, onCerrar }: Props) {
  const [fotosRotas, setFotosRotas] = useState<Record<string, boolean>>({});
  const estado = Estado({ oferta, cargando, error });
  const { principales, ademas } = useMemo(
    () => ordenarElementosKit(oferta?.elementos ?? []),
    [oferta],
  );
  const clave = (e: OfertaElemento, i: number) =>
    `${i}-${e.codigo || ""}-${e.categoria || ""}-${e.descripcion || ""}`;
  const pintar = (lista: OfertaElemento[], compacto: boolean) =>
    lista.map((elemento, index) => {
      const k = clave(elemento, index);
      return (
        <ElementoKit
          key={k}
          elemento={elemento}
          compacto={compacto}
          fotoRota={Boolean(fotosRotas[k])}
          onFotoRota={() => setFotosRotas((prev) => ({ ...prev, [k]: true }))}
        />
      );
    });

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      icono={<Package className="h-6 w-6 text-[#012928]" aria-hidden="true" />}
      titulo="Elementos incluidos"
      descripcion={descripcion}
    >
      {estado ? (
        estado
      ) : principales.length + ademas.length > 0 ? (
        <div>
          {oferta?.voltaje && (
            <p className="mb-4 flex items-center gap-2 text-sm text-gray-600">
              <ChipVoltaje voltaje={oferta.voltaje} />
              Kit para instalaciones de {oferta.voltaje} V
            </p>
          )}
          {principales.length > 0 && <div className="space-y-4">{pintar(principales, false)}</div>}

          {ademas.length > 0 && (
            <section aria-labelledby="kit-ademas" className={principales.length > 0 ? "mt-7" : ""}>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px flex-1 bg-gray-200" aria-hidden="true" />
                <h3
                  id="kit-ademas"
                  className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500"
                >
                  {principales.length > 0 ? "Además incluye" : "Incluye"}
                </h3>
                <span className="h-px flex-1 bg-gray-200" aria-hidden="true" />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">{pintar(ademas, true)}</div>
            </section>
          )}

          <p className="mt-6 border-t border-gray-100 pt-4 text-[11px] leading-relaxed text-gray-500">
            El material complementario puede diferir del que aparece en las fotos, y la cantidad
            a utilizar se determina según las características de cada instalación.
          </p>
        </div>
      ) : (
        <p className="italic text-gray-500">No hay elementos especificados para esta oferta.</p>
      )}
    </Modal>
  );
}

export function ModalGarantias({ oferta, descripcion, cargando, error, abierto, onCerrar }: Props) {
  const estado = Estado({ oferta, cargando, error });
  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      icono={<Shield className="h-6 w-6 text-[#012928]" aria-hidden="true" />}
      titulo="Garantías incluidas"
      descripcion={descripcion}
    >
      {estado ? (
        estado
      ) : oferta && oferta.garantias && oferta.garantias.length > 0 ? (
        <div className="space-y-4">
          <div className="space-y-3">
            {oferta.garantias.map((garantia, index) => (
              <div key={index} className="flex items-start gap-3 rounded-lg bg-green-50 p-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" aria-hidden="true" />
                <span className="text-gray-700">{garantia}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
              <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-gray-700">
                Cualquier intervención de terceros anulará automáticamente la cobertura de
                garantía realizada por nuestro equipo de profesionales certificados de SUNCAR.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="italic text-gray-500">No hay garantías especificadas para esta oferta.</p>
      )}
    </Modal>
  );
}
