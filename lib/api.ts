const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Función auxiliar para construir URLs sin dobles barras
const buildUrl = (baseUrl: string, endpoint: string): string => {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};

class ApiClient {
  // CSRF ya no es necesario con JWT en headers Authorization
  private csrfToken: string | null = null;

  /**
   * Obtiene el token JWT del localStorage
   */
  private getAuthToken(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || '';
    }
    return '';
  }

  /**
   * Obtiene los headers por defecto con autenticación
   */
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Método obsoleto - CSRF no es necesario con JWT
   * Se mantiene solo para compatibilidad
   */
  async getCsrfToken(): Promise<string> {
    // Retornar cadena vacía sin hacer petición al backend
    return '';
  }

  /**
   * Realiza una petición GET
   */
  async get<T = Record<string, unknown>>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(buildUrl(API_URL, endpoint), {
        method: 'GET',
        credentials: 'include',
        headers: this.getHeaders(),
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
  async post<T = Record<string, unknown>, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> {
    try {
      const response = await fetch(buildUrl(API_URL, endpoint), {
        method: 'POST',
        credentials: 'include',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Crear un error personalizado con información del response
        const error = new Error(`HTTP error! status: ${response.status}`) as Error & { response?: { status: number }; status?: number };
        error.response = { status: response.status };
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      // No mostrar el error en consola si es 401 (credenciales incorrectas)
      if (err?.status !== 401) {
        console.error('POST request error:', error);
      }
      throw error;
    }
  }

  /**
   * Realiza una petición PUT
   */
  async put<T = Record<string, unknown>, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> {
    try {
      const response = await fetch(buildUrl(API_URL, endpoint), {
        method: 'PUT',
        credentials: 'include',
        headers: this.getHeaders(),
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
  async patch<T = Record<string, unknown>, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> {
    try {
      const response = await fetch(buildUrl(API_URL, endpoint), {
        method: 'PATCH',
        credentials: 'include',
        headers: this.getHeaders(),
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
  async delete<T = Record<string, unknown>>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(buildUrl(API_URL, endpoint), {
        method: 'DELETE',
        credentials: 'include',
        headers: this.getHeaders(),
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
