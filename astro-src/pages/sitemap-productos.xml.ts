import { urlProducto } from "@/lib/tienda/url-producto";
import { obtenerCatalogoWebPublico } from "@/lib/tienda/catalogo-publico-server";

// Mismo motivo que sitemap-ofertas.xml.ts: /productos/[id] es dinámica y
// @astrojs/sitemap no puede descubrirla sola.
export async function GET() {
  const productos = await obtenerCatalogoWebPublico();

  const urls = productos
    .map((p) => `<url><loc>https://suncarsrl.com${urlProducto(p.id)}</loc></url>`)
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
