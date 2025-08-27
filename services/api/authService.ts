interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
}

interface LoginCredentials {
  usuario: string;
  contrasena: string;
}

class AuthService {
  private baseUrl: string;
  private tokenKey = 'suncar-token';
  private staticToken = 'suncar-token-2025';

  constructor() {
    // Usar rutas API internas de Next.js
    this.baseUrl = '/api';
  }

  async login(credentials: LoginCredentials): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: LoginResponse = await response.json();
      const token = data.token;

      // Guardar el token en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.tokenKey, token);
      }

      return token;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
  }

  async ensureAuthenticated(): Promise<string> {
    // Usar el token estático directamente
    return this.staticToken;
  }
}

export const authService = new AuthService();
export type { LoginResponse, LoginCredentials };
