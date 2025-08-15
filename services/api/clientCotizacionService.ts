import { CotizacionData, CotizacionResponse } from '@/services';

export class ClientCotizacionService {
  
  async enviarCotizacion(cotizacionData: CotizacionData): Promise<CotizacionResponse> {
    try {
      const response = await fetch('/api/cotizacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cotizacionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error de red' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: CotizacionResponse = await response.json();
      return result;

    } catch (error) {
      console.error('Error en cliente al enviar cotización:', error);
      
      // Retornar un error estructurado
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido al enviar cotización'
      };
    }
  }
}

// Exportar instancia singleton para uso en componentes
export const clientCotizacionService = new ClientCotizacionService();