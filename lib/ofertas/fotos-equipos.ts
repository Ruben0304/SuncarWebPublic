// Fotos para "Ver cómo quedaría": con fondo transparente, recortadas al equipo
// y en webp de pocos KB (public/equipos). Las de los inversores de 3 y 5 kW
// (códigos 10005 y 10006, serie IVEM-LV) y la batería de 5,12 kWh (11, FLA48100)
// son los renders oficiales del catálogo de felicitysolar.com, en 800 px; la de
// 14,3 kWh también es oficial (FLA48280). El resto salen de las fotos del
// catálogo propio, con el fondo blanco quitado. Las versiones completas de
// cada material, para el catálogo, están en public/equipos/felicity.
//
// `altoM` es el alto real del equipo en metros: la escena lo dibuja a escala
// contra la altura del cuarto (2,7 m). Un equipo que no esté aquí se dibuja
// con su foto del catálogo si la tiene.

export interface FotoEquipo {
  src: string;
  /** Ancho / alto de la imagen. */
  aspecto: number;
  /** Alto real, en metros. */
  altoM: number;
}

const FOTOS: Record<string, FotoEquipo> = {
  // Inversores
  "10001": { src: "/equipos/inversor-felicity-8kw.webp", aspecto: 209 / 360, altoM: 0.62 },
  "10004": { src: "/equipos/inversor-felicity-bf-5kw.webp", aspecto: 269 / 360, altoM: 0.55 },
  "10005": { src: "/equipos/inversor-felicity-3kw.webp", aspecto: 266 / 360, altoM: 0.5 },
  "10006": { src: "/equipos/inversor-felicity-5kw.webp", aspecto: 266 / 360, altoM: 0.55 },
  // Baterías
  "11": { src: "/equipos/bateria-felicity-fla48100-5kwh.webp", aspecto: 220 / 360, altoM: 0.62 },
  "LUX-Y-48280LG01": { src: "/equipos/bateria-felicity-fla48280-14kwh.webp", aspecto: 158 / 360, altoM: 1.1 },
  "FLA 48314": { src: "/equipos/bateria-felicity-16kwh.webp", aspecto: 166 / 360, altoM: 1.05 },
};

/** Piezas genéricas del kit, con la misma foto sea cual sea el modelo. */
export const FOTOS_FIJAS = {
  panel: { src: "/equipos/panel.webp", aspecto: 216 / 360, altoM: 2.28 },
  gabinete: { src: "/equipos/gabinete.webp", aspecto: 257 / 240, altoM: 0.34 },
  transferencial: { src: "/equipos/transferencial.webp", aspecto: 132 / 240, altoM: 0.24 },
  // Un portafusibles real mide 9 cm: se agranda para que se reconozca.
  portafusible: { src: "/equipos/portafusible.webp", aspecto: 234 / 200, altoM: 0.16 },
} satisfies Record<string, FotoEquipo>;

/** Foto para un equipo del kit; si no está aquí, la del catálogo. */
export function fotoDeEquipo(
  codigo: string | null,
  fotoCatalogo: string | null,
  altoM: number,
): FotoEquipo | null {
  if (codigo && FOTOS[codigo]) return FOTOS[codigo];
  return fotoCatalogo ? { src: fotoCatalogo, aspecto: 1, altoM } : null;
}
