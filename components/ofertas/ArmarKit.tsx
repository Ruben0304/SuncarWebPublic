"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CircleMinus,
  ChevronDown,
  CirclePlus,
} from "lucide-react";
import { ChipVoltaje, etiquetaVoltaje } from "@/components/ofertas/ChipVoltaje";
import ElegirConIA from "@/components/ofertas/ElegirConIA";
import { ModalElementos, ModalGarantias } from "@/components/ofertas/ModalesKit";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { useContacto } from "@/hooks/useContacto";
import { cn } from "@/lib/utils";
import { FOTOS_FIJAS, fotoDeEquipo, type FotoEquipo } from "@/lib/ofertas/fotos-equipos";
import { formatearPrecio } from "@/lib/ofertas/ofertas-publicas";
import {
  AYUDA_PASO,
  CAPTION_PASO,
  GRUPOS,
  GRUPO_DE,
  PASOS,
  SELECCION_VACIA,
  alternativas,
  ayudaBateria,
  ayudaInversor,
  ayudaPaneles,
  ayudaVarianteBateria,
  ayudaVarianteInversor,
  detalleOpcion,
  esVariante,
  etiquetaBateria,
  etiquetaBateriaCompleta,
  etiquetaInversor,
  etiquetaInversorCompleta,
  etiquetaPaneles,
  etiquetaPotenciaBateria,
  etiquetaPotenciaInversor,
  etiquetaVarianteBateria,
  etiquetaVarianteInversor,
  kitElegido,
  kitReferencia,
  kitsCompatibles,
  kitsConfigurables,
  normalizar,
  opciones,
  seleccionDeKit,
  voltajesDisponibles,
  type GrupoKit,
  type KitConfigurable,
  type OpcionKit,
  type PasoKit,
  type SeleccionKit,
} from "@/lib/ofertas/configurador";
import type { Oferta, OfertaSimplificada } from "@/types/ofertas";

// "Armar mi kit", con el diseño del configurador de Apple (Mac Studio): foto
// fija a la izquierda y, a la derecha, un paso a la vez con filas a todo el
// ancho. Cada paso solo deja elegir lo que existe como kit publicado; lo demás
// se ve apagado y, al tocarlo, explica con qué cambio sí hay kit. El resultado
// es siempre un kit real, el mismo que se ve en el listado.

const PASO_INFO: Record<
  PasoKit,
  { titulo: string; subtitulo: string; nombre: string; sinKit: string }
> = {
  inversor: {
    titulo: "Inversor.",
    subtitulo: "Elige la potencia que necesitas.",
    nombre: "inversor",
    sinKit: "",
  },
  inversorConfig: {
    titulo: "Instalación del inversor.",
    subtitulo: "Elige cómo lograr esa potencia.",
    nombre: "instalación del inversor",
    sinKit: "",
  },
  bateria: {
    titulo: "Batería.",
    subtitulo: "Elige cuánta reserva quieres.",
    nombre: "batería",
    sinKit: "Sin kit con este inversor",
  },
  bateriaConfig: {
    titulo: "Instalación de la batería.",
    subtitulo: "Elige cómo lograr esa capacidad.",
    nombre: "instalación de la batería",
    sinKit: "",
  },
  paneles: {
    titulo: "Paneles.",
    subtitulo: "Elige cuánta energía quieres generar.",
    nombre: "cantidad de paneles",
    sinKit: "Sin kit con esta combinación",
  },
};

const NOMBRE_DESCARTADO: Record<PasoKit, string> = {
  inversor: "inversor",
  inversorConfig: "instalación del inversor",
  bateria: "batería",
  bateriaConfig: "instalación de la batería",
  paneles: "paneles",
};

const TITULO_GRUPO: Record<GrupoKit, string> = {
  inversor: "Inversor",
  bateria: "Batería",
  paneles: "Paneles",
};

function etiquetaDe(paso: PasoKit, opcion: OpcionKit): string {
  const c = opcion.config;
  switch (paso) {
    case "inversor":
      return etiquetaPotenciaInversor(c);
    case "inversorConfig":
      return etiquetaVarianteInversor(c);
    case "bateria":
      return etiquetaPotenciaBateria(c);
    case "bateriaConfig":
      return etiquetaVarianteBateria(c);
    case "paneles":
      return etiquetaPaneles(c);
  }
}

function ayudaDe(paso: PasoKit, opcion: OpcionKit): string {
  const c = opcion.config;
  switch (paso) {
    case "inversor":
      return ayudaInversor(c);
    case "inversorConfig":
      return ayudaVarianteInversor(c);
    case "bateria":
      return ayudaBateria(c);
    case "bateriaConfig":
      return ayudaVarianteBateria(c);
    case "paneles":
      return ayudaPaneles(c);
  }
}

