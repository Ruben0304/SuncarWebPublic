import type { ConfigKit, OfertaSimplificada } from "@/types/ofertas";
import { normalizarCategoria } from "./instalacion";

// "Armar mi kit": el cliente elige inversor → batería → paneles, pero cada
// combinación tiene que ser un kit que ya está publicado. Nada se calcula ni se
// inventa: el árbol sale de los kits, y lo que no existe se muestra apagado.

export interface ItemConfig {
  categoria?: string | null;
  descripcion?: string | null;
  cantidad?: number | null;
  material_codigo?: string | null;
}

/** potenciaKW del catálogo por material_codigo (kW, kWh o kW del panel). */
export type PotenciasCatalogo = Map<string, number>;

const redondear = (n: number) => Math.round(n * 100) / 100;

/** Coma decimal fija: toLocaleString difiere entre servidor y navegador. */
export const cifra = (n: number) => String(redondear(n)).replace(".", ",");

const numero = (texto: string, patron: RegExp) => {
  const m = texto.match(patron);
  return m ? parseFloat(m[1].replace(",", ".")) : null;
};

const cantidadDe = (item: ItemConfig) =>
  item.cantidad && item.cantidad > 0 ? item.cantidad : 1;

/**
 * Inversor, batería y paneles de un kit. La potencia sale del catálogo
 * (`potenciaKW`, por código de material); si el equipo no está o no la trae,
 * se lee de su descripción. null si algún inversor o batería no tiene
 * potencia por ninguna vía: sin ese dato no se puede comparar con los demás.
 */
export function extraerConfigKit(
  items: ItemConfig[] | null | undefined,
  nombreKit?: string | null,
  potencias?: PotenciasCatalogo,
): ConfigKit | null {
  let inversorKw = 0;
  let inversorUnidades = 0;
  let bateriaKwh = 0;
  let bateriaUnidades = 0;
  let paneles = 0;
  let panelW: number | null = null;
  let panelM2: number | null = null;
  let inversorCodigo: string | null = null;
  let bateriaCodigo: string | null = null;

  for (const item of items ?? []) {
    const categoria = normalizarCategoria(item.categoria);
    const texto = item.descripcion ?? "";
    const cantidad = cantidadDe(item);
    const delCatalogo = item.material_codigo
      ? potencias?.get(String(item.material_codigo))
      : undefined;

    if (categoria === "INVERSORES") {
      if (/WIFI/i.test(texto)) continue;
      const kw = delCatalogo ?? numero(texto, /(\d+(?:[.,]\d+)?)\s*KW/i);
      if (kw === null) return null;
      inversorKw += kw * cantidad;
      inversorUnidades += cantidad;
      inversorCodigo ??= item.material_codigo ?? null;
    } else if (categoria === "BATERIAS") {
      if (/COMBINADORA/i.test(texto)) continue;
      const kwh = delCatalogo ?? numero(texto, /(\d+(?:[.,]\d+)?)\s*KWH?/i);
      if (kwh === null) return null;
      bateriaKwh += kwh * cantidad;
      bateriaUnidades += cantidad;
      bateriaCodigo ??= item.material_codigo ?? null;
    } else if (categoria === "PANELES") {
      paneles += cantidad;
      panelW ??= delCatalogo
        ? Math.round(delCatalogo * 1000)
        : numero(texto, /(\d{3,4})\s*W\b/i);
      if (panelM2 === null) {
        const medidas = texto.match(/(\d{3,4})\s*\*\s*(\d{3,4})/);
        if (medidas) panelM2 = (Number(medidas[1]) * Number(medidas[2])) / 1e6;
      }
    }
  }

  if (inversorUnidades === 0) return null;
  // El nombre del kit suele traer "8x 600W Paneles"; los items, solo el modelo.
  if (paneles > 0 && panelW === null) {
    panelW = numero(nombreKit ?? "", /(\d{3,4})\s*W\b/i);
  }

  return {
    inversorKw: redondear(inversorKw),
    inversorUnidades,
    bateriaKwh: redondear(bateriaKwh),
    bateriaUnidades,
    paneles,
    panelW,
    panelM2: panelM2 === null ? null : redondear(panelM2),
    inversorCodigo,
    bateriaCodigo,
  };
}

// ─── El árbol de kits ────────────────────────────────────────────────────────

export interface KitConfigurable {
  id: string;
  /** id de Mongo, con el que responde el recomendador de IA. */
  idInterno: string | null;
  descripcion: string;
  precio: number;
  moneda: string;
  config: ConfigKit;
}

