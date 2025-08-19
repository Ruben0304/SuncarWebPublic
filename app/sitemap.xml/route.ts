import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = 'https://suncarsrl.com'
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<!--  created with Free Online Sitemap Generator www.xml-sitemaps.com  -->
<url>
<loc>${baseUrl}/</loc>
<lastmod>${new Date().toISOString()}</lastmod>
<priority>1.00</priority>
</url>
<url>
<loc>${baseUrl}/sobre-nosotros</loc>
<lastmod>${new Date().toISOString()}</lastmod>
<priority>0.80</priority>
</url>
<url>
<loc>${baseUrl}/servicios</loc>
<lastmod>${new Date().toISOString()}</lastmod>
<priority>0.80</priority>
</url>
<url>
<loc>${baseUrl}/contacto</loc>
<lastmod>${new Date().toISOString()}</lastmod>
<priority>0.80</priority>
</url>
<url>
<loc>${baseUrl}/cotizacion</loc>
<lastmod>${new Date().toISOString()}</lastmod>
<priority>0.80</priority>
</url>
<url>
<loc>${baseUrl}/webinfo</loc>
<lastmod>${new Date().toISOString()}</lastmod>
<priority>0.80</priority>
</url>
</urlset>`

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    },
  })
}

export async function HEAD(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, HEAD, OPTIONS',
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
} 