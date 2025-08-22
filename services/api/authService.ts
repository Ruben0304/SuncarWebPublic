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

  constructor() {
    this.baseUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000/api';
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
    let token = this.getToken();
    
    if (!token) {
      // Intentar login automático con credenciales por defecto
      try {
        token = await this.login({
          usuario: "admin",
          contrasena: "admin123"
        });
      } catch (error) {
        console.error('Error during automatic login:', error);
        throw new Error('Authentication required');
      }
    }

    return token;
  }
}

export const authService = new AuthService();
export type { LoginResponse, LoginCredentials };