export function kitsConfigurables(
  ofertas: OfertaSimplificada[],
): KitConfigurable[] {
  const kits: KitConfigurable[] = [];
  for (const o of ofertas) {
    if (!o.id || !o.config || o.is_active === false) continue;
    if (typeof o.precio !== "number" || !Number.isFinite(o.precio)) continue;
    kits.push({
      id: o.id,
      idInterno: o.idInterno ?? null,
      descripcion: o.descripcion,
      precio: o.precio,
      moneda: o.moneda,
      config: o.config,
    });
  }
  return kits;
}

// Cinco pasos: potencia del inversor, cómo se logra esa potencia (1 × 10 kW o
// 2 × 5 kW), capacidad de la batería, cómo se logra, y paneles. Los dos pasos
// "de configuración" solo se preguntan cuando hay más de una forma de hacerlo;
// si hay una sola, `normalizar` la elige sola, igual que cualquier opción única.
export type PasoKit =
  | "inversor"
  | "inversorConfig"
  | "bateria"
  | "bateriaConfig"
  | "paneles";
export const PASOS: PasoKit[] = [
  "inversor",
  "inversorConfig",
  "bateria",
  "bateriaConfig",
  "paneles",
];

/** Lo que el cliente ve como tres bloques: inversor, batería y paneles. */
export type GrupoKit = "inversor" | "bateria" | "paneles";
export const GRUPOS: GrupoKit[] = ["inversor", "bateria", "paneles"];
export const GRUPO_DE: Record<PasoKit, GrupoKit> = {
  inversor: "inversor",
  inversorConfig: "inversor",
  bateria: "bateria",
  bateriaConfig: "bateria",
  paneles: "paneles",
};
export const esVariante = (paso: PasoKit) =>
  paso === "inversorConfig" || paso === "bateriaConfig";

export type SeleccionKit = Record<PasoKit, string | null>;
export const SELECCION_VACIA: SeleccionKit = {
  inversor: null,
  inversorConfig: null,
  bateria: null,
  bateriaConfig: null,
  paneles: null,
};

/** Identifica una opción de un paso: kits con el mismo valor comparten clave. */
export function claveDe(paso: PasoKit, c: ConfigKit): string {
  switch (paso) {
    case "inversor":
      return `${c.inversorKw}`;
    case "inversorConfig":
      return `${c.inversorUnidades}`;
    case "bateria":
      return `${c.bateriaKwh}`;
    case "bateriaConfig":
      return `${c.bateriaUnidades}`;
    case "paneles":
      return `${c.paneles}x${c.panelW ?? 0}`;
  }
}

/** La selección exacta que corresponde a un kit. */
export function seleccionDeKit(c: ConfigKit): SeleccionKit {
  return Object.fromEntries(PASOS.map((p) => [p, claveDe(p, c)])) as SeleccionKit;
}

const valorOrden = (paso: PasoKit, c: ConfigKit) => {
  switch (paso) {
    case "inversor":
      return c.inversorKw;
    case "inversorConfig":
      return c.inversorUnidades;
    case "bateria":
      return c.bateriaKwh;
    case "bateriaConfig":
      return c.bateriaUnidades;
    case "paneles":
      return c.paneles;
  }
};

export interface OpcionKit {
  clave: string;
  /** Un kit cualquiera con esta opción, para rotularla. */
  config: ConfigKit;
  /** Kits con esta opción que respetan lo elegido en los pasos anteriores. */
  kits: KitConfigurable[];
  disponible: boolean;
  /** El kit más económico de la rama; null si no hay kit. */
  desde: number | null;
}

/** Los kits que respetan lo elegido antes de `paso`. */
function kitsPrevios(
  kits: KitConfigurable[],
  paso: PasoKit,
  sel: SeleccionKit,
): KitConfigurable[] {
  let resto = kits;
  for (const anterior of PASOS.slice(0, PASOS.indexOf(paso))) {
    const elegido = sel[anterior];
    if (elegido) resto = resto.filter((k) => claveDe(anterior, k.config) === elegido);
  }
  return resto;
}

/**
 * Todas las opciones que algún kit ofrece en este paso, de menor a mayor.
 * Las que no tienen kit con lo elegido antes salen con `disponible: false`.
 * En los pasos de configuración solo salen las formas que existen para la
 * potencia elegida: no tiene sentido ofrecer "2 × 3 kW" a quien eligió 10 kW.
 */
export function opciones(
  kits: KitConfigurable[],
  paso: PasoKit,
  sel: SeleccionKit,
): OpcionKit[] {
  const previos = kitsPrevios(kits, paso, sel);
  const porClave = new Map<string, KitConfigurable>();
  for (const k of esVariante(paso) ? previos : kits) {
    const clave = claveDe(paso, k.config);
    if (!porClave.has(clave)) porClave.set(clave, k);
  }

  return Array.from(porClave.entries())
    .sort(
      ([, a], [, b]) => valorOrden(paso, a.config) - valorOrden(paso, b.config),
    )
    .map(([clave, muestra]) => {
      const enRama = previos.filter((k) => claveDe(paso, k.config) === clave);
      return {
        clave,
        config: muestra.config,
        kits: enRama,
        disponible: enRama.length > 0,
        desde: enRama.length ? Math.min(...enRama.map((k) => k.precio)) : null,
      };
    });
}

/**
 * Deja la selección en un estado válido: descarta lo que ya no tiene kit,
 * y elige solo lo que tiene una única opción. `descartados` son los pasos
 * que el cliente había elegido y se perdieron, para avisarle.
 */
export function normalizar(
  kits: KitConfigurable[],
  entrada: SeleccionKit,
): { seleccion: SeleccionKit; descartados: PasoKit[] } {
  const seleccion: SeleccionKit = { ...entrada };
  const descartados: PasoKit[] = [];
  let cortado = false;

  for (const paso of PASOS) {
    if (cortado) {
      if (seleccion[paso]) descartados.push(paso);
      seleccion[paso] = null;
      continue;
    }
    const libres = opciones(kits, paso, seleccion).filter((o) => o.disponible);
    if (seleccion[paso] && !libres.some((o) => o.clave === seleccion[paso])) {
      descartados.push(paso);
      seleccion[paso] = null;
    }
    if (!seleccion[paso] && libres.length === 1) seleccion[paso] = libres[0].clave;
    if (!seleccion[paso]) cortado = true;
  }
  // Un paso de configuración que se resolvió solo no es una pérdida para el cliente.
  return {
    seleccion,
    descartados: descartados.filter((p) => !esVariante(p) || seleccion[p] === null),
  };
}

/** Los kits que encajan con lo elegido hasta ahora. */
export function kitsCompatibles(
  kits: KitConfigurable[],
  sel: SeleccionKit,
): KitConfigurable[] {
  return PASOS.reduce(
    (resto, paso) =>
      sel[paso] ? resto.filter((k) => claveDe(paso, k.config) === sel[paso]) : resto,
    kits,
  );
}

/** El kit final cuando ya están los tres pasos; el más barato si hubiera dos iguales. */
export function kitElegido(
  kits: KitConfigurable[],
  sel: SeleccionKit,
): KitConfigurable | null {
  if (!PASOS.every((p) => sel[p])) return null;
  const coinciden = kitsCompatibles(kits, sel);
  return coinciden.length
    ? coinciden.reduce((a, b) => (b.precio < a.precio ? b : a))
    : null;
}

/**
 * El kit que ilustra la foto: el elegido si ya está completo; si no, el más
 * económico de los que encajan con lo elegido; y si no hay nada, el más
 * económico de todos.
 */
export function kitReferencia(
  kits: KitConfigurable[],
  sel: SeleccionKit,
): KitConfigurable | null {
  const final = kitElegido(kits, sel);
  if (final) return final;
  const candidatos = kitsCompatibles(kits, sel);
  const lista = candidatos.length ? candidatos : kits;
  return lista.length
    ? lista.reduce((a, b) => (b.precio < a.precio ? b : a))
    : null;
}

export interface AlternativaKit {
  /** La selección completa a la que se salta. */
  seleccion: SeleccionKit;
  texto: string;
}

/**
 * Para una opción apagada: con qué cambio sí existe un kit. Primero las que
 * conservan el inversor (y la batería) que el cliente ya eligió.
 */
