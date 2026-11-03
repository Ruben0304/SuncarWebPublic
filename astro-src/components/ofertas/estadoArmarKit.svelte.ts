import {
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
  esVariante,
  etiquetaBateriaCompleta,
  etiquetaInversorCompleta,
  etiquetaPaneles,
  etiquetaPotenciaBateria,
  etiquetaPotenciaInversor,
  etiquetaVarianteBateria,
  etiquetaVarianteInversor,
  kitElegido,
  kitReferencia,
  kitsCompatibles,
  voltajesDisponibles,
  kitsConfigurables,
  normalizar,
  opciones,
  seleccionDeKit,
  type GrupoKit,
  type KitConfigurable,
  type OpcionKit,
  type PasoKit,
  type SeleccionKit,
} from "@/lib/ofertas/configurador";
import { formatearPrecio } from "@/lib/ofertas/ofertas-publicas";
import type { Oferta, OfertaSimplificada } from "@/types/ofertas";

// El estado de "Comprar un kit": qué eligió el cliente en cada paso, qué paso
// se ve, el resumen y los enlaces de WhatsApp. Cada paso solo deja elegir lo
// que existe como kit publicado; el resultado es siempre un kit real, el mismo
// que se ve en el listado.

import { etiquetaVoltaje } from "./voltaje";
export const PASO_INFO: Record<
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

export const TITULO_GRUPO: Record<GrupoKit, string> = {
  inversor: "Inversor",
  bateria: "Batería",
  paneles: "Paneles",
};

