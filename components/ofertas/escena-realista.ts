import { FOTOS_FIJAS, type FotoEquipo } from "@/lib/ofertas/fotos-equipos";

// Geometría de la casa realista de "Ver cómo quedaría": una planta, un cuarto
// fotografiado, paneles reales en la azotea y los equipos del kit a escala.
// Separada del componente para poder comprobar que nada se pisa.

export interface ContenidoKit {
  paneles: number;
  inversor: { cantidad: number; foto: FotoEquipo | null };
  baterias: { cantidad: number; foto: FotoEquipo | null } | null;
  proteccionDc: boolean;
  tablero: { gabinete: boolean; transferencial: boolean } | null;
}

export interface Variante {
  caja: { x: number; y: number; w: number; h: number };
  casa: { x0: number; x1: number; muro: number; losaArriba: number; losaGrosor: number; suelo: number };
  /** Foto del cuarto (pared y suelo de frente). */
  fondo: { src: string; aspecto: number };
  paneles: { x0: number; x1: number; anchoMax: number };
  proteccion: { x: number; y: number };
  inversor: { x: number; y: number; min: number; max: number };
  baterias: { x: number; min: number; max: number };
  tablero: { x: number; y: number };
  /** Dónde va la etiqueta del tablero respecto a él. */
  etiquetaTablero: "arriba" | "abajo";
  /** Antena de internet en la azotea: mástil en x, de este alto. */
  antena: { x: number; alto: number };
}

/**
 * Alto del cuarto "a efectos de escala". Un cuarto real mide unos 2,7 m; con
 * 2,5 los equipos salen algo más grandes de lo exacto y se leen mejor.
 */
const ALTO_CUARTO_M = 2.5;
/** En la foto del cuarto, el suelo ocupa este tanto del alto, desde abajo. */
const SUELO_EN_FOTO = 0.193;
const SEPARACION = 12;
/** Alto del pretil de la azotea (≈ 30 cm), en unidades de la casa. */
export const PRETIL = 34;

// Encuadres ajustados a la casa: poco cielo encima de los paneles y una franja
// de acera abajo. El vertical tiene la proporción de un móvil, así el cuarto
// llena la pantalla de lado a lado.
export const VERTICAL: Variante = {
  caja: { x: 6, y: 140, w: 508, h: 846 },
  casa: { x0: 30, x1: 490, muro: 30, losaArriba: 262, losaGrosor: 38, suelo: 940 },
  fondo: { src: "/equipos/cuarto.webp", aspecto: 1200 / 1697 },
  paneles: { x0: 60, x1: 440, anchoMax: 54 },
  proteccion: { x: 130, y: 330 },
  inversor: { x: 140, y: 560, min: 66, max: 250 },
  baterias: { x: 360, min: 262, max: 456 },
  tablero: { x: 380, y: 380 },
  etiquetaTablero: "abajo",
  antena: { x: 462, alto: 112 },
};

export const HORIZONTAL: Variante = {
  caja: { x: 80, y: 116, w: 860, h: 600 },
  casa: { x0: 120, x1: 900, muro: 30, losaArriba: 250, losaGrosor: 36, suelo: 666 },
  fondo: { src: "/equipos/cuarto-ancho.webp", aspecto: 1600 / 1131 },
  paneles: { x0: 160, x1: 820, anchoMax: 66 },
  proteccion: { x: 230, y: 340 },
  inversor: { x: 400, y: 410, min: 300, max: 520 },
  baterias: { x: 640, min: 560, max: 840 },
  tablero: { x: 790, y: 360 },
  etiquetaTablero: "abajo",
  antena: { x: 868, alto: 118 },
};

