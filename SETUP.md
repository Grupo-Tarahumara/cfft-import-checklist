# Configuración Frontend - CFFT Import Checklist

## Configuración Completada

Este frontend Next.js está configurado para conectarse con el backend NestJS.

### Archivos Creados/Modificados

1. **`.env.local`** - Variables de entorno
2. **`lib/api.ts`** - Cliente API con soporte CSRF
3. **`lib/api-example.tsx`** - Ejemplos de uso del cliente API
4. **`package.json`** - Configurado para correr en puerto 3001
5. **`next.config.ts`** - Configuración básica de Next.js

## Iniciar el Proyecto

### 1. Iniciar el Backend (Terminal 1)

```bash
cd C:\Users\becario1.sis\Proyecto\cfft-import-checklist-backend
npm run start:dev
```

El backend estará disponible en: `http://localhost:3000`

### 2. Iniciar el Frontend (Terminal 2)

```bash
cd C:\Users\becario1.sis\Proyecto\cfft-import-checklist
pnpm dev
```

El frontend estará disponible en: `http://localhost:3001`

## Uso del Cliente API

### Importar el cliente

```typescript
import { api } from '@/lib/api';
```

### Métodos disponibles

#### GET - Obtener datos

```typescript
const data = await api.get('/api/endpoint');
```

#### POST - Crear datos

```typescript
const result = await api.post('/api/endpoint', {
  name: 'Ejemplo',
  value: 123
});
```

#### PUT - Actualizar datos

```typescript
const updated = await api.put('/api/endpoint/1', {
  name: 'Actualizado'
});
```

#### PATCH - Actualizar parcialmente

```typescript
const patched = await api.patch('/api/endpoint/1', {
  status: 'active'
});
```

#### DELETE - Eliminar datos

```typescript
await api.delete('/api/endpoint/1');
```

### Con TypeScript

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Especifica el tipo de respuesta esperado
const users = await api.get<User[]>('/api/users');
```

## Ejemplo Completo en un Componente

```typescript
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await api.get('/api/my-endpoint');
        setData(result);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      {/* Tu contenido */}
    </div>
  );
}
```

## Características de Seguridad

### CORS
El backend está configurado para aceptar peticiones desde:
- `http://localhost:3001` (puerto del frontend)
- `http://localhost:8080`
- `http://localhost:5500`

### CSRF Protection
El cliente API maneja automáticamente los tokens CSRF:
1. Obtiene el token del endpoint `/csrf-token`
2. Lo incluye en todas las peticiones POST, PUT, PATCH y DELETE
3. Cachea el token para evitar peticiones innecesarias

### Credentials
Todas las peticiones incluyen `credentials: 'include'` para manejar cookies de sesión.

## Variables de Entorno

El archivo `.env.local` contiene:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Nota:** Este archivo está en `.gitignore` y no se subirá al repositorio.

## Recursos Adicionales

- Ver ejemplos completos en: `lib/api-example.tsx`
- Documentación de Next.js: https://nextjs.org/docs
- Documentación del Backend: Ver README en `cfft-import-checklist-backend`

## Troubleshooting

### Error de CORS
Verifica que:
1. El backend esté corriendo en el puerto 3000
2. El frontend esté corriendo en el puerto 3001
3. Las URLs en `src/main.ts` del backend incluyan tu puerto

### Error de CSRF
Si obtienes errores de CSRF:
1. Verifica que el endpoint `/csrf-token` esté disponible
2. Asegúrate de que las cookies estén habilitadas
3. Revisa que `credentials: 'include'` esté en todas las peticiones

### Variables de entorno no funcionan
1. Reinicia el servidor de desarrollo después de crear `.env.local`
2. Verifica que la variable comience con `NEXT_PUBLIC_`
3. Usa `process.env.NEXT_PUBLIC_API_URL` para acceder a ella