export function etiquetaDe(paso: PasoKit, opcion: OpcionKit): string {
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

export function ayudaDe(paso: PasoKit, opcion: OpcionKit): string {
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
export function textoPrecio(
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

export type DetalleKit = {
  id: string;
  estado: "cargando" | "listo" | "error";
  oferta: Oferta | null;
};

export class EstadoArmarKit {
  readonly kits: KitConfigurable[];
  readonly moneda: string;
  private readonly whatsapp: () => string;
  /** El kit con el que arranca ya elegido (viene del listado o de un enlace). */
  readonly kitDeInicio: KitConfigurable | null;

  seleccion = $state.raw<SeleccionKit>(SELECCION_VACIA);
  // Solo decide algo si hay dos kits iguales que se diferencian en el voltaje.
  voltajeElegido = $state<number | null>(null);
  editando = $state<PasoKit | null>(null);
  dudaAbierta = $state<PasoKit | null>(null);
  aviso = $state<string | null>(null);
  iaAbierta = $state(false);
  // "Ver qué trae el kit" y "Ver garantías del kit": el detalle se pide al
  // abrir el modal (la lista de kits no trae los elementos) y se recuerda.
  modal = $state<"elementos" | "garantias" | null>(null);
  detalle = $state.raw<DetalleKit | null>(null);
  // Opción apagada que el cliente tocó, para explicarle con qué cambio sí existe.
  explicando = $state.raw<{ paso: PasoKit; clave: string } | null>(null);

  private readonly detalles = new Map<string, Oferta>();

  opcionesPorPaso = $derived(
    Object.fromEntries(PASOS.map((p) => [p, opciones(this.kits, p, this.seleccion)])) as Record<
      PasoKit,
      OpcionKit[]
    >,
  );

  // Los pasos de instalación solo se preguntan si hay más de una forma de
  // lograr la potencia o la capacidad; si hay una sola, ya vino resuelta.
  mostrables = $derived(PASOS.filter((p) => !esVariante(p) || this.opcionesPorPaso[p].length > 1));
  pasoActual = $derived(this.mostrables.find((p) => this.seleccion[p] === null) ?? null);
  pasoVisible = $derived(
    this.editando ?? this.pasoActual ?? this.mostrables[this.mostrables.length - 1],
  );
  indiceMostrable = $derived(this.mostrables.indexOf(this.pasoVisible));
  /** Posición entre los tres bloques que ve el cliente: inversor, batería, paneles. */
  indiceVisible = $derived(GRUPOS.indexOf(GRUPO_DE[this.pasoVisible]));

  kit = $derived.by(() => kitElegido(this.kits, this.seleccion, this.voltajeElegido));
  referencia = $derived.by(() => kitReferencia(this.kits, this.seleccion, this.voltajeElegido));
  /** Voltajes entre los que se puede elegir cuando el kit ya está armado. */
  voltajes = $derived.by(() => voltajesDisponibles(this.kits, this.seleccion));
  precioMinimo = $derived.by(() => {
    const compatibles = kitsCompatibles(this.kits, this.seleccion);
    return compatibles.length ? Math.min(...compatibles.map((k) => k.precio)) : null;
  });
  precioTotal = $derived.by(() => {
    if (this.kit) return `${formatearPrecio(this.kit.precio)} ${this.moneda}`;
    if (this.precioMinimo !== null) return `Desde ${formatearPrecio(this.precioMinimo)} ${this.moneda}`;
    return null;
  });
  precioKit = $derived.by(() => (this.kit ? `${formatearPrecio(this.kit.precio)} ${this.moneda}` : ""));

  // Cada bloque con su nombre completo cuando ya se sabe cómo se instala.
  resumen = $derived(GRUPOS.map((grupo) => ({ grupo, texto: this.textoGrupo(grupo) })));
  textoKit = $derived(
    this.resumen
      .filter((r) => r.texto)
      .map((r) => r.texto)
      .join(" + ") + (this.kit?.voltaje ? `, a ${etiquetaVoltaje(this.kit.voltaje)}` : ""),
  );

  enlaceSolicitar = $derived(
    this.kit
      ? this.enlaceWhatsApp(
          `Hola! Quiero solicitar el kit que armé en la web: ${this.textoKit} (${this.kit.descripcion}) por ${this.precioKit}. ¿Podrían darme más información?`,
        )
      : "#",
  );
  enlaceAlternativa = $derived(
    this.kit
      ? this.enlaceWhatsApp(
          `Hola! Armé este kit en la web: ${this.textoKit} (${this.kit.descripcion}) por ${this.precioKit}, pero quisiera una configuración alternativa. ¿Podrían ayudarme?`,
        )
      : "#",
  );

  detalleDelKit = $derived(this.kit && this.detalle?.id === this.kit.id ? this.detalle : null);

  explicacion = $derived.by(() => {
    if (!this.explicando) return null;
    const { paso, clave } = this.explicando;
    const opcion = this.opcionesPorPaso[paso].find((o) => o.clave === clave);
    if (!opcion) return null;
    const inversor = this.textoGrupo("inversor");
    const bateria = this.textoGrupo("bateria");
    const contexto =
      paso === "bateria"
        ? `un inversor de ${inversor ?? "ese tipo"}`
        : `${inversor ?? ""}${bateria ? ` + ${bateria}` : ""}`;
    return {
      paso,
      texto: `Disponible con un cambio. No hay un kit con ${contexto} y ${etiquetaDe(paso, opcion)}, pero existe con:`,
      lista: alternativas(this.kits, paso, clave, this.seleccion),
    };
  });

  constructor(ofertas: OfertaSimplificada[], kitInicial: string | null, whatsapp: () => string) {
    this.kits = kitsConfigurables(ofertas);
    this.whatsapp = whatsapp;
    this.moneda = (this.kits[0]?.moneda ?? "usd").toUpperCase();
    this.kitDeInicio = kitInicial
      ? (this.kits.find((k) => k.id === kitInicial || k.idInterno === kitInicial) ?? null)
      : null;
    this.seleccion = normalizar(
      this.kits,
      this.kitDeInicio ? seleccionDeKit(this.kitDeInicio.config) : SELECCION_VACIA,
    ).seleccion;
    this.voltajeElegido = this.kitDeInicio?.voltaje ?? null;
  }

  private enlaceWhatsApp(texto: string) {
    return `https://wa.me/${this.whatsapp()}?text=${encodeURIComponent(texto)}`;
  }

  elegida(paso: PasoKit): OpcionKit | undefined {
    return this.opcionesPorPaso[paso].find((o) => o.clave === this.seleccion[paso]);
  }

  textoGrupo(g: GrupoKit): string | null {
    const o = this.seleccion[g] ? this.elegida(g) : undefined;
    if (!o) return null;
    if (g === "paneles") return etiquetaPaneles(o.config);
    const resuelta = g === "inversor" ? this.seleccion.inversorConfig : this.seleccion.bateriaConfig;
    const configReferencia = this.referencia?.config;
    if (resuelta && configReferencia) {
      return g === "inversor"
        ? etiquetaInversorCompleta(configReferencia)
        : etiquetaBateriaCompleta(configReferencia);
    }
    return g === "inversor" ? etiquetaPotenciaInversor(o.config) : etiquetaPotenciaBateria(o.config);
  }

  aplicar(nueva: SeleccionKit) {
    const { seleccion: valida, descartados } = normalizar(this.kits, nueva);
    this.seleccion = valida;
    this.editando = null;
    this.explicando = null;
    this.aviso = descartados.length
      ? `Se actualizó tu selección: ajustamos ${descartados.map((p) => NOMBRE_DESCARTADO[p]).join(" y ")} porque no hay un kit con esa combinación.`
      : null;
  }

  elegir(paso: PasoKit, opcion: OpcionKit) {
    if (!opcion.disponible) {
      this.aviso = null;
      this.explicando = { paso, clave: opcion.clave };
      return;
    }
    this.aplicar({ ...this.seleccion, [paso]: opcion.clave });
  }

  /** Una sugerencia de la IA: deja el configurador exactamente en ese kit. */
  aplicarKit(k: KitConfigurable) {
    this.aplicar(seleccionDeKit(k.config));
    this.voltajeElegido = k.voltaje;
    this.iaAbierta = false;
  }

  editar(paso: PasoKit) {
    this.editando = paso;
    this.explicando = null;
  }

  alternarDuda(paso: PasoKit) {
    this.dudaAbierta = this.dudaAbierta === paso ? null : paso;
  }

  reiniciar() {
    this.seleccion = normalizar(this.kits, SELECCION_VACIA).seleccion;
    this.voltajeElegido = null;
    this.editando = null;
    this.explicando = null;
    this.aviso = null;
  }

  async abrirModal(cual: "elementos" | "garantias") {
    const kit = this.kit;
    if (!kit) return;
    const id = kit.id;
    this.modal = cual;
    const guardado = this.detalles.get(id);
    if (guardado) {
      this.detalle = { id, estado: "listo", oferta: guardado };
      return;
    }
    this.detalle = { id, estado: "cargando", oferta: null };
    try {
      const respuesta = await fetch(`/api/ofertas/detalle-publico/${encodeURIComponent(id)}`);
      const datos = respuesta.ok ? await respuesta.json() : null;
      if (!datos?.success || !datos.data) throw new Error("sin detalle");
      this.detalles.set(id, datos.data);
      this.detalle = { id, estado: "listo", oferta: datos.data };
    } catch {
      this.detalle = { id, estado: "error", oferta: null };
    }
  }
}
