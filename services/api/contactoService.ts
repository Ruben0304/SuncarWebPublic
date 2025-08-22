import { authService } from './authService';

export interface Contacto {
  id: string;
  telefono: string;
  correo: string;
  direccion: string;
}

export interface ContactoResponse {
  success: boolean;
  message: string;
  data: Contacto | Contacto[];
}

class ContactoService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000/api';
  }

  private async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      // Asegurar autenticación
      const token = await authService.ensureAuthenticated();
      
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

  async getContactos(): Promise<Contacto[]> {
    try {
      const response: ContactoResponse = await this.apiRequest('/contactos/');
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      console.error('Error fetching contactos:', error);
      throw error;
    }
  }

  async getContactoById(id: string): Promise<Contacto> {
    try {
      const response: ContactoResponse = await this.apiRequest(`/contactos/${id}`);
      return response.data as Contacto;
    } catch (error) {
      console.error('Error fetching contacto:', error);
      throw error;
    }
  }

  async updateContacto(id: string, data: Partial<Contacto>): Promise<Contacto> {
    try {
      const response: ContactoResponse = await this.apiRequest(`/contactos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.data as Contacto;
    } catch (error) {
      console.error('Error updating contacto:', error);
      throw error;
    }
  }

  async createContacto(data: Omit<Contacto, 'id'>): Promise<Contacto> {
    try {
      const response: ContactoResponse = await this.apiRequest('/contactos/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.data as Contacto;
    } catch (error) {
      console.error('Error creating contacto:', error);
      throw error;
    }
  }

  async deleteContacto(id: string): Promise<void> {
    try {
      await this.apiRequest(`/contactos/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting contacto:', error);
      throw error;
    }
  }
}

export const contactoService = new ContactoService();
