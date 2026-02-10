import { NextResponse } from 'next/server';
import type {
  BackendProductosResponse,
  BackendMarcasResponse,
  ArticuloTienda,
} from '@/types/tienda';

function normalizeImageUrl(url: string | null | undefined, backendUrl: string): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      console.error('NEXT_PUBLIC_BACKEND_URL no esta definida en variables de entorno');
      return NextResponse.json(
        { success: false, message: 'Error de configuracion del servidor' },
        { status: 500 }
      );
    }

    const [productosRes, marcasRes] = await Promise.all([
      fetch(`${backendUrl}/api/productos/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }),
      fetch(`${backendUrl}/api/marcas/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }),
    ]);

    if (!productosRes.ok) {
      const errorText = await productosRes.text();
      console.error(`Error del backend productos: ${productosRes.status} - ${errorText}`);
      return NextResponse.json(
        { success: false, message: 'Error al obtener catalogo de productos' },
        { status: productosRes.status }
      );
    }

    const productosData: BackendProductosResponse = await productosRes.json();

    // Construir mapa de marcas (degradacion graceful si falla)
    const marcasMap = new Map<string, string>();
    if (marcasRes.ok) {
      try {
        const marcasData: BackendMarcasResponse = await marcasRes.json();
        (marcasData.data || []).forEach((m) => marcasMap.set(m._id, m.nombre));
      } catch (e) {
        console.error('Error parseando respuesta de marcas:', e);
      }
    } else {
      console.warn(`No se pudieron obtener marcas: ${marcasRes.status}`);
    }

    // Transformar y filtrar materiales habilitados para venta web
    const articulos: ArticuloTienda[] = [];

    for (const cat of productosData.data || []) {
      for (const mat of cat.materiales || []) {
        if (!mat.habilitar_venta_web) continue;

        articulos.push({
          id: mat.codigo,
          categoria: cat.categoria,
          modelo: mat.nombre || mat.descripcion || mat.codigo,
          descripcion_uso: mat.descripcion || null,
          foto: normalizeImageUrl(mat.foto, backendUrl),
          unidad: mat.um === 'm' ? 'm' : 'pieza',
          precio: mat.precio,
          precio_por_cantidad: mat.precio_por_cantidad || null,
          especificaciones: mat.especificaciones || null,
          marca_id: mat.marca_id || null,
          marca_nombre: mat.marca_id ? marcasMap.get(mat.marca_id) || null : null,
          potenciaKW: mat.potenciaKW || null,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Productos obtenidos exitosamente',
      data: articulos,
    });
  } catch (error) {
    console.error('Error en productos-catalogo:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
