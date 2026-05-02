import { BaseApiService } from './baseApiService';
import { RecomendadorRequest, RecomendadorResponse, OfertaSimplificada } from '@/types/ofertas';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractMarca(items?: any[]): string | null {
  if (!items || items.length === 0) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inv = items.find((i: any) => i.categoria?.toUpperCase() === 'INVERSORES');
  if (!inv?.descripcion) return null;
  const words: string[] = inv.descripcion.split(' ');
  const marca = words.filter((w: string, idx: number) => {
    if (idx === 0 && /^inversores?$/i.test(w)) return false;
    if (/^\d+/.test(w) || /^(kw|w|v|a|kwh)$/i.test(w)) return false;
    return /^[A-Z]/.test(w);
  });
  return marca.length > 0 ? marca.join(' ') : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildDescripcion(oferta: any): string {
  const nombre = oferta.nombre_completo || oferta.nombre_oferta || '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = oferta.items || [];
  if (items.length === 0) return nombre;
  const materiales = items
    .filter((i) => i.descripcion)
    .map((i) => `${i.cantidad ? `${i.cantidad}x ` : ''}${i.categoria ? `[${i.categoria}] ` : ''}${i.descripcion}`)
    .join(', ');
  return `${nombre}. Materiales: ${materiales}`;
}

class RecomendadorService extends BaseApiService {
  async recomendarOfertas(texto: string): Promise<RecomendadorResponse> {
    try {
      // 1. Obtener ofertas directamente del backend
      const ofertasRes = await fetch(
        `${BACKEND_URL}/api/ofertas/confeccion/?tipo_oferta=generica&estado=aprobada_para_enviar`,
      );
      if (!ofertasRes.ok) {
        throw new Error(`Error al obtener ofertas: ${ofertasRes.status}`);
      }
      const ofertasData = await ofertasRes.json();
      if (!ofertasData.success || !Array.isArray(ofertasData.data)) {
        throw new Error('No se pudieron obtener las ofertas');
      }

      // 2. Construir payload con descripciones detalladas
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ofertasPayload = ofertasData.data.map((o: any) => ({
        id: o.id || o._id,
        descripcion: o.nombre_completo || o.nombre_oferta || 'Oferta sin nombre',
        descripcion_detallada: buildDescripcion(o),
        precio: o.precio_final,
        moneda: o.moneda_pago,
        imagen: o.foto_portada || null,
        financiamiento: true,
        marca: extractMarca(o.items),
        is_active: o.tipo_oferta === 'generica' && o.estado === 'aprobada_para_enviar',
      }));

      // 3. Llamar al recomendador
      const recomRes = await fetch(`${BACKEND_URL}/api/ofertas/recomendador`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto, ofertas: ofertasPayload }),
      });
      if (!recomRes.ok) {
        throw new Error(`Error del recomendador: ${recomRes.status}`);
      }
      const recomData = await recomRes.json();

      if (!recomData.success || !recomData.data) {
        throw new Error(recomData.message || 'Sin recomendaciones');
      }

      // 4. Mapear respuesta al formato OfertaSimplificada
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const primeraOferta = recomData.data.ofertas?.[0];
      const esArrayDeIds = typeof primeraOferta === 'string';

      let ofertasRecomendadas: OfertaSimplificada[];

      if (esArrayDeIds) {
        // El backend devolvió IDs — mapear a ofertas completas
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ofertasMap = new Map(ofertasData.data.map((o: any) => [o.id || o._id, o]));
        ofertasRecomendadas = (recomData.data.ofertas as string[])
          .map((id) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const o: any = ofertasMap.get(id);
            if (!o) return null;
            return {
              id: o.id || o._id,
              descripcion: o.nombre_completo || o.nombre_oferta || 'Oferta sin nombre',
              descripcion_detallada: buildDescripcion(o),
              marca: extractMarca(o.items),
              precio: o.precio_final,
              precio_cliente: null,
              imagen: o.foto_portada || null,
              moneda: o.moneda_pago,
              financiamiento: true,
              descuentos: null,
              pdf: null,
              is_active: o.tipo_oferta === 'generica' && o.estado === 'aprobada_para_enviar',
            } as OfertaSimplificada;
          })
          .filter(Boolean) as OfertaSimplificada[];
      } else {
        // El backend devolvió objetos completos
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ofertasRecomendadas = recomData.data.ofertas.map((o: any) => ({
          id: o.id,
          descripcion: o.descripcion,
          descripcion_detallada: o.descripcion_detallada || o.descripcion,
          marca: o.marca || null,
          precio: o.precio,
          precio_cliente: o.precio_cliente || null,
          imagen: o.imagen || null,
          moneda: o.moneda || 'USD',
          financiamiento: o.financiamiento !== undefined ? o.financiamiento : true,
          descuentos: o.descuentos || null,
          pdf: o.pdf || null,
          is_active: o.is_active !== undefined ? o.is_active : true,
        }));
      }

      return {
        success: true,
        message: 'Recomendaciones obtenidas exitosamente',
        data: { texto: recomData.data.texto, ofertas: ofertasRecomendadas },
      };
    } catch (error) {
      console.error('Error al obtener recomendaciones:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido al obtener recomendaciones',
      };
    }
  }
}

export const recomendadorService = new RecomendadorService();
