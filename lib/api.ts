const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

class ApiClient {
  private csrfToken: string | null = null;

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
   * Realiza una petición GET
   */
  async get<T = any>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GET request error:', error);
      throw error;
    }
  }

  /**
   * Realiza una petición POST
   */
  async post<T = any>(endpoint: string, data: any): Promise<T> {
    try {
      const csrfToken = await this.getCsrfToken();

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Crear un error personalizado con información del response
        const error: any = new Error(`HTTP error! status: ${response.status}`);
        error.response = { status: response.status };
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } catch (error: any) {
      // No mostrar el error en consola si es 401 (credenciales incorrectas)
      if (error.status !== 401) {
        console.error('POST request error:', error);
      }
      throw error;
    }
  }

  /**
   * Realiza una petición PUT
   */
  async put<T = any>(endpoint: string, data: any): Promise<T> {
    try {
      const csrfToken = await this.getCsrfToken();

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PUT request error:', error);
      throw error;
    }
  }

  /**
   * Realiza una petición PATCH
   */
  async patch<T = any>(endpoint: string, data: any): Promise<T> {
    try {
      const csrfToken = await this.getCsrfToken();

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PATCH request error:', error);
      throw error;
    }
  }

  /**
   * Realiza una petición DELETE
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    try {
      const csrfToken = await this.getCsrfToken();

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
   * Limpia el token CSRF cacheado (útil después de logout)
   */
  clearCsrfToken(): void {
    this.csrfToken = null;
  }
}

// Exportar instancia única del cliente
export const api = new ApiClient();

// Exportar también la clase para casos de uso avanzados
export default ApiClient;
