import type { ZonaId } from "./zonas";

// Dos composiciones de la misma casa: vertical para móvil y apaisada para
// escritorio. Comparten los dibujos de cada equipo (CasaSolar los coloca) y de
// aquí salen también los botones, centrados sobre su equipo.

export type Equipo =
  | "ventana"
  | "estante"
  | "ventilador"
  | "nevera"
  | "breaker"
  | "baterias"
  | "inversor";

export interface Colocacion {
  equipo: Equipo;
  /** Equipos de pie: centro de la base. Equipos de pared: su centro. */
  x: number;
  y: number;
}

export interface Cuarto {
  arriba: number;
  abajo: number;
  suelo: "madera" | "losa";
}

/** Un volumen de la casa: interior entre x0 y x1, con sus plantas de arriba abajo. */
export interface Bloque {
  x0: number;
  x1: number;
  cuartos: Cuarto[];
  /** Columnas de paneles sobre su azotea. */
  paneles: number;
}

/** Lo que CasaSolar necesita para dibujar una casa. */
export interface Escenario {
  /** Encuadre del dibujo. */
  caja: { x: number; y: number; w: number; h: number };
  /** Cota de la acera: aquí apoya la casa. */
  suelo: number;
  bloques: Bloque[];
  equipos: Colocacion[];
  lamparas: [number, number][];
  /** Corriente continua de los paneles al inversor. */
  cablesSolar: string[];
  /** Corriente continua entre el inversor y las baterías. */
  cablesBateria: string[];
  cablesAc: string[];
}

/** La casa de la tienda: con sus botones, la nube, el letrero y el carrito. */
export interface Diseno extends Escenario {
  /** Un botón por zona; los de equipos van sobre el centro del equipo. */
  pines: { zona: ZonaId; x: number; y: number }[];
  nube: { x: number; y: number };
  letrero: { x: number; y: number };
  carrito: { x: number; y: number };
}

export const DISENO_ESCRITORIO: Diseno = {
  caja: { x: 110, y: 96, w: 910, h: 616 },
  suelo: 626,
  bloques: [
    {
      x0: 152,
      x1: 468,
      cuartos: [
        { arriba: 218, abajo: 404, suelo: "madera" },
        { arriba: 420, abajo: 626, suelo: "losa" },
      ],
      paneles: 3,
    },
    {
      x0: 500,
      x1: 848,
      cuartos: [{ arriba: 438, abajo: 626, suelo: "losa" }],
      paneles: 4,
    },
  ],
  equipos: [
    { equipo: "ventana", x: 232, y: 294 },
    { equipo: "estante", x: 313, y: 396 },
    { equipo: "ventilador", x: 410, y: 396 },
    { equipo: "nevera", x: 206, y: 618 },
    { equipo: "breaker", x: 410, y: 530 },
    { equipo: "baterias", x: 596, y: 618 },
    { equipo: "inversor", x: 790, y: 500 },
  ],
  lamparas: [
    [350, 218],
    [690, 438],
  ],
  cablesSolar: ["M444 192V206H484V452H790V460", "M826 412V460"],
  cablesBateria: ["M760 522H622V542"],
  cablesAc: ["M790 540V620H410V554", "M392 530H234"],
  pines: [
    { zona: "paneles", x: 310, y: 154 },
    { zona: "cableado", x: 484, y: 340 },
    { zona: "material", x: 313, y: 356 },
    { zona: "electrodomesticos", x: 206, y: 555 },
    { zona: "protecciones", x: 410, y: 530 },
    { zona: "baterias", x: 596, y: 580 },
    { zona: "inversor", x: 790, y: 500 },
  ],
  nube: { x: 620, y: 168 },
  letrero: { x: 900, y: 225 },
  carrito: { x: 950, y: 630 },
};

export const DISENO_MOVIL: Diseno = {
  caja: { x: 30, y: -160, w: 590, h: 1240 },
  suelo: 1000,
  bloques: [
    {
      x0: 76,
      x1: 484,
      cuartos: [
        { arriba: 398, abajo: 588, suelo: "madera" },
        { arriba: 604, abajo: 794, suelo: "losa" },
        { arriba: 810, abajo: 1000, suelo: "losa" },
      ],
      paneles: 4,
    },
  ],
  equipos: [
    { equipo: "ventana", x: 150, y: 480 },
    { equipo: "estante", x: 262, y: 580 },
    { equipo: "ventilador", x: 400, y: 580 },
    { equipo: "nevera", x: 140, y: 786 },
    { equipo: "breaker", x: 396, y: 700 },
    { equipo: "baterias", x: 170, y: 992 },
    { equipo: "inversor", x: 390, y: 890 },
  ],
  lamparas: [
    [330, 398],
    [280, 810],
  ],
  cablesSolar: ["M462 372V386H492V826H390V850"],
  cablesBateria: ["M360 900H196V916"],
  cablesAc: ["M420 880H468V712H414", "M378 700H168"],
  pines: [
    { zona: "paneles", x: 380, y: 334 },
    { zona: "cableado", x: 492, y: 470 },
    { zona: "material", x: 262, y: 540 },
    { zona: "electrodomesticos", x: 140, y: 723 },
    { zona: "protecciones", x: 396, y: 700 },
    { zona: "baterias", x: 170, y: 954 },
    { zona: "inversor", x: 390, y: 890 },
  ],
  nube: { x: 200, y: -20 },
  letrero: { x: 440, y: 180 },
  carrito: { x: 560, y: 1004 },
};
