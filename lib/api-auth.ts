/**
 * Cliente API con autenticación JWT
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class AuthApiClient {
  private csrfToken: string | null = null;

  /**
   * Obtiene el token JWT del localStorage
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  /**
   * Obtiene el token CSRF del backend
   */
  async getCsrfToken(): Promise<string> {
    if (this.csrfToken) return this.csrfToken;

    try {
      const response = await fetch(`${API_URL}/csrf-token`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }

      const data = await response.json();
      this.csrfToken = data.csrfToken;
      return this.csrfToken;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      throw error;
    }
  }

  /**
   * Obtiene los headers con autenticación
   */
  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Realiza una petición GET autenticada
   */
  async get<T = any>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        credentials: 'include',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado o inválido
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GET request error:', error);
      throw error;
    }
  }

  /**
   * Realiza una petición POST autenticada
   */
  async post<T = any>(endpoint: string, data: any, options?: { headers?: HeadersInit }): Promise<T> {
    try {
      const csrfToken = await this.getCsrfToken();

      // Si data es FormData, no usar getAuthHeaders y dejar que el navegador establezca Content-Type
      let headers: HeadersInit;
      let body: any;

      if (data instanceof FormData) {
        // Para FormData, solo agregar Authorization y CSRF token
        const token = this.getToken();
        headers = {
          'X-CSRF-Token': csrfToken,
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        // No establecer Content-Type, el navegador lo hará automáticamente con boundary
        body = data;
      } else {
        // Para datos JSON normales
        headers = this.getAuthHeaders();
        headers['X-CSRF-Token'] = csrfToken;
        body = JSON.stringify(data);
      }

      // Aplicar headers personalizados si se proporcionan
      if (options?.headers) {
        headers = { ...headers, ...options.headers };
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body,
      });

      if (!response.ok) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('POST request error:', error);
      throw error;
    }
  }

  /**
   * Realiza una petición PUT autenticada
   */
  async put<T = any>(endpoint: string, data: any): Promise<T> {
    try {
      const csrfToken = await this.getCsrfToken();
      const headers = this.getAuthHeaders();
      headers['X-CSRF-Token'] = csrfToken;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PUT request error:', error);
      throw error;
    }
  }

  /**
   * Realiza una petición PATCH autenticada
   */
  async patch<T = any>(endpoint: string, data: any): Promise<T> {
    try {
      const csrfToken = await this.getCsrfToken();
      const headers = this.getAuthHeaders();
      headers['X-CSRF-Token'] = csrfToken;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PATCH',
        credentials: 'include',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PATCH request error:', error);
      throw error;
    }
  }

  /**
   * Realiza una petición DELETE autenticada
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    try {
      const csrfToken = await this.getCsrfToken();
      const headers = this.getAuthHeaders();
      headers['X-CSRF-Token'] = csrfToken;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
          }
        }

        // Intentar obtener mensaje de error del servidor
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
          console.error('Server error response:', errorData);
        } catch {
          // No hay JSON en la respuesta de error
          const text = await response.text();
          if (text) {
            console.error('Server error text:', text);
          }
        }
        throw new Error(errorMessage);
      }

      // Verificar si hay contenido en la respuesta
      const text = await response.text();
      if (!text || text.trim() === '') {
        return {} as T; // Retornar objeto vacío si no hay contenido
      }

      try {
        return JSON.parse(text);
      } catch {
        return {} as T; // Retornar objeto vacío si no es JSON válido
      }
    } catch (error) {
      console.error('DELETE request error:', error);
      throw error;
    }
  }

  /**
   * Limpia el token CSRF cacheado
   */
  clearCsrfToken(): void {
    this.csrfToken = null;
  }
}

// Exportar instancia única del cliente autenticado
export const authApi = new AuthApiClient();
