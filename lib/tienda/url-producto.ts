/**
 * Ruta de la ficha de un producto. Algunos ids llevan «/» (p. ej. "LDS1-4P-200GA/4P")
 * y el servidor rechaza «%2F» en la ruta, así que se codifica cada tramo y la
 * barra va tal cual; /productos/[...id] la recompone.
 */
export const urlProducto = (id: string): string =>
  `/productos/${id.split("/").map(encodeURIComponent).join("/")}`;
