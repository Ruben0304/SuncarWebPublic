import { useState, useEffect } from 'react';
import { contactoService, Contacto } from '../services/api/contactoService';

interface UseContactosReturn {
  contactos: Contacto[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useContactos(): UseContactosReturn {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContactos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await contactoService.getContactos();
      setContactos(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los contactos';
      setError(errorMessage);
      console.error('Error fetching contactos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactos();
  }, []);

  return { contactos, loading, error, refetch: fetchContactos };
}