/** Lo que va a la derecha de la fila: "Desde X", "Incluido" o "+ X". */
function textoPrecio(
  opcion: OpcionKit,
  elegida: OpcionKit | undefined,
  moneda: string,
): string | null {
  if (opcion.desde === null) return null;
  if (!elegida || elegida.desde === null) {
    return `Desde ${formatearPrecio(opcion.desde)} ${moneda}`;
  }
  if (opcion.clave === elegida.clave) return "Incluido";
  const diferencia = opcion.desde - elegida.desde;
  if (diferencia === 0) return "Mismo precio";
  return `${diferencia > 0 ? "+" : "−"} ${formatearPrecio(Math.abs(diferencia))} ${moneda}`;
}

// ─── La foto de la izquierda ────────────────────────────────────────────────

/** Alto en pantalla de cada equipo: crece con su tamaño real, sin pasarse. */
const altoEnPantalla = (altoM: number) =>
  Math.round(Math.min(310, Math.max(210, 225 * Math.sqrt(altoM / 0.55))));

interface Ranura {
  clave: PasoKit;
  etiqueta: string;
  foto: FotoEquipo | null;
  copias: number;
  elegida: boolean;
  alto: number;
  /** Cuánto se tapan entre sí las copias de una misma pieza, en px sin escalar. */
  solape: number;
}

