"use client";

import { useState, type ReactNode } from "react";
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
import type { Oferta } from "@/types/ofertas";

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

export function ModalElementos({ oferta, descripcion, cargando, error, abierto, onCerrar }: Props) {
  const [fotosRotas, setFotosRotas] = useState<Record<string, boolean>>({});
  const estado = Estado({ oferta, cargando, error });

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
      ) : oferta && oferta.elementos && oferta.elementos.length > 0 ? (
        <div className="space-y-4">
          {oferta.elementos.map((elemento, index) => {
            const clave = `${index}-${elemento.categoria || ""}-${elemento.descripcion || ""}`;
            const hayFoto = Boolean(elemento.foto) && !fotosRotas[clave];
            return (
              <div
                key={clave}
                className="rounded-lg border bg-gray-50 p-4 transition-colors hover:bg-gray-100"
              >
                <div className="flex items-start gap-4">
                  {hayFoto ? (
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                      <Image
                        src={elemento.foto as string}
                        alt={elemento.descripcion || "Elemento"}
                        fill
                        className="object-contain p-1"
                        sizes="64px"
                        quality={60}
                        onError={() => setFotosRotas((prev) => ({ ...prev, [clave]: true }))}
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border border-[#F2C300]/25 bg-[#F2C300]/15">
                      <ImageIcon className="h-6 w-6 text-[#F2C300]/80" aria-hidden="true" />
                    </div>
                  )}
                  <div className="flex-1">
                    {elemento.categoria && (
                      <Badge variant="outline" className="mb-2 text-xs">
                        {elemento.categoria}
                      </Badge>
                    )}
                    {elemento.descripcion && (
                      <h4 className="mb-1 font-semibold text-gray-900">{elemento.descripcion}</h4>
                    )}
                    {elemento.cantidad && (
                      <p className="text-sm text-gray-600">
                        Cantidad: <span className="font-medium">{elemento.cantidad}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
