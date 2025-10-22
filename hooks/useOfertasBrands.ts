import { useState, useEffect, useMemo } from 'react';
import { OfertaSimplificada } from '@/types/ofertas';

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

        const response = await fetch('/api/ofertas/simplified');
        const data = await response.json();

        if (data.success) {
          setOfertas(data.data);
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
