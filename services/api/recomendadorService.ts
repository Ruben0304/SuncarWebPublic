import { BaseApiService } from './baseApiService';
import { RecomendadorRequest, RecomendadorResponse } from '@/types/ofertas';

class RecomendadorService extends BaseApiService {
  async recomendarOfertas(texto: string): Promise<RecomendadorResponse> {
    try {
      const request: RecomendadorRequest = { texto };

      const response = await this.post<RecomendadorResponse>('/ofertas/recomendador', request);

      return response;
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