export function alternativas(
  kits: KitConfigurable[],
  paso: PasoKit,
  clave: string,
  sel: SeleccionKit,
): AlternativaKit[] {
  if (paso !== "bateria" && paso !== "paneles") return [];
  const conLaOpcion = kits.filter((k) => claveDe(paso, k.config) === clave);
  const vistas = new Map<string, { k: KitConfigurable; seleccion: SeleccionKit }>();

  for (const k of conLaOpcion) {
    const completa = seleccionDeKit(k.config);
    const seleccion: SeleccionKit =
      paso === "bateria"
        ? { ...completa, bateriaConfig: null, paneles: null }
        : completa;
    const id =
      paso === "bateria"
        ? `${completa.inversor}|${completa.inversorConfig}`
        : `${completa.inversor}|${completa.inversorConfig}|${completa.bateria}|${completa.bateriaConfig}`;
    const previa = vistas.get(id);
    if (!previa || k.precio < previa.k.precio) vistas.set(id, { k, seleccion });
  }

  return Array.from(vistas.values())
    .sort(
      (a, b) =>
        Number(b.seleccion.inversor === sel.inversor) -
          Number(a.seleccion.inversor === sel.inversor) ||
        Number(b.seleccion.bateria === sel.bateria) -
          Number(a.seleccion.bateria === sel.bateria) ||
        a.k.precio - b.k.precio,
    )
    .slice(0, 4)
    .map(({ k, seleccion }) => ({
      seleccion,
      texto:
        paso === "bateria"
          ? `Inversor ${etiquetaInversorCompleta(k.config)}`
          : `${etiquetaInversorCompleta(k.config)} + ${etiquetaBateriaCompleta(k.config)}`,
    }));
}

// ─── Otras configuraciones de un kit ─────────────────────────────────────────

export interface OpcionAlterna {
  kit: KitConfigurable;
  etiqueta: string;
  detalle: string | null;
  /** Precio de este kit menos el del kit que se está mirando. */
  diferencia: number;
  esActual: boolean;
  /** Para ordenar: kW, kWh o número de paneles. */
  valor: number;
}

export interface GrupoAlterno {
  grupo: GrupoKit;
  titulo: string;
  opciones: OpcionAlterna[];
}

const PASOS_DE_GRUPO: Record<GrupoKit, PasoKit[]> = {
  inversor: ["inversor", "inversorConfig"],
  bateria: ["bateria", "bateriaConfig"],
  paneles: ["paneles"],
};

const TITULO_GRUPO: Record<GrupoKit, string> = {
  inversor: "Inversor",
  bateria: "Batería",
  paneles: "Paneles",
};

/**
 * Las variantes de un kit que ya tenemos armadas: para cada bloque (paneles,
 * batería, inversor), los kits que solo cambian eso y dejan igual el resto.
 * Un bloque sin variantes no aparece. Son las configuraciones por defecto:
 * cualquier otra se pide por contacto.
 */
export function otrasConfiguraciones(
  kits: KitConfigurable[],
  actual: KitConfigurable,
): GrupoAlterno[] {
  const sel = seleccionDeKit(actual.config);
  const grupos: GrupoAlterno[] = [];

  for (const grupo of ["paneles", "bateria", "inversor"] as GrupoKit[]) {
    const propios = PASOS_DE_GRUPO[grupo];
    const resto = GRUPOS.filter((g) => g !== grupo).flatMap((g) => PASOS_DE_GRUPO[g]);
    const claveGrupo = (c: ConfigKit) => propios.map((p) => claveDe(p, c)).join("|");
    const claveActual = claveGrupo(actual.config);

    // Una por variante distinta: la más económica.
    const porVariante = new Map<string, KitConfigurable>();
    for (const k of kits) {
      if (k.id === actual.id) continue;
      if (!resto.every((p) => claveDe(p, k.config) === sel[p])) continue;
      const clave = claveGrupo(k.config);
      if (clave === claveActual) continue;
      const previa = porVariante.get(clave);
      if (!previa || k.precio < previa.precio) porVariante.set(clave, k);
    }
    if (porVariante.size === 0) continue;

    const opcion = (k: KitConfigurable, esActual: boolean): OpcionAlterna => {
      const c = k.config;
      return {
        kit: k,
        esActual,
        diferencia: k.precio - actual.precio,
        etiqueta:
          grupo === "paneles"
            ? etiquetaPaneles(c)
            : grupo === "bateria"
              ? etiquetaBateriaCompleta(c)
              : etiquetaInversorCompleta(c),
        detalle: grupo === "paneles" ? detalleOpcion("paneles", c) : null,
        valor: grupo === "paneles" ? c.paneles : grupo === "bateria" ? c.bateriaKwh : c.inversorKw,
      };
    };

    grupos.push({
      grupo,
      titulo: TITULO_GRUPO[grupo],
      opciones: [
        opcion(actual, true),
        ...Array.from(porVariante.values()).map((k) => opcion(k, false)),
      ].sort((a, b) => a.valor - b.valor),
    });
  }
  return grupos;
}

