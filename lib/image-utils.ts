/**
 * Utilidades para manejar URLs de imágenes
 */

/**
 * Normaliza una URL de imagen reemplazando URLs hardcodeadas del backend
 * con la URL actual de la API desde las variables de entorno
 */
export function normalizeImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;

  // Si es una URL data (base64), retornarla tal cual
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Si la URL es relativa (comienza con /), concatenarla con la API_URL
  if (imageUrl.startsWith('/')) {
    const cleanApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    return `${cleanApiUrl}${imageUrl}`;
  }

  // Si la URL apunta a localhost u otra IP conocida, reemplazarla
  if (imageUrl.includes('localhost:3000') || imageUrl.includes('192.168') || imageUrl.includes('127.0.0.1')) {
    // Extraer la ruta de la URL (la parte después del dominio)
    try {
      const urlObj = new URL(imageUrl);
      const pathname = urlObj.pathname;
      const searchParams = urlObj.search;
      const cleanApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      return `${cleanApiUrl}${pathname}${searchParams}`;
    } catch {
      // Si no es una URL válida, retornarla tal cual
      return imageUrl;
    }
  }

  // Si es una URL completa y válida, retornarla tal cual
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // En otros casos, asumir que es una ruta relativa
  const cleanApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  return `${cleanApiUrl}/${imageUrl}`;
}