export interface Caja {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ImagenColocada extends Caja {
  src: string;
}

export interface PanelColocado extends Caja {
  /** 0 = fila de atrás (más alta y algo más pequeña), 1 = delante. */
  fila: number;
}

/**
 * Equipos iguales en fila, centrados en cx sin salirse de [min, max]. Si no
 * caben de lado, se apilan como en la instalación real: los de pared uno
 * encima de otro alrededor de su centro, los de suelo hacia arriba desde la
 * base (las baterías en su rack).
 */
function fila(
  foto: FotoEquipo,
  cantidad: number,
  metro: number,
  cx: number,
  min: number,
  max: number,
  base: number,
  enPared: boolean,
) {
  const h = foto.altoM * metro;
  const w = h * foto.aspecto;
  const ancho = cantidad * w + (cantidad - 1) * SEPARACION;
  if (ancho <= max - min) {
    const x0 = Math.max(min, Math.min(cx - ancho / 2, max - ancho));
    return Array.from({ length: cantidad }, (_, i) => ({
      src: foto.src,
      x: x0 + i * (w + SEPARACION),
      y: base - h,
      w,
      h,
    }));
  }
  const alto = cantidad * h + (cantidad - 1) * SEPARACION;
  const x = Math.max(min, Math.min(cx - w / 2, max - w));
  const arriba = enPared ? base - h / 2 - alto / 2 : base - alto;
  return Array.from({ length: cantidad }, (_, i) => ({
    src: foto.src,
    x,
    y: arriba + i * (h + SEPARACION),
    w,
    h,
  }));
}

const envolvente = (cajas: Caja[]): Caja => {
  const x0 = Math.min(...cajas.map((c) => c.x));
  const y0 = Math.min(...cajas.map((c) => c.y));
  const x1 = Math.max(...cajas.map((c) => c.x + c.w));
  const y1 = Math.max(...cajas.map((c) => c.y + c.h));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
};

export function componer(v: Variante, kit: ContenidoKit) {
  const { casa } = v;
  const interior = {
    x0: casa.x0 + casa.muro,
    x1: casa.x1 - casa.muro,
    y0: casa.losaArriba + casa.losaGrosor,
    y1: casa.suelo,
  };
  const metro = (interior.y1 - interior.y0) / ALTO_CUARTO_M;
  // La foto cubre el cuarto entero, pegada abajo: el suelo queda abajo y lo
  // que sobra se recorta por arriba o por los lados.
  const anchoInterior = interior.x1 - interior.x0;
  const altoFoto = Math.max(anchoInterior / v.fondo.aspecto, interior.y1 - interior.y0);
  const foto = {
    x: interior.x0 + (anchoInterior - altoFoto * v.fondo.aspecto) / 2,
    y: interior.y1 - altoFoto,
    w: altoFoto * v.fondo.aspecto,
    h: altoFoto,
  };
  const junta = interior.y1 - SUELO_EN_FOTO * altoFoto;
  const base = junta + 12;

  // Paneles: una fila si son pocos, dos si no; la de atrás más alta y menor.
  const paneles: PanelColocado[] = [];
  if (kit.paneles > 0) {
    const filas = kit.paneles <= 5 ? 1 : 2;
    const porFila = Math.ceil(kit.paneles / filas);
    const hueco = 6;
    const ancho = Math.min(
      v.paneles.anchoMax,
      (v.paneles.x1 - v.paneles.x0 - (porFila - 1) * hueco) / porFila,
    );
    const cx = (v.paneles.x0 + v.paneles.x1) / 2;
    const enFila = filas === 2 ? [kit.paneles - porFila, porFila] : [porFila];
    enFila.forEach((n, f) => {
      const atras = filas === 2 && f === 0;
      const escala = atras ? 0.9 : 1;
      const w = ancho * escala;
      // Visto de frente e inclinado: el panel se acorta en vertical.
      const h = (w / FOTOS_FIJAS.panel.aspecto) * 0.5;
      // Sobre patas, asomando por encima del pretil (PRETIL de alto).
      const abajo = casa.losaArriba - PRETIL + 10 - (atras ? 16 : 0);
      const total = n * w + (n - 1) * hueco * escala;
      for (let i = 0; i < n; i++) {
        paneles.push({ x: cx - total / 2 + i * (w + hueco * escala), y: abajo - h, w, h, fila: f });
      }
    });
  }

  const proteccion = kit.proteccionDc
    ? (() => {
        const f = FOTOS_FIJAS.portafusible;
        const h = f.altoM * metro;
        const w = h * f.aspecto;
        return { src: f.src, x: v.proteccion.x - w / 2, y: v.proteccion.y - h / 2, w, h };
      })()
    : null;

  const fotoInv = kit.inversor.foto ?? { src: "", aspecto: 0.75, altoM: 0.55 };
  const hInv = fotoInv.altoM * metro;
  const inversores = fila(
    fotoInv,
    kit.inversor.cantidad,
    metro,
    v.inversor.x,
    v.inversor.min,
    v.inversor.max,
    v.inversor.y + hInv / 2,
    true,
  );

  const baterias = kit.baterias
    ? fila(
        kit.baterias.foto ?? { src: "", aspecto: 0.45, altoM: 1 },
        kit.baterias.cantidad,
        metro,
        v.baterias.x,
        v.baterias.min,
        v.baterias.max,
        base,
        false,
      )
    : [];

  const tablero: ImagenColocada[] = [];
  if (kit.tablero) {
    const piezas = [
      kit.tablero.gabinete && FOTOS_FIJAS.gabinete,
      kit.tablero.transferencial && FOTOS_FIJAS.transferencial,
    ].filter(Boolean) as FotoEquipo[];
    const tamanos = piezas.map((f) => ({ f, h: f.altoM * metro, w: f.altoM * metro * f.aspecto }));
    const ancho = tamanos.reduce((n, t) => n + t.w, 0) + (tamanos.length - 1) * 8;
    let x = v.tablero.x - ancho / 2;
    for (const t of tamanos) {
      tablero.push({ src: t.f.src, x, y: v.tablero.y - t.h / 2, w: t.w, h: t.h });
      x += t.w + 8;
    }
  }

  // Tubos de PVC por la pared: paneles → protección → inversor → baterías,
  // y del inversor al tablero y de ahí a la casa.
  const inv = envolvente(inversores);
  const tab = tablero.length ? envolvente(tablero) : null;
  const bat = baterias.length ? envolvente(baterias) : null;
  const yInv = inv.y + inv.h * 0.35;
  const tubosSolar: string[] = [];
  if (paneles.length) {
    const xBajada = proteccion ? v.proteccion.x : inv.x + inv.w * 0.25;
    const centro = (v.paneles.x0 + v.paneles.x1) / 2;
    tubosSolar.push(`M${centro} ${casa.losaArriba - 6}H${xBajada}`);
    tubosSolar.push(
      proteccion
        ? `M${xBajada} ${casa.losaArriba - 6}V${proteccion.y}M${xBajada} ${proteccion.y + proteccion.h}V${yInv}H${inv.x + 6}`
        : `M${xBajada} ${casa.losaArriba - 6}V${inv.y + 6}`,
    );
  }
  const tubosBateria = bat
    ? [`M${inv.x + inv.w / 2} ${inv.y + inv.h - 6}V${junta - 14}H${bat.x + bat.w / 2}V${bat.y + bat.h / 2}`]
    : [];
  // El tablero puede quedar a cualquier lado del inversor: el tubo sale por
  // ese lado y del tablero sigue hacia la pared más cercana (la casa).
  const tubosCasa: string[] = [];
  if (tab) {
    const aLaDerecha = tab.x > inv.x;
    const salida = aLaDerecha ? inv.x + inv.w - 6 : inv.x + 6;
    const entrada = aLaDerecha ? tab.x + 6 : tab.x + tab.w - 6;
    const yTab = tab.y + tab.h / 2;
    tubosCasa.push(`M${salida} ${yInv}H${(salida + entrada) / 2}V${yTab}H${entrada}`);
    tubosCasa.push(
      aLaDerecha
        ? `M${tab.x + tab.w - 6} ${tab.y + tab.h * 0.3}H${interior.x1}`
        : `M${tab.x + 6} ${tab.y + tab.h * 0.3}H${interior.x0}`,
    );
  } else {
    tubosCasa.push(`M${inv.x + inv.w - 6} ${yInv}H${interior.x1}`);
  }

  return {
    interior,
    metro,
    junta,
    base,
    foto,
    paneles,
    proteccion,
    inversores,
    baterias,
    tablero,
    tubosSolar,
    tubosBateria,
    tubosCasa,
    cajas: { inversor: inv, baterias: bat, tablero: tab },
  };
}
