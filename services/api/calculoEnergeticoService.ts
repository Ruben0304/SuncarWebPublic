import { authService } from './authService';

export interface CalculoEnergeticoEquipo {
  nombre: string;
  potencia_kw: number;
  energia_kwh: number;
  /** Horas de uso al día (opcional; el frontend infiere un default si no viene). */
  horas_uso_dia?: number;
  /** Tipo de carga eléctrica (opcional; se infiere por el nombre si no viene). */
  tipo_carga?: 'resistiva' | 'electronica' | 'motor';
  /** Factor de arranque/pico (opcional; default según tipo de carga). */
  factor_arranque?: number;
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
    // Llamar directo a FastAPI para evitar el 403 de Vercel Deployment Protection en /api/*
    this.baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;
  }

  private async apiRequest(endpoint: string, options: RequestInit = {}, requireAuth: boolean = false): Promise<any> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> | undefined),
      };

      // El GET público no debe enviar Authorization: rompe CORS si FastAPI hace 307 sin la barra final.
      if (requireAuth) {
        headers['Authorization'] = `Bearer suncar-token-2025`;
      }

      const config: RequestInit = {
        ...options,
        headers,
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Si es error de autenticación en endpoint protegido, intentar re-autenticar
        if (response.status === 401 && requireAuth) {
          authService.logout();
          const newToken = await authService.ensureAuthenticated();
          (config.headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;

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
      const response: CategoriaGetResponse = await this.apiRequest(`/calculo-energetico/${categoriaId}/`);
      return response.data || null;
    } catch (error) {
      console.error('Error fetching categoria:', error);
      throw error;
    }
  }
}

export const calculoEnergeticoService = new CalculoEnergeticoServiceClass();
