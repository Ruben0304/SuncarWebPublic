import { BaseApiService } from './baseApiService';
import { RecomendadorRequest, RecomendadorResponse } from '@/types/ofertas';

class RecomendadorService extends BaseApiService {
  async recomendarOfertas(texto: string): Promise<RecomendadorResponse> {
    try {
      const request: RecomendadorRequest = { texto };

      // Llamar al endpoint proxy de Next.js en lugar del backend directamente
      // El proxy se encarga de obtener las ofertas de confección y enviarlas al backend
      const response = await fetch('/api/ofertas/recomendador', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del recomendador:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: RecomendadorResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener recomendaciones:', error);

      // Retornar un error estructurado
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido al obtener recomendaciones'
      };
    }
  }
}

// Exportar instancia singleton para uso en componentes
export const recomendadorService = new RecomendadorService();