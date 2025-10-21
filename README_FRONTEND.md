# CFFT Import Checklist - Frontend

Sistema de gestión de inspecciones de importación de frutas desarrollado con Next.js 15, React 19 y TypeScript.

## Estructura del Proyecto

```
cfft-import-checklist/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard principal con estadísticas
│   ├── login/
│   │   └── page.tsx          # Página de autenticación
│   ├── usuarios/
│   │   └── page.tsx          # Gestión de usuarios (CRUD completo)
│   ├── proveedores/
│   │   └── page.tsx          # Gestión de proveedores (CRUD completo)
│   ├── inspecciones/
│   │   └── page.tsx          # Lista de inspecciones con filtros
│   ├── alertas/
│   │   └── page.tsx          # Gestión de alertas con criticidad
│   ├── layout.tsx            # Layout principal con AuthProvider
│   └── page.tsx              # Página raíz con redirección
│
├── components/
│   ├── DashboardLayout.tsx   # Layout para páginas autenticadas
│   ├── Navbar.tsx            # Barra de navegación superior
│   └── Sidebar.tsx           # Menú lateral de navegación
│
├── contexts/
│   └── AuthContext.tsx       # Contexto de autenticación JWT
│
├── lib/
│   ├── api.ts                # Cliente API básico con CSRF
│   ├── api-auth.ts           # Cliente API con autenticación JWT
│   └── api-example.tsx       # Ejemplos de uso del cliente API
│
├── types/
│   └── index.ts              # Tipos TypeScript basados en el backend
│
├── .env.local                # Variables de entorno (no versionado)
└── SETUP.md                  # Guía de configuración inicial

```

## Funcionalidades Implementadas

### ✅ Autenticación
- Login con JWT
- Protección de rutas
- Gestión de tokens
- Context API para estado de autenticación
- Redirección automática

### ✅ Dashboard
- Estadísticas en tiempo real
- Últimas inspecciones
- Alertas pendientes
- Resumen visual con tarjetas

### ✅ Gestión de Usuarios
- Lista de usuarios activos
- Crear nuevo usuario
- Editar usuario existente
- Desactivar usuario (soft delete)
- Validación de formularios

### ✅ Gestión de Proveedores
- CRUD completo de proveedores
- Filtrado por estado (activo/inactivo)
- Validación de datos

### ✅ Gestión de Inspecciones
- Lista completa de inspecciones
- Filtros por:
  - Número de contenedor
  - Proveedor
- Visualización de:
  - Datos de inspección
  - Estado
  - Alertas asociadas
  - Información de proveedor y fruta

### ✅ Gestión de Alertas
- Visualización de alertas por criticidad
- Filtros por:
  - Criticidad (alta, media, baja)
  - Estado (leída/no leída)
- Marcar alertas como leídas
- Estadísticas de alertas

### ✅ Seguridad
- Protección CSRF
- Tokens JWT
- Headers de seguridad con Helmet
- Validación de sesión
- Redirección automática en caso de token expirado

## Todas las Páginas Implementadas ✅

### Páginas de Catálogos
- ✅ **Frutas** (`/frutas`): CRUD completo con rangos de temperatura y validación
- ✅ **Puntos de Inspección** (`/puntos-inspeccion`): CRUD completo de ubicaciones
- ✅ **Usuarios** (`/usuarios`): CRUD completo con áreas de trabajo
- ✅ **Proveedores** (`/proveedores`): CRUD completo con países

### Páginas de Inspecciones
- ✅ **Lista de Inspecciones** (`/inspecciones`):
  - Tabla completa con filtros
  - Búsqueda por contenedor
  - Filtro por proveedor
  - Estados visuales

- ✅ **Nueva Inspección** (`/inspecciones/nueva`):
  - Formulario completo con todas las relaciones
  - Validación de temperatura contra rango de fruta
  - Alertas automáticas por temperatura fuera de rango
  - Selección de termógrafos
  - Campos de cantidades (pallets, cajas, trancas)

- ✅ **Detalle de Inspección** (`/inspecciones/[id]`):
  - Vista completa de todos los datos
  - Información de relaciones (proveedor, fruta, inspector)
  - Alertas asociadas con criticidad
  - Fotos de inspección
  - Validación visual de temperatura
  - Botón para descargar PDF (si está generado)

### Páginas de Alertas y Notificaciones
- ✅ **Alertas** (`/alertas`):
  - Lista con filtros por criticidad y estado
  - Marcar alertas como leídas
  - Estadísticas visuales
  - Códigos de color por criticidad

- ✅ **Notificaciones** (`/notificaciones`):
  - Lista completa con filtros
  - Filtro por usuario, método y estado
  - Marcar como enviadas
  - Iconos por método (email, sistema, push)
  - Estadísticas

### Páginas Futuras (Opcional)
- **Editar Inspección** (`/inspecciones/[id]/editar`): Formulario de edición
- **Gestión de Fotos** (`/inspecciones/[id]/fotos`): Upload y gestión de imágenes
- **Reportes**: Dashboard de analytics y exportación

## Tecnologías Utilizadas

