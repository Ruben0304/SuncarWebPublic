import { authService } from './authService';

export interface CalculoEnergeticoEquipo {
  nombre: string;
  potencia_kw: number;
  energia_kwh: number;
}

export interface CalculoEnergeticoCategoria {
  id: string;
  nombre: string;
  equipos: CalculoEnergeticoEquipo[];
}

export interface CategoriasListResponse {
  success: boolean;
  message: string;
  data: CalculoEnergeticoCategoria[];
}

export interface CategoriaGetResponse {
  success: boolean;
  message: string;
  data: CalculoEnergeticoCategoria | null;
}

class CalculoEnergeticoServiceClass {
  private baseUrl: string;

  constructor() {
    // Usar rutas API internas de Next.js
    this.baseUrl = '/api';
  }

  private async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      // Usar token estático directamente
      const token = 'suncar-token-2025';

      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Si es error de autenticación, intentar re-autenticar
        if (response.status === 401) {
          authService.logout();
          const newToken = await authService.ensureAuthenticated();
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${newToken}`,
          };

          const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, config);
          if (!retryResponse.ok) {
            throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${retryResponse.status}`);
          }
          return retryResponse.json();
        }

        throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error in API request:', error);
      throw error;
    }
  }

  async getCategorias(): Promise<CalculoEnergeticoCategoria[]> {
    try {
      const response: CategoriasListResponse = await this.apiRequest('/calculo-energetico/');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching categorias:', error);
      throw error;
    }
  }

  async getCategoriaById(categoriaId: string): Promise<CalculoEnergeticoCategoria | null> {
    try {
      const response: CategoriaGetResponse = await this.apiRequest(`/calculo-energetico/${categoriaId}`);
      return response.data || null;
    } catch (error) {
      console.error('Error fetching categoria:', error);
      throw error;
    }
  }
}

export const calculoEnergeticoService = new CalculoEnergeticoServiceClass();
