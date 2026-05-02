import { useState, useEffect, useMemo } from 'react';
import { OfertaSimplificada } from '@/types/ofertas';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractMarcaFromItems(items: any[]): string | null {
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

export interface BrandOption {
  key: string;
  label: string;
  count: number;
}

export function useOfertasBrands() {
  const [ofertas, setOfertas] = useState<OfertaSimplificada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const brandOptions = useMemo(() => {
    const brandMap = new Map<string, { label: string; count: number }>();

    ofertas.forEach(oferta => {
      const brand = oferta.marca?.trim();
      if (!brand) {
        return;
      }
      const key = brand.toLowerCase();
      if (!brandMap.has(key)) {
        brandMap.set(key, { label: brand, count: 1 });
      } else {
        const current = brandMap.get(key);
        if (current) {
          brandMap.set(key, { label: current.label, count: current.count + 1 });
        }
      }
    });

    return Array.from(brandMap.entries()).map(([key, value]) => ({
      key,
      label: value.label,
      count: value.count
    }));
  }, [ofertas]);

  useEffect(() => {
    const fetchOfertas = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ofertas/confeccion/?tipo_oferta=generica&estado=aprobada_para_enviar`,
        );
        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          // Extraer solo el campo marca que necesita este hook
          const mapped: OfertaSimplificada[] = data.data.map((o: any) => ({
            id: o.numero_oferta || o.id || o._id || null,
            descripcion: o.nombre_completo || o.nombre_oferta || '',
            marca: extractMarcaFromItems(o.items),
            precio: o.precio_final,
            moneda: o.moneda_pago,
            financiamiento: true,
          }));
          setOfertas(mapped);
        } else {
          setError(data.message || 'Error al cargar ofertas');
        }
      } catch (err) {
        console.error('Error fetching ofertas:', err);
        setError('Error de conexión al cargar ofertas');
      } finally {
        setLoading(false);
      }
    };

    fetchOfertas();
  }, []);

  return {
    brandOptions,
    loading,
    error
  };
}