// ─── Rótulos y ayudas ────────────────────────────────────────────────────────

export function etiquetaInversor(c: ConfigKit): string {
  return c.inversorUnidades > 1
    ? `${c.inversorUnidades} × ${cifra(c.inversorKw / c.inversorUnidades)} kW`
    : `${cifra(c.inversorKw)} kW`;
}

export function etiquetaBateria(c: ConfigKit): string {
  if (c.bateriaUnidades === 0) return "Sin batería";
  return c.bateriaUnidades > 1
    ? `${c.bateriaUnidades} × ${cifra(c.bateriaKwh / c.bateriaUnidades)} kWh`
    : `${cifra(c.bateriaKwh)} kWh`;
}

export function etiquetaPaneles(c: ConfigKit): string {
  if (c.paneles === 0) return "Sin paneles";
  return `${c.paneles} ${c.paneles === 1 ? "panel" : "paneles"}`;
}

/** "10 kW": lo que compara el cliente, sin decir cómo se logra. */
export const etiquetaPotenciaInversor = (c: ConfigKit) => `${cifra(c.inversorKw)} kW`;

export const etiquetaPotenciaBateria = (c: ConfigKit) =>
  c.bateriaUnidades === 0 ? "Sin batería" : `${cifra(c.bateriaKwh)} kWh`;

/** "10 kW (2 × 5 kW)": la potencia y, si hace falta, cómo se logra. */
export function etiquetaInversorCompleta(c: ConfigKit): string {
  return c.inversorUnidades > 1
    ? `${cifra(c.inversorKw)} kW (${c.inversorUnidades} × ${cifra(c.inversorKw / c.inversorUnidades)} kW)`
    : `${cifra(c.inversorKw)} kW`;
}

export function etiquetaBateriaCompleta(c: ConfigKit): string {
  if (c.bateriaUnidades === 0) return "Sin batería";
  return c.bateriaUnidades > 1
    ? `${cifra(c.bateriaKwh)} kWh (${c.bateriaUnidades} × ${cifra(c.bateriaKwh / c.bateriaUnidades)} kWh)`
    : `${cifra(c.bateriaKwh)} kWh`;
}

/** Las opciones de configuración: "1 inversor de 10 kW", "2 inversores de 5 kW". */
export function etiquetaVarianteInversor(c: ConfigKit): string {
  const por = cifra(c.inversorKw / c.inversorUnidades);
  return c.inversorUnidades > 1
    ? `${c.inversorUnidades} inversores de ${por} kW`
    : `1 inversor de ${por} kW`;
}

export function etiquetaVarianteBateria(c: ConfigKit): string {
  const por = cifra(c.bateriaKwh / Math.max(c.bateriaUnidades, 1));
  return c.bateriaUnidades > 1
    ? `${c.bateriaUnidades} baterías de ${por} kWh`
    : `1 batería de ${por} kWh`;
}

/** "1 × 10 kW", "2 × 5 kW": las formas distintas que hay dentro de una potencia. */
function formasDe(
  kits: KitConfigurable[],
  unidades: (c: ConfigKit) => number,
  total: (c: ConfigKit) => number,
  unidad: string,
): string[] {
  const porUnidades = new Map<number, number>();
  for (const k of kits) {
    const u = unidades(k.config);
    if (u > 0) porUnidades.set(u, total(k.config));
  }
  return Array.from(porUnidades.entries())
    .sort(([a], [b]) => a - b)
    .map(([u, t]) => `${u} × ${cifra(t / u)} ${unidad}`);
}

/**
 * Segunda línea de la opción, en texto normal. En la potencia (o capacidad)
 * dice cómo se instala: una forma, o las que haya si son varias.
 */
