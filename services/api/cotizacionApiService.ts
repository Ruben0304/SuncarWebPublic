import { BaseApiService } from './baseApiService';
import { CotizacionData, CotizacionResponse } from '../domain/interfaces/cotizacionInterfaces';
import { CotizacionFormatter } from '../application/useCases/cotizacionUseCase';

export class CotizacionApiService extends BaseApiService {
  
  async enviarCotizacion(cotizacionData: CotizacionData): Promise<CotizacionResponse> {
    try {
      // Formatear los datos como texto elegante
      const textoFormateado = CotizacionFormatter.formatCotizacionText(cotizacionData);
      
      // Enviar solo el texto formateado al backend
      const response = await this.post<CotizacionResponse>('/cotizacion', {
        mensaje: textoFormateado
      });
      
      return response;
    } catch (error) {
      console.error('Error al enviar cotización:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const cotizacionService = new CotizacionApiService();