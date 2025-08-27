export interface ClientVerificationData {
  identifier: string; // Número de cliente o teléfono
}

export interface ClientData {
  numero: string;
  nombre: string;
  telefono?: string;
  email?: string;
}

export interface ClientVerificationResponse {
  success: boolean;
  message?: string;
  data?: ClientData;
}

export class ClientVerificationService {
  
  async verificarCliente(identifier: string): Promise<ClientVerificationResponse> {
    try {
      // Usar la ruta API interna de Next.js
      const response = await fetch('/api/clientes/verificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error de red' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: ClientVerificationResponse = await response.json();
      return result;

    } catch (error) {
      console.error('Error al verificar cliente:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido al verificar cliente'
      };
    }
  }
}

// Exportar instancia singleton para uso en componentes
export const clientVerificationService = new ClientVerificationService();