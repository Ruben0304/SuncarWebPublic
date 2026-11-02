import { obtenerOfertasPublicas } from "@/lib/ofertas/ofertas-publicas-server";

// Las páginas de kit (/ofertas/[slug]) son dinámicas: no existen como
// archivos en build, así que @astrojs/sitemap no puede descubrirlas solo.
// Este endpoint arma su propio sitemap, generado en cada visita con el
// catálogo real — a diferencia del public/sitemap.xml estático, que lista
// las páginas fijas del sitio pero no puede saber qué kits hay hoy.
export async function GET() {
  const kits = (await obtenerOfertasPublicas()) ?? [];

  const urls = kits
    .filter((kit) => kit.id)
    .map(
      (kit) =>
        `<url><loc>https://suncarsrl.com/ofertas/${encodeURIComponent(kit.id!)}</loc></url>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