export function detalleOpcion(
  paso: PasoKit,
  c: ConfigKit,
  enRama: KitConfigurable[] = [],
): string | null {
  if (paso === "inversor" || paso === "bateria") {
    const inversor = paso === "inversor";
    const formas = formasDe(
      enRama,
      (x) => (inversor ? x.inversorUnidades : x.bateriaUnidades),
      (x) => (inversor ? x.inversorKw : x.bateriaKwh),
      inversor ? "kW" : "kWh",
    );
    if (formas.length > 1) return `Se instala como ${formas.join(" o ")}`;
    const unidades = inversor ? c.inversorUnidades : c.bateriaUnidades;
    if (unidades > 1) {
      const por = cifra(inversor ? c.inversorKw / unidades : c.bateriaKwh / unidades);
      return `Se instala con ${unidades} ${inversor ? "inversores" : "baterías"} de ${por} ${inversor ? "kW" : "kWh"}`;
    }
    return null;
  }
  if (paso !== "paneles") return null;
  if (c.paneles > 0 && c.panelW) {
    const techo = c.panelM2 ? ` · unos ${Math.round(c.paneles * c.panelM2)} m² de techo` : "";
    return `${c.paneles} × ${c.panelW} W · ${cifra((c.paneles * c.panelW) / 1000)} kW${techo}`;
  }
  return null;
}

// Las ayudas son una sola frase y orientativas, por rangos y no por valores
// exactos, para que un kit nuevo (6 kW, 20 kWh, 24 paneles…) tenga ayuda sin
// tocar este archivo. No prometen qué equipos aguantan: eso depende de cada casa.

export function ayudaInversor(c: ConfigKit): string {
  return c.inversorKw <= 4
    ? "Para lo básico: luces, TV, ventiladores y nevera."
    : c.inversorKw <= 6.5
      ? "Para una casa con nevera, TV, ventiladores y un aire acondicionado."
      : c.inversorKw <= 9
        ? "Para varios equipos de potencia a la vez, como más de un aire."
        : "La mayor potencia: para casas con mucha carga a la vez.";
}

export function ayudaBateria(c: ConfigKit): string {
  if (c.bateriaUnidades === 0) return "Sin batería no hay respaldo cuando se va la corriente.";
  return c.bateriaKwh <= 6
    ? "Respaldo básico: mantiene lo esencial unas horas."
    : c.bateriaKwh <= 12
      ? "Más horas sin corriente, o la noche con consumos básicos."
      : c.bateriaKwh <= 15
        ? "Reserva amplia para cortes largos."
        : "La mayor reserva: cortes largos o varios equipos de noche.";
}

export function ayudaVarianteInversor(c: ConfigKit): string {
  return c.inversorUnidades > 1
    ? "Varios equipos que suman la potencia."
    : "Un solo equipo: instalación más sencilla.";
}

export function ayudaVarianteBateria(c: ConfigKit): string {
  return c.bateriaUnidades > 1
    ? "Varios módulos que suman la capacidad."
    : "Un solo módulo para toda la capacidad.";
}

export function ayudaPaneles(c: ConfigKit): string {
  return c.paneles === 0
    ? "La batería se carga de la red cuando hay corriente."
    : "Generas tu propia energía de día para consumir y recargar la batería.";
}

/** Texto gris que acompaña la foto, distinto en cada paso. */
const CAPTION_INVERSOR =
  "El inversor es el cerebro del kit: convierte la energía de los paneles y la batería en la corriente de tu casa.";
const CAPTION_BATERIA =
  "La batería guarda energía para cuando no hay corriente ni sol. Más kWh, más horas de autonomía.";

export const CAPTION_PASO: Record<PasoKit, string> = {
  inversor: CAPTION_INVERSOR,
  inversorConfig: CAPTION_INVERSOR,
  bateria: CAPTION_BATERIA,
  bateriaConfig: CAPTION_BATERIA,
  paneles:
    "Los paneles generan tu energía durante el día y recargan la batería. Más paneles, más energía.",
};

export const AYUDA_PASO: Record<PasoKit, string> = {
  inversorConfig:
    "La misma potencia se puede lograr con un equipo grande o con varios más pequeños. Aquí ves las formas que tenemos armadas.",
  bateriaConfig:
    "La misma capacidad se puede lograr con un módulo grande o con varios más pequeños. Aquí ves las formas que tenemos armadas.",
  inversor:
    "Su potencia (kW) marca cuántos equipos puedes usar a la vez: suma los que quieras encender juntos y ten en cuenta que los de motor (aire acondicionado, bomba, nevera) gastan más al arrancar.",
  bateria:
    "Piensa en cuántas horas quieres aguantar sin corriente y con qué equipos. Las opciones apagadas no tienen un kit armado con el inversor que elegiste.",
  paneles:
    "Con más paneles recargas más rápido y gastas menos de la red; sin ellos, la batería solo se carga cuando hay corriente. Lo que cabe depende del espacio de tu techo.",
};
