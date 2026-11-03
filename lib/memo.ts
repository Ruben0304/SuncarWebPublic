// Caché en memoria con vencimiento y deduplicación de llamadas en vuelo.
//
// Fuera de Next, `fetch(url, { next: { revalidate } })` no hace nada: cada
// render pegaba al backend. Esto devuelve ese comportamiento (y de paso evita
// que diez visitas simultáneas disparen diez llamadas iguales).
//
// Solo se guarda lo que `fn` devuelve distinto de null/undefined: un fallo del
// backend no queda "pegado" en la caché; la siguiente visita lo reintenta.

interface Entrada<T> {
  valor: T;
  vence: number;
}

const guardado = new Map<string, Entrada<unknown>>();
const enVuelo = new Map<string, Promise<unknown>>();
const MAX_ENTRADAS = 500;

export async function memo<T>(clave: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = guardado.get(clave) as Entrada<T> | undefined;
  if (hit && hit.vence > Date.now()) return hit.valor;

  const pendiente = enVuelo.get(clave) as Promise<T> | undefined;
  if (pendiente) return pendiente;

  const promesa = (async () => {
    try {
      const valor = await fn();
      if (valor !== null && valor !== undefined) {
        guardado.delete(clave);
        guardado.set(clave, { valor, vence: Date.now() + ttlMs });
        if (guardado.size > MAX_ENTRADAS) guardado.delete(guardado.keys().next().value as string);
      }
      return valor;
    } finally {
      enVuelo.delete(clave);
    }
  })();
  enVuelo.set(clave, promesa);
  return promesa;
}