function Escaparate({
  kit,
  seleccion,
  indiceVisible,
  onAnterior,
  onSiguiente,
}: {
  kit: KitConfigurable | null;
  seleccion: SeleccionKit;
  indiceVisible: number;
  onAnterior: (() => void) | null;
  onSiguiente: (() => void) | null;
}) {
  const ranuras: Ranura[] = [];
  if (kit) {
    const c = kit.config;
    const inversor = fotoDeEquipo(c.inversorCodigo, null, 0.55);
    ranuras.push({
      clave: "inversor",
      etiqueta: etiquetaInversor(c),
      foto: inversor,
      copias: Math.min(c.inversorUnidades, 3),
      elegida: seleccion.inversor !== null,
      alto: altoEnPantalla(inversor?.altoM ?? 0.55),
      solape: 24,
    });
    if (indiceVisible >= 1 && c.bateriaUnidades > 0) {
      const bateria = fotoDeEquipo(c.bateriaCodigo, null, 0.62);
      ranuras.push({
        clave: "bateria",
        etiqueta: etiquetaBateria(c),
        foto: bateria,
        copias: Math.min(c.bateriaUnidades, 3),
        elegida: seleccion.bateria !== null,
        alto: altoEnPantalla(bateria?.altoM ?? 0.62),
        solape: 24,
      });
    }
    if (indiceVisible >= 2) {
      ranuras.push({
        clave: "paneles",
        etiqueta: etiquetaPaneles(c),
        foto: c.paneles > 0 ? FOTOS_FIJAS.panel : null,
        copias: Math.min(c.paneles, 3),
        elegida: seleccion.paneles !== null,
        alto: 220,
        solape: Math.round(220 * FOTOS_FIJAS.panel.aspecto * 0.4),
      });
    }
  }

  // La fila de equipos se encoge para caber en el ancho real de la tarjeta,
  // sea cual sea el kit y la ventana.
  const cajaRef = useRef<HTMLDivElement>(null);
  const [anchoCaja, setAnchoCaja] = useState(620);
  useEffect(() => {
    const caja = cajaRef.current;
    if (!caja) return;
    const medir = () => setAnchoCaja(caja.clientWidth);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(caja);
    return () => observador.disconnect();
  }, []);

  const HUECO = 24;
  const anchoDe = (r: Ranura) =>
    r.foto
      ? Math.round(r.alto * r.foto.aspecto) * r.copias - (r.copias - 1) * r.solape
      : 80;
  const anchoTotal =
    ranuras.reduce((n, r) => n + anchoDe(r), 0) + HUECO * Math.max(0, ranuras.length - 1);
  const escala = Math.max(
    0.2,
    Math.min(1, Math.floor(((anchoCaja - 8) / Math.max(anchoTotal, 1)) * 100) / 100),
  );

  return (
    <div className="relative flex h-[440px] flex-col overflow-hidden rounded-[28px] bg-[#F5F5F7] p-6 sm:p-[30px] lg:sticky lg:top-28 lg:h-[calc(100vh-8rem)] lg:max-h-[640px] lg:min-h-[540px]">
      <p className="max-w-[26rem] text-[17px] font-semibold leading-[1.35] tracking-[-0.022em] text-[#6e6e73]">
        {CAPTION_PASO[GRUPOS[indiceVisible]]}
      </p>

      <div
        ref={cajaRef}
        className="flex flex-1 items-center justify-center pb-[72px]"
      >
        <div
          className="flex items-end justify-center gap-6"
          style={{ ["--k" as string]: escala }}
        >
          {ranuras.map((r) => (
            <figure
              key={r.clave}
              className={cn(
                "flex flex-col items-center transition-opacity duration-500",
                r.elegida ? "opacity-100" : "opacity-40",
              )}
            >
              <div
                className="flex items-end"
                style={{ minHeight: `calc(${r.alto}px * var(--k))` }}
              >
                {r.foto
                  ? Array.from({ length: r.copias }).map((_, i) => (
                      <Image
                        key={i}
                        src={r.foto!.src}
                        alt={r.clave === "paneles" ? "Panel solar" : r.etiqueta}
                        width={Math.round(r.alto * r.foto!.aspecto)}
                        height={r.alto}
                        sizes="200px"
                        className="drop-shadow-md"
                        style={{
                          height: `calc(${r.alto}px * var(--k))`,
                          width: "auto",
                          marginLeft: i > 0 ? `calc(-${r.solape}px * var(--k))` : undefined,
                        }}
                      />
                    ))
                  : null}
              </div>
              <figcaption className="mt-3 whitespace-nowrap text-sm font-semibold text-[#6e6e73]">
                {r.etiqueta}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Puntos y flechas: los tres pasos, como el carrusel de Apple. */}
      <div className="absolute inset-x-0 bottom-[30px] flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={onAnterior ?? undefined}
          disabled={!onAnterior}
          aria-label="Paso anterior"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8e8ed] text-[#1d1d1f] transition-opacity disabled:opacity-40 lg:h-9 lg:w-9"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex h-[38px] items-center gap-[14px] rounded-full bg-[#e8e8ed] px-5">
          {GRUPOS.map((p, i) => (
            <span
              key={p}
              className={cn(
                "h-[7px] w-[7px] rounded-full transition-colors",
                i === indiceVisible ? "bg-[#1d1d1f]" : "bg-[#86868b]",
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onSiguiente ?? undefined}
          disabled={!onSiguiente}
          aria-label="Volver al paso actual"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8e8ed] text-[#1d1d1f] transition-opacity disabled:opacity-40 lg:h-9 lg:w-9"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// ─── La columna de la derecha ───────────────────────────────────────────────

// Amplía el área de toque a ~44 px en móvil sin cambiar el layout.
const TACTIL =
  "relative before:absolute before:-inset-x-2 before:-inset-y-3 before:content-[''] lg:before:hidden";

const FILA =
  "flex w-full min-h-[83px] items-center justify-between rounded-[12px] border border-[#86868b] bg-white p-[15px] text-left transition-colors";

function CuerpoFila({
  titulo,
  ayuda,
  detalle,
  derecha,
}: {
  titulo: string;
  ayuda?: string | null;
  detalle?: string | null;
  derecha: string | null;
}) {
  return (
    <>
      <span className="block max-w-[60%] basis-[60%] pr-[3%]">
        <span className="block text-[17px] leading-[1.24] tracking-[-0.022em] text-[#012928]">
          {titulo}
        </span>
        {ayuda && (
          <span className="mt-1 block text-[13px] font-semibold leading-[1.33] tracking-[-0.01em] text-[#012928] lg:text-[12px]">
            {ayuda}
          </span>
        )}
        {detalle && (
          <span className="mt-1 block text-[13px] leading-[1.33] tracking-[-0.01em] text-[#012928] lg:text-[12px]">
            {detalle}
          </span>
        )}
      </span>
      <span className="block max-w-[40%] basis-[40%] text-right text-[13px] leading-[1.33] lg:text-[12px] tracking-[-0.01em] text-[#012928]">
        {derecha}
      </span>
    </>
  );
}

function FilaOpcion({
  paso,
  opcion,
  elegida,
  seleccionada,
  moneda,
  onElegir,
}: {
  paso: PasoKit;
  opcion: OpcionKit;
  elegida: OpcionKit | undefined;
  seleccionada: boolean;
  moneda: string;
  onElegir: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={seleccionada}
      aria-disabled={!opcion.disponible}
      onClick={onElegir}
      className={cn(
        FILA,
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#012928]",
        seleccionada
          ? "border-2 border-[#012928] p-[14px]"
          : "hover:border-[#8f8f94]",
        !opcion.disponible && "opacity-[.42]",
      )}
    >
      <CuerpoFila
        titulo={etiquetaDe(paso, opcion)}
        ayuda={opcion.disponible ? ayudaDe(paso, opcion) : null}
        detalle={opcion.disponible ? detalleOpcion(paso, opcion.config, opcion.kits) : null}
        derecha={
          opcion.disponible
            ? textoPrecio(opcion, elegida, moneda)
            : PASO_INFO[paso].sinKit
        }
      />
    </button>
  );
}

/** Un paso ya resuelto: queda su fila elegida con "Editar", como en Apple. */
function FilaResuelta({
  paso,
  opcion,
  onEditar,
}: {
  paso: PasoKit;
  opcion: OpcionKit;
  onEditar: () => void;
}) {
  return (
    <div className={cn(FILA, "border-2 border-[#012928] p-[14px]")}>
      <CuerpoFila
        titulo={etiquetaDe(paso, opcion)}
        detalle={detalleOpcion(paso, opcion.config, opcion.kits)}
        derecha={null}
      />
      <button
        type="button"
        onClick={onEditar}
        className={cn(TACTIL, "text-sm text-[#012928] underline underline-offset-2 hover:no-underline")}
      >
        Editar
      </button>
    </div>
  );
}

function CajaDudas({
  paso,
  abierta,
  onAlternar,
}: {
  paso: PasoKit;
  abierta: boolean;
  onAlternar: () => void;
}) {
  const Icono = abierta ? CircleMinus : CirclePlus;
  return (
    <div className="mt-5 rounded-[12px] bg-[#F5F5F7]">
      <button
        type="button"
        onClick={onAlternar}
        aria-expanded={abierta}
        className="flex w-full items-start justify-between gap-3 p-[15px] text-left"
      >
        <span className="text-sm leading-[1.43] tracking-[-0.016em] text-[#1d1d1f]">
          <span className="block font-semibold">
            ¿No sabes qué {PASO_INFO[paso].nombre} elegir?
          </span>
          <span className="block">Conoce cómo decidir cuál te conviene.</span>
        </span>
        <Icono className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1d1d1f]" aria-hidden="true" />
      </button>
      {abierta && (
        <p className="px-[15px] pb-[15px] text-sm leading-[1.43] tracking-[-0.016em] text-[#6e6e73]">
          {AYUDA_PASO[paso]}
        </p>
      )}
    </div>
  );
}

export default function ArmarKit({
  ofertas,
  kitInicial = null,
  onVerListado,
}: {
  ofertas: OfertaSimplificada[];
  /** Número del kit con el que arranca ya elegido (viene del listado o de un enlace). */
  kitInicial?: string | null;
  onVerListado?: () => void;
}) {
  const { contacto } = useContacto();
  const kits = useMemo(() => kitsConfigurables(ofertas), [ofertas]);
  const kitDeInicio = kitInicial
    ? kits.find((k) => k.id === kitInicial || k.idInterno === kitInicial) ?? null
    : null;
  const [seleccion, setSeleccion] = useState<SeleccionKit>(
    () =>
      normalizar(kits, kitDeInicio ? seleccionDeKit(kitDeInicio.config) : SELECCION_VACIA)
        .seleccion,
  );
  const [editando, setEditando] = useState<PasoKit | null>(null);
  // Solo decide algo si hay dos kits iguales que se diferencian en el voltaje.
  const [voltajeElegido, setVoltajeElegido] = useState<number | null>(
    kitDeInicio?.voltaje ?? null,
  );
  const [dudaAbierta, setDudaAbierta] = useState<PasoKit | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [iaAbierta, setIaAbierta] = useState(false);
  const rejilla = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const [ctaVisible, setCtaVisible] = useState(false);
  // "Ver qué trae el kit" y "Ver garantías del kit": el detalle se pide al
  // abrir el modal (la lista de kits no trae los elementos) y se recuerda.
  const [modal, setModal] = useState<"elementos" | "garantias" | null>(null);
  const detalles = useRef(new Map<string, Oferta>());
  const [detalle, setDetalle] = useState<{
    id: string;
    estado: "cargando" | "listo" | "error";
    oferta: Oferta | null;
  } | null>(null);
  // Opción apagada que el cliente tocó, para explicarle con qué cambio sí existe.
  const [explicando, setExplicando] = useState<{ paso: PasoKit; clave: string } | null>(
    null,
  );

  const moneda = (kits[0]?.moneda ?? "usd").toUpperCase();

  const aplicar = (nueva: SeleccionKit) => {
    const { seleccion: valida, descartados } = normalizar(kits, nueva);
    setSeleccion(valida);
    setEditando(null);
    setExplicando(null);
    setAviso(
      descartados.length
        ? `Se actualizó tu selección: ajustamos ${descartados.map((p) => NOMBRE_DESCARTADO[p]).join(" y ")} porque no hay un kit con esa combinación.`
        : null,
    );
  };

  const elegir = (paso: PasoKit, opcion: OpcionKit) => {
    if (!opcion.disponible) {
      setAviso(null);
      setExplicando({ paso, clave: opcion.clave });
      return;
    }
    aplicar({ ...seleccion, [paso]: opcion.clave });
  };

  /** Una sugerencia de la IA: deja el configurador exactamente en ese kit. */
  const aplicarKit = (k: KitConfigurable) => {
    aplicar(seleccionDeKit(k.config));
    setVoltajeElegido(k.voltaje);
    setIaAbierta(false);
    requestAnimationFrame(() =>
      rejilla.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const abrirModal = async (cual: "elementos" | "garantias") => {
    if (!kit) return;
    const id = kit.id;
    setModal(cual);
    const guardado = detalles.current.get(id);
    if (guardado) {
      setDetalle({ id, estado: "listo", oferta: guardado });
      return;
    }
    setDetalle({ id, estado: "cargando", oferta: null });
    try {
      const respuesta = await fetch(`/api/ofertas/detalle-publico/${encodeURIComponent(id)}`);
      const datos = respuesta.ok ? await respuesta.json() : null;
      if (!datos?.success || !datos.data) throw new Error("sin detalle");
      detalles.current.set(id, datos.data);
      setDetalle({ id, estado: "listo", oferta: datos.data });
    } catch {
      setDetalle({ id, estado: "error", oferta: null });
    }
  };

  // Llegar con un kit ya elegido (desde el listado o un enlace): ir directo al configurador.
  useEffect(() => {
    if (!kitDeInicio) return;
    const id = requestAnimationFrame(() =>
      rejilla.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
    return () => cancelAnimationFrame(id);
    // solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reiniciar = () => {
    setSeleccion(normalizar(kits, SELECCION_VACIA).seleccion);
    setVoltajeElegido(null);
    setEditando(null);
    setExplicando(null);
    setAviso(null);
  };

  const opcionesPorPaso = Object.fromEntries(
    PASOS.map((p) => [p, opciones(kits, p, seleccion)]),
  ) as Record<PasoKit, OpcionKit[]>;
  const elegida = (paso: PasoKit) =>
    opcionesPorPaso[paso].find((o) => o.clave === seleccion[paso]);

  // Los pasos de instalación solo se preguntan si hay más de una forma de
  // lograr la potencia o la capacidad; si hay una sola, ya vino resuelta.
  const mostrables = PASOS.filter((p) => !esVariante(p) || opcionesPorPaso[p].length > 1);
  const pasoActual = mostrables.find((p) => seleccion[p] === null) ?? null;
  const pasoVisible = editando ?? pasoActual ?? mostrables[mostrables.length - 1];
  const indiceMostrable = mostrables.indexOf(pasoVisible);
  /** Posición entre los tres bloques que ve el cliente: inversor, batería, paneles. */
  const indiceVisible = GRUPOS.indexOf(GRUPO_DE[pasoVisible]);

  const kit = kitElegido(kits, seleccion, voltajeElegido);
  const referencia = kitReferencia(kits, seleccion, voltajeElegido);
  const voltajes = voltajesDisponibles(kits, seleccion);
  const compatibles = kitsCompatibles(kits, seleccion);
  const precioMinimo = compatibles.length
    ? Math.min(...compatibles.map((k) => k.precio))
    : null;
  const precioTotal = kit
    ? `${formatearPrecio(kit.precio)} ${moneda}`
    : precioMinimo !== null
      ? `Desde ${formatearPrecio(precioMinimo)} ${moneda}`
      : null;

  // Cada bloque con su nombre completo cuando ya se sabe cómo se instala.
  const configReferencia = referencia?.config;
  const textoGrupo = (g: GrupoKit): string | null => {
    const o = seleccion[g] ? elegida(g) : undefined;
    if (!o) return null;
    if (g === "paneles") return etiquetaPaneles(o.config);
    const resuelta = g === "inversor" ? seleccion.inversorConfig : seleccion.bateriaConfig;
    if (resuelta && configReferencia) {
      return g === "inversor"
        ? etiquetaInversorCompleta(configReferencia)
        : etiquetaBateriaCompleta(configReferencia);
    }
    return g === "inversor"
      ? etiquetaPotenciaInversor(o.config)
      : etiquetaPotenciaBateria(o.config);
  };
  const resumen = GRUPOS.map((g) => ({ grupo: g, texto: textoGrupo(g) }));
  const textoKit =
    resumen
      .filter((r) => r.texto)
      .map((r) => r.texto)
      .join(" + ") + (kit?.voltaje ? `, a ${etiquetaVoltaje(kit.voltaje)}` : "");

  const enlaceWhatsApp = (texto: string) =>
    `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(texto)}`;
  const precioKit = kit ? `${formatearPrecio(kit.precio)} ${moneda}` : "";
  const enlaceSolicitar = kit
    ? enlaceWhatsApp(
        `Hola! Quiero solicitar el kit que armé en la web: ${textoKit} (${kit.descripcion}) por ${precioKit}. ¿Podrían darme más información?`,
      )
    : "#";
  const enlaceAlternativa = kit
    ? enlaceWhatsApp(
        `Hola! Armé este kit en la web: ${textoKit} (${kit.descripcion}) por ${precioKit}, pero quisiera una configuración alternativa. ¿Podrían ayudarme?`,
      )
    : "#";
  const detalleDelKit = kit && detalle?.id === kit.id ? detalle : null;

  // En móvil, cuando el botón "Solicitar kit" del resumen ya se ve, la barra de
  // abajo repetiría el mismo botón: se oculta. En escritorio no cambia.
  const resumenAbierto = kit !== null && !editando;
  useEffect(() => {
    const boton = ctaRef.current;
    if (!resumenAbierto || !boton) {
      setCtaVisible(false);
      return;
    }
    const observador = new IntersectionObserver(
      ([entrada]) => setCtaVisible(entrada.isIntersecting),
      { rootMargin: "0px 0px -72px 0px" },
    );
    observador.observe(boton);
    return () => observador.disconnect();
  }, [resumenAbierto]);

  const explicacion = (() => {
    if (!explicando) return null;
    const { paso, clave } = explicando;
    const opcion = opcionesPorPaso[paso].find((o) => o.clave === clave);
    if (!opcion) return null;
    const inversor = textoGrupo("inversor");
    const bateria = textoGrupo("bateria");
    const contexto =
      paso === "bateria"
        ? `un inversor de ${inversor ?? "ese tipo"}`
        : `${inversor ?? ""}${bateria ? ` + ${bateria}` : ""}`;
    return {
      paso,
      texto: `Disponible con un cambio. No hay un kit con ${contexto} y ${etiquetaDe(paso, opcion)}, pero existe con:`,
      lista: alternativas(kits, paso, clave, seleccion),
    };
  })();

  const cajaAviso = (texto: string) => (
    <div
      role="status"
      className="mb-5 rounded-[12px] bg-[#F5F5F7] p-[15px] text-sm leading-[1.43] tracking-[-0.016em] text-[#1d1d1f]"
    >
      {texto}
    </div>
  );

  return (
    <div className="rounded-[28px] bg-white px-4 pb-10 sm:px-8 lg:px-12">
      {/* Encabezado */}
      <header className="flex flex-col gap-6 pb-8 pt-10 lg:flex-row lg:items-center lg:justify-between lg:pb-[22px] lg:pt-[52px]">
        <div>
          <h1 className="pb-1 text-[32px] font-semibold leading-[1.125] tracking-[.004em] text-[#012928] lg:text-[48px] lg:leading-[1.083] lg:tracking-[-0.003em]">
            Comprar un kit
          </h1>
          <p className="text-[17px] leading-[1.47] tracking-[-0.022em] text-[#6e6e73]">
            (incluye instalación llave en mano)
          </p>
          <p className="mt-3 text-[17px] leading-[1.47] tracking-[-0.022em] text-[#012928]">
            {precioTotal ?? "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIaAbierta((abierta) => !abierta)}
          aria-expanded={iaAbierta}
          aria-controls="armar-ia"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#012928] px-8 py-3 text-[17px] font-medium tracking-[-0.022em] text-white transition-colors hover:bg-[#01403d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#012928] sm:w-auto lg:flex-shrink-0"
        >
          Elegir con IA
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", iaAbierta && "rotate-180")}
            aria-hidden="true"
          />
        </button>
      </header>

      {iaAbierta && (
        <div id="armar-ia">
          <ElegirConIA
            kits={kits}
            moneda={moneda}
            onElegir={aplicarKit}
            onCerrar={() => setIaAbierta(false)}
          />
        </div>
      )}

      <div
        ref={rejilla}
        className="grid scroll-mt-28 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_328px] lg:gap-14"
      >
        <Escaparate
          kit={referencia}
          seleccion={seleccion}
          indiceVisible={indiceVisible}
          onAnterior={
            indiceMostrable > 0 ? () => setEditando(mostrables[indiceMostrable - 1]) : null
          }
          onSiguiente={editando ? () => setEditando(null) : null}
        />

        <div className="lg:pt-6">
          {aviso && cajaAviso(aviso)}

          {mostrables.map((paso) => {
            const resuelto = seleccion[paso] !== null && editando !== paso;
            const expandido = editando === paso || (paso === pasoActual && !editando);
            if (!resuelto && !expandido) return null;

            const lista = opcionesPorPaso[paso];
            const libres = lista.filter((o) => o.disponible);
            const idTitulo = `armar-${paso}`;
            return (
              <section key={paso} aria-labelledby={idTitulo} className="mb-[58px]">
                <h2
                  id={idTitulo}
                  className="mb-5 text-[24px] font-semibold leading-[1.17] tracking-[-0.003em] text-[#012928]"
                >
                  {PASO_INFO[paso].titulo}{" "}
                  <span className="text-[#86868b]">{PASO_INFO[paso].subtitulo}</span>
                </h2>

                {resuelto ? (
                  <FilaResuelta
                    paso={paso}
                    opcion={elegida(paso)!}
                    onEditar={() => {
                      setEditando(paso);
                      setExplicando(null);
                    }}
                  />
                ) : (
                  <>
                    {libres.length === 1 && lista.length > 1 && (
                      <p className="mb-3 text-sm leading-[1.43] tracking-[-0.016em] text-[#6e6e73]">
                        Con tu selección solo hay una opción disponible.
                      </p>
                    )}
                    <div
                      role="radiogroup"
                      aria-labelledby={idTitulo}
                      className="flex flex-col gap-[14px]"
                    >
                      {lista.map((opcion) => (
                        <FilaOpcion
                          key={opcion.clave}
                          paso={paso}
                          opcion={opcion}
                          elegida={elegida(paso)}
                          seleccionada={seleccion[paso] === opcion.clave}
                          moneda={moneda}
                          onElegir={() => elegir(paso, opcion)}
                        />
                      ))}
                    </div>

                    {explicacion && explicacion.paso === paso && (
                      <div
                        role="status"
                        className="mt-4 rounded-[12px] bg-[#F5F5F7] p-[15px] text-sm leading-[1.43] tracking-[-0.016em] text-[#1d1d1f]"
                      >
                        <p>{explicacion.texto}</p>
                        <div className="mt-3 flex flex-col gap-2">
                          {explicacion.lista.map((alt) => (
                            <button
                              key={alt.texto}
                              type="button"
                              onClick={() => aplicar(alt.seleccion)}
                              className="rounded-[12px] border border-[#86868b] bg-white px-[15px] py-3 text-left transition-colors hover:border-[#012928]"
                            >
                              Cambiar a {alt.texto}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {libres.length > 1 && (
                      <p className="mt-3 text-[13px] leading-[1.33] text-[#6e6e73] lg:text-[12px]">
                        {paso !== "paneles" && elegida(paso)
                          ? "Las diferencias se calculan con el kit más económico de cada opción."
                          : null}
                      </p>
                    )}

                    <CajaDudas
                      paso={paso}
                      abierta={dudaAbierta === paso}
                      onAlternar={() =>
                        setDudaAbierta(dudaAbierta === paso ? null : paso)
                      }
                    />
                  </>
                )}
              </section>
            );
          })}

          {/* Resumen, cuando los tres pasos están resueltos */}
          {kit && !editando && (
            <section aria-labelledby="armar-resumen" className="mb-6">
              <h2
                id="armar-resumen"
                className="text-[24px] font-semibold leading-[1.17] tracking-[-0.003em] text-[#012928]"
              >
                Tu kit solar te espera.{" "}
                <span className="text-[#86868b]">Hazlo tuyo.</span>
              </h2>

              <dl className="mt-5 divide-y divide-[#d2d2d7] border-y border-[#d2d2d7] text-sm tracking-[-0.016em]">
                {resumen.map(({ grupo, texto }) => (
                  <div key={grupo} className="flex justify-between gap-4 py-3">
                    <dt className="text-[#6e6e73]">{TITULO_GRUPO[grupo]}</dt>
                    <dd className="text-right font-semibold text-[#012928]">{texto}</dd>
                  </div>
                ))}
                {kit.voltaje && (
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt id="armar-voltaje" className="text-[#6e6e73]">
                      Voltaje
                    </dt>
                    <dd>
                      {voltajes.length > 1 ? (
                        <div
                          role="radiogroup"
                          aria-labelledby="armar-voltaje"
                          className="flex rounded-full bg-[#F5F5F7] p-0.5"
                        >
                          {voltajes.map((v) => (
                            <button
                              key={v}
                              type="button"
                              role="radio"
                              aria-checked={kit.voltaje === v}
                              onClick={() => setVoltajeElegido(v)}
                              className={cn(
                                "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                                kit.voltaje === v
                                  ? "bg-white text-[#012928] shadow-sm"
                                  : "text-[#6e6e73] hover:text-[#012928]",
                              )}
                            >
                              {etiquetaVoltaje(v)}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <ChipVoltaje voltaje={kit.voltaje} />
                      )}
                    </dd>
                  </div>
                )}
              </dl>

              <p className="mt-5 text-[28px] font-semibold leading-[1.14] tracking-[.007em] text-[#012928]">
                {formatearPrecio(kit.precio)} {moneda}
              </p>
              <p className="mt-1 text-[13px] leading-[1.33] text-[#6e6e73] lg:text-[12px]">
                Precio referencial: puede ajustarse según las características de tu proyecto.
              </p>

              <a
                ref={ctaRef}
                href={enlaceSolicitar}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#012928] px-6 py-3 text-[17px] font-normal tracking-[-0.022em] text-white transition-opacity hover:opacity-90"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Solicitar kit
              </a>
              <a
                href={enlaceAlternativa}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center rounded-full border border-[#012928] px-6 py-3 text-center text-[17px] leading-tight tracking-[-0.022em] text-[#012928] transition-colors hover:bg-[#F5F5F7]"
              >
                Contactar para una configuración alternativa
              </a>
              <p className="mt-3 text-[13px] leading-[1.33] text-[#6e6e73] lg:text-[12px]">
                Son configuraciones por defecto. Si necesitas otra, más específica para tu
                caso, contáctanos.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void abrirModal("elementos")}
                  className="rounded-full bg-[#F5F5F7] px-4 py-3 text-sm lg:py-2.5 tracking-[-0.016em] text-[#1d1d1f] transition-colors hover:bg-[#e8e8ed]"
                >
                  Ver qué trae el kit
                </button>
                <button
                  type="button"
                  onClick={() => void abrirModal("garantias")}
                  className="rounded-full bg-[#F5F5F7] px-4 py-3 text-sm lg:py-2.5 tracking-[-0.016em] text-[#1d1d1f] transition-colors hover:bg-[#e8e8ed]"
                >
                  Ver garantías del kit
                </button>
              </div>

              <div className="mt-4 text-sm">
                <button
                  type="button"
                  onClick={reiniciar}
                  className={cn(TACTIL, "text-[#012928] underline underline-offset-2 hover:no-underline")}
                >
                  Empezar de nuevo
                </button>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Otras formas de elegir, como el "Más formas de comprar" de Apple. */}
      <p className="mt-12 border-t border-[#d2d2d7] pt-6 text-sm leading-[1.43] tracking-[-0.016em] text-[#6e6e73]">
        Más formas de elegir:{" "}
        {onVerListado && (
          <>
            <button
              type="button"
              onClick={onVerListado}
              className={cn(TACTIL, "text-[#012928] underline underline-offset-2 hover:no-underline")}
            >
              ver todos los kits
            </button>{" "}
            o{" "}
          </>
        )}
        <Link
          href="/contacto"
          className={cn(TACTIL, "max-lg:inline-block text-[#012928] underline underline-offset-2 hover:no-underline")}
        >
          habla con un asesor
        </Link>
        .
      </p>

      {/* Barra de precio que acompaña la pantalla, como la de Apple. */}
      {seleccion.inversor && (
        <div
          className={cn(
            "sticky bottom-0 z-30 -mx-4 mt-8 sm:-mx-8 lg:-mx-12",
            ctaVisible && "max-lg:hidden",
          )}
        >
          <div className="flex items-center justify-between gap-3 rounded-t-[18px] bg-[#F5F5F7] py-3 pl-4 pr-[84px] shadow-[0_-1px_0_#d2d2d7] sm:px-8 lg:px-12">
            <div className="min-w-0">
              <p className="truncate text-[13px] leading-4 tracking-[-0.01em] text-[#6e6e73] lg:text-xs">
                {textoKit}
              </p>
              <p className="whitespace-nowrap text-[17px] font-semibold tracking-[-0.022em] text-[#012928]">
                {precioTotal}
              </p>
            </div>
            {kit ? (
              <a
                href={enlaceSolicitar}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 rounded-full bg-[#012928] px-4 py-3 text-sm text-white sm:px-5 lg:py-2 transition-opacity hover:opacity-90"
              >
                Solicitar kit
              </a>
            ) : (
              <button
                type="button"
                onClick={reiniciar}
                className={cn(TACTIL, "flex-shrink-0 text-sm text-[#012928] underline underline-offset-2 hover:no-underline")}
              >
                Empezar de nuevo
              </button>
            )}
          </div>
        </div>
      )}

      {kit && (
        <>
          <ModalElementos
            oferta={detalleDelKit?.oferta ?? null}
            descripcion={kit.descripcion}
            cargando={detalleDelKit?.estado === "cargando"}
            error={detalleDelKit?.estado === "error"}
            abierto={modal === "elementos"}
            onCerrar={() => setModal(null)}
          />
          <ModalGarantias
            oferta={detalleDelKit?.oferta ?? null}
            descripcion={kit.descripcion}
            cargando={detalleDelKit?.estado === "cargando"}
            error={detalleDelKit?.estado === "error"}
            abierto={modal === "garantias"}
            onCerrar={() => setModal(null)}
          />
        </>
      )}
    </div>
  );
}
