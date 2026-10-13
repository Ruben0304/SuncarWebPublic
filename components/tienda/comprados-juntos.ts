import { normalizarCategoria } from "@/lib/ofertas/instalacion";
import type { ArticuloTienda } from "@/types/tienda";
import type { OfertaSimplificada } from "@/types/ofertas";

const MAXIMO = 4;

// Dos equipos de la misma categoría son alternativas, no complementos: nadie
// compra un inversor "junto con" otro inversor. Cables y conectores sí van en
// pareja (el rojo con el negro, el MC4 macho con el hembra).
const EQUIPOS = new Set(["INVERSORES", "BATERIAS", "PANELES"]);

/**
 * "Se suele comprar junto con", sacado de los kits publicados: lo que más veces
 * va en el mismo kit que el producto. Si el producto no sale en ningún kit, se
 * miran los kits que llevan algo de su misma categoría, con la mitad de peso.
 *
 * Cables y conectores MC4 van en casi todos los kits: contados tal cual
 * taparían todo lo demás. Por eso cada coincidencia vale menos cuanto más
 * común es el material entre todos los kits.
 *
 * Solo devuelve artículos de `catalogo`, es decir, a la venta en la provincia
 * elegida y con su precio.
 */
export function compradosJuntos(
  producto: ArticuloTienda,
  catalogo: ArticuloTienda[],
  kits: OfertaSimplificada[],
): ArticuloTienda[] {
  const id = String(producto.id);
  const categoria = normalizarCategoria(producto.categoria);
  const conCodigos = kits.filter((k) => k.codigos?.length);

  let delProducto = conCodigos.filter((k) => k.codigos!.includes(id));
  let peso = 2;
  if (delProducto.length === 0) {
    delProducto = conCodigos.filter((k) => k.categorias?.includes(categoria));
    peso = 1;
  }
  if (delProducto.length === 0) return [];

  const enCuantos = new Map<string, number>();
  for (const kit of conCodigos) {
    for (const codigo of kit.codigos!) enCuantos.set(codigo, (enCuantos.get(codigo) ?? 0) + 1);
  }

  const puntos = new Map<string, number>();
  for (const kit of delProducto) {
    for (const codigo of kit.codigos!) {
      if (codigo === id) continue;
      const rareza = Math.log(1 + conCodigos.length / enCuantos.get(codigo)!);
      puntos.set(codigo, (puntos.get(codigo) ?? 0) + peso * rareza);
    }
  }

  const candidatos = catalogo
    .filter((p) => {
      if (String(p.id) === id || !puntos.has(String(p.id))) return false;
      const suya = normalizarCategoria(p.categoria);
      return !(suya === categoria && EQUIPOS.has(categoria));
    })
    .sort((a, b) => puntos.get(String(b.id))! - puntos.get(String(a.id))!);

  // Variedad: primero uno de cada categoría; si no llegan, se repite alguna.
  const elegidos: ArticuloTienda[] = [];
  const categorias = new Set<string>();
  for (const p of candidatos) {
    const c = normalizarCategoria(p.categoria);
    if (categorias.has(c)) continue;
    categorias.add(c);
    elegidos.push(p);
  }
  for (const p of candidatos) {
    if (elegidos.length >= MAXIMO) break;
    if (!elegidos.includes(p)) elegidos.push(p);
  }
  return elegidos.slice(0, MAXIMO);
}
