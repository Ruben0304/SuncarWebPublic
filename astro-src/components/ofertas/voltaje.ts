/** Un kit de 220 V también sirve para 110 V: decir solo «220» parece restrictivo. */
export function etiquetaVoltaje(voltaje: number): string {
  return voltaje === 220 ? "110-220 V" : `${voltaje} V`;
}