- **Next.js 15**: Framework React con App Router
- **React 19**: Biblioteca de UI
- **TypeScript**: Tipado estático
- **Tailwind CSS 4**: Estilos utilitarios
- **pnpm**: Gestor de paquetes

## Configuración Inicial

### 1. Instalar Dependencias

```bash
pnpm install
```

### 2. Configurar Variables de Entorno

Ya configurado en `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Iniciar el Desarrollo

```bash
# Backend (terminal 1)
cd ../cfft-import-checklist-backend
npm run start:dev

# Frontend (terminal 2)
cd cfft-import-checklist
pnpm dev
```

El frontend estará disponible en: http://localhost:3001

## Credenciales de Prueba

```
Usuario: admin
Contraseña: admin123
```

## Uso del Cliente API

### API con Autenticación

```typescript
import { authApi } from '@/lib/api-auth';

// GET
const usuarios = await authApi.get<Usuario[]>('/usuarios');

// POST
const nuevoUsuario = await authApi.post('/usuarios', {
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  area: 'Comercio Exterior'
});

// PATCH
await authApi.patch(`/usuarios/${id}`, { nombre: 'Nuevo Nombre' });

// DELETE
await authApi.delete(`/usuarios/${id}`);
```

### API sin Autenticación

```typescript
import { api } from '@/lib/api';

// Para endpoints públicos (como login)
const response = await api.post('/auth/login', {
  username: 'admin',
  password: 'admin123'
});
```

## Estructura de Componentes

### DashboardLayout

Wrapper para todas las páginas autenticadas:

```typescript
import DashboardLayout from '@/components/DashboardLayout';

export default function MiPagina() {
  return (
    <DashboardLayout>
      {/* Tu contenido */}
    </DashboardLayout>
  );
}
```

### useAuth Hook

Accede al contexto de autenticación:

```typescript
import { useAuth } from '@/contexts/AuthContext';

export default function MiComponente() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      <p>Usuario: {user?.username}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

## Tipos TypeScript

Todos los tipos están definidos en `types/index.ts` basados en las entidades del backend:

```typescript
import { Usuario, Proveedor, Inspeccion, Alerta } from '@/types';
```

## Patrones de Desarrollo

### Patrón CRUD Estándar

Todas las páginas de gestión siguen este patrón:

1. **Estado**: `useState` para lista, loading, formulario
2. **Carga inicial**: `useEffect` para cargar datos
3. **Formulario**: Modal o sección con toggle
4. **Tabla**: Listado con acciones (editar, eliminar)
5. **Validación**: Campos requeridos en formularios
6. **Feedback**: Mensajes de error/éxito

### Ejemplo de Nueva Página CRUD

```typescript
'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authApi } from '@/lib/api-auth';
import { MiTipo, CreateMiTipoDto } from '@/types';

export default function MiPagina() {
  const [items, setItems] = useState<MiTipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateMiTipoDto>({
    // campos iniciales
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await authApi.get<MiTipo[]>('/mi-endpoint');
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authApi.post('/mi-endpoint', formData);
    await loadItems();
    setShowForm(false);
  };

  // ... resto de handlers

  return (
    <DashboardLayout>
      {/* Contenido */}
    </DashboardLayout>
  );
}
```

## Mejoras Futuras

### Funcionalidades Pendientes
- [ ] Upload de imágenes/fotos
- [ ] Generación de PDFs
- [ ] Gráficas y reportes
- [ ] Exportación de datos
- [ ] Búsqueda avanzada
- [ ] Paginación
- [ ] Ordenamiento de tablas
- [ ] Notificaciones en tiempo real (WebSockets)

### Optimizaciones
- [ ] Implementar React Query para cache
- [ ] Lazy loading de imágenes
- [ ] Code splitting por rutas
- [ ] Skeleton loaders
- [ ] Optimistic updates
- [ ] Error boundaries

### UI/UX
- [ ] Modo oscuro
- [ ] Responsive design mejorado
- [ ] Animaciones y transiciones
- [ ] Toast notifications
- [ ] Confirmaciones modales
- [ ] Breadcrumbs

## Soporte y Documentación

- **Documentación Backend**: Ver README en `cfft-import-checklist-backend`
- **Configuración Inicial**: Ver `SETUP.md`
- **Ejemplos de API**: Ver `lib/api-example.tsx`

## Comandos Útiles

```bash
# Desarrollo
pnpm dev

# Build de producción
pnpm build

# Iniciar producción
pnpm start

# Linting
pnpm lint
```

## Estructura del Backend

Consulta el archivo del backend para ver:
- Endpoints disponibles
- DTOs esperados
- Tipos de datos
- Reglas de validación

## Notas Importantes

1. **Autenticación**: Todas las rutas excepto `/login` requieren autenticación
2. **CSRF**: El cliente API maneja automáticamente los tokens CSRF
3. **Tokens**: Se almacenan en localStorage y se envían en headers
4. **Redirección**: Los tokens expirados redirigen automáticamente al login
5. **Tipado**: TypeScript está configurado estrictamente

---

Desarrollado con ❤️ para CFFT Import Checklist
