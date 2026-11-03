// Geometría de la casa en corte (CasaSolar.svelte): paneles en perspectiva,
// muros, losas y azoteas calculados a partir del diseño.
import type { Bloque, Equipo } from "@/components/tienda/disenos";
import type { ZonaId } from "@/components/tienda/zonas";

export type P = [number, number];
/** sup-izq, sup-der, inf-der, inf-izq */
export type Cuad = [P, P, P, P];

const r = (n: number) => Math.round(n * 10) / 10;
const mezcla = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const en = (q: Cuad, u: number, v: number): P =>
  mezcla(mezcla(q[0], q[1], u), mezcla(q[3], q[2], u), v);
export const pt = ([x, y]: P) => `${r(x)},${r(y)}`;
export const linea = (a: P, b: P) => `M${pt(a)}L${pt(b)}`;

/**
 * Módulos sobre su estructura inclinada, en perspectiva y con las celdas.
 * Con `cantidad` se dibujan solo esos, centrados y de dos en dos; si no caben
 * en las columnas del techo, se estrechan.
 */
function generarPaneles(q: Cuad, cols: number, filas: number, cantidad = cols * filas) {
  const hueco = 0.014;
  const usadas = Math.ceil(cantidad / filas);
  const total = Math.max(cols, usadas);
  const margen = (total - usadas) / 2;
  const paneles: string[] = [];
  let celdas = "";
  for (let n = 0; n < cantidad; n++) {
    const c = margen + Math.floor(n / filas);
    const f = n % filas;
    const u0 = c / total + hueco;
    const u1 = (c + 1) / total - hueco;
    const v0 = f / filas + hueco * 2;
    const v1 = (f + 1) / filas - hueco * 2;
    paneles.push([en(q, u0, v0), en(q, u1, v0), en(q, u1, v1), en(q, u0, v1)].map(pt).join(" "));
    for (let i = 1; i < 6; i++) {
      const u = u0 + ((u1 - u0) * i) / 6;
      celdas += linea(en(q, u, v0), en(q, u, v1));
    }
    for (let i = 1; i < 8; i++) {
      const v = v0 + ((v1 - v0) * i) / 8;
      celdas += linea(en(q, u0, v), en(q, u1, v));
    }
  }
  const desde = margen / total;
  const hasta = (margen + usadas) / total;
  return {
    paneles,
    celdas,
    contorno: [en(q, desde, 0), en(q, hasta, 0), en(q, hasta, 1), en(q, desde, 1)].map(pt).join(" "),
  };
}

/** Geometría de un bloque: paredes, losas, azotea y su campo de paneles. */
export function geometria(b: Bloque, pegadoIzq: boolean, suelo: number) {
  const techo = b.cuartos[0].arriba;
  const izq = pegadoIzq ? b.x0 - 16 : b.x0 - 24;
  const der = b.x1 + 24;
  const campo: Cuad = [
    [b.x0 + 26, techo - 102],
    [b.x1 - 28, techo - 102],
    [b.x1 - 10, techo - 26],
    [b.x0 + 6, techo - 26],
  ];
  return {
    techo,
    muros: [
      { x: b.x0 - 16, y: techo - 20, w: 16, h: suelo - techo + 20 },
      { x: b.x1, y: techo - 20, w: 16, h: suelo - techo + 20 },
    ],
    losas: b.cuartos.slice(1).map((c, i) => ({
      x: b.x0 - 16,
      y: b.cuartos[i].abajo,
      w: b.x1 - b.x0 + 32,
      h: c.arriba - b.cuartos[i].abajo,
    })),
    cubierta: { x: izq, y: techo - 20, w: der - izq },
    azotea: `${izq},${techo - 20} ${der},${techo - 20} ${b.x1 + 6},${techo - 48} ${pegadoIzq ? izq + 14 : b.x0 - 6},${techo - 48}`,
    paneles: generarPaneles(campo, b.paneles, 2),
    patas: `M${pt(campo[1])}L${b.x1 - 16} ${techo - 42}L${pt(campo[2])}M${pt(campo[0])}L${b.x0 + 18} ${techo - 42}L${pt(campo[3])}`,
    sombraPaneles: `${b.x0 + 8},${techo - 24} ${b.x1 - 10},${techo - 24} ${b.x1 - 2},${techo - 18} ${b.x0},${techo - 18}`,
  };
}

/** A qué zona del catálogo pertenece cada equipo (los que no están, no son tocables). */
export const ZONA_DE: Partial<Record<Equipo, ZonaId>> = {
  estante: "material",
  ventilador: "electrodomesticos",
  nevera: "electrodomesticos",
  breaker: "protecciones",
  baterias: "baterias",
  inversor: "inversor",
};
