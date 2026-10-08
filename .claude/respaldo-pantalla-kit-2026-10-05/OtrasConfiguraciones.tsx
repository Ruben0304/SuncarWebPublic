import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  otrasConfiguraciones,
  type KitConfigurable,
} from "@/lib/ofertas/configurador";
import { formatearPrecio } from "@/lib/ofertas/ofertas-publicas";
import { Settings2 } from "lucide-react";

// Las variantes del kit que ya tenemos armadas (otros paneles, otra batería,
// otro inversor), cada una con lo que cambia de precio. Son configuraciones por
// defecto: cualquier otra, más específica para el caso, se pide por contacto.

export default function OtrasConfiguraciones({
  actual,
  kits,
  moneda,
}: {
  actual: KitConfigurable | null;
  kits: KitConfigurable[];
  moneda: string;
}) {
  const grupos = actual ? otrasConfiguraciones(kits, actual) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <Settings2 className="h-6 w-6 text-[#012928]" aria-hidden="true" />
          Configuraciones disponibles
        </CardTitle>
      </CardHeader>
      <CardContent>
        {grupos.length > 0 && (
          <div className="space-y-6">
            {grupos.map((grupo) => (
              <section key={grupo.grupo} aria-label={grupo.titulo}>
                <h3 className="mb-2 text-sm font-semibold text-gray-500">{grupo.titulo}</h3>
                <div className="flex flex-col gap-3">
                  {grupo.opciones.map((o) => {
                    const cuerpo = (
                      <>
                        <span className="block min-w-0">
                          <span className="block text-[17px] leading-[1.24] tracking-[-0.022em] text-[#012928]">
                            {o.etiqueta}
                          </span>
                          {o.detalle && (
                            <span className="mt-1 block text-xs leading-[1.33] text-gray-600">
                              {o.detalle}
                            </span>
                          )}
                        </span>
                        <span className="block flex-shrink-0 text-right text-sm text-[#012928]">
                          {o.esActual ? (
                            <span className="font-semibold">Este kit</span>
                          ) : (
                            <>
                              <span className="block font-semibold">
                                {o.diferencia > 0 ? "+" : "−"}{" "}
                                {formatearPrecio(Math.abs(o.diferencia))} {moneda}
                              </span>
                              <span className="text-xs text-gray-600 underline underline-offset-2">
                                Ver este kit
                              </span>
                            </>
                          )}
                        </span>
                      </>
                    );
                    const clases = cn(
                      "flex min-h-[64px] w-full items-center justify-between gap-4 rounded-[12px] border p-[15px] text-left transition-colors",
                      o.esActual
                        ? "border-2 border-[#012928] p-[14px]"
                        : "border-[#86868b] bg-white hover:border-[#012928] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#012928]",
                    );
                    return o.esActual ? (
                      <div key={o.kit.id} className={clases} aria-current="true">
                        {cuerpo}
                      </div>
                    ) : (
                      <Link key={o.kit.id} href={`/ofertas/${o.kit.id}`} className={clases}>
                        {cuerpo}
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        <p
          className={cn(
            "text-sm leading-relaxed text-gray-600",
            grupos.length > 0 && "mt-6 border-t border-gray-200 pt-4",
          )}
        >
          Estas son las configuraciones por defecto que tenemos armadas. Si necesitas
          otra, más específica para tu caso, contáctanos y la preparamos contigo.
        </p>
      </CardContent>
    </Card>
  );
}
