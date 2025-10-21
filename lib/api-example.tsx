/**
 * EJEMPLO DE USO DEL CLIENTE API
 *
 * Este archivo muestra cómo usar el cliente API en tus componentes.
 * Puedes eliminar este archivo una vez que entiendas cómo usarlo.
 */

'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

// Ejemplo 1: Obtener datos con GET
export function ExampleGetComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Reemplaza '/api/endpoint' con tu endpoint real
        const result = await api.get('/api/endpoint');
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Datos obtenidos:</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

// Ejemplo 2: Enviar datos con POST
export function ExamplePostComponent() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
    };

    try {
      setLoading(true);
      setError(null);
      // Reemplaza '/api/endpoint' con tu endpoint real
      const response = await api.post('/api/endpoint', data);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Formulario de ejemplo:</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      {result && (
        <div>
          <h3>Resultado:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

// Ejemplo 3: Actualizar datos con PUT
export function ExamplePutComponent({ id }: { id: number }) {
  async function handleUpdate() {
    try {
      const updatedData = {
        name: 'Nombre actualizado',
        status: 'active',
      };

      // Reemplaza '/api/endpoint' con tu endpoint real
      const result = await api.put(`/api/endpoint/${id}`, updatedData);
      console.log('Actualizado:', result);
    } catch (err) {
      console.error('Error al actualizar:', err);
    }
  }

  return (
    <button onClick={handleUpdate}>
      Actualizar
    </button>
  );
}

// Ejemplo 4: Eliminar datos con DELETE
export function ExampleDeleteComponent({ id }: { id: number }) {
  async function handleDelete() {
    if (!confirm('¿Estás seguro?')) return;

    try {
      // Reemplaza '/api/endpoint' con tu endpoint real
      await api.delete(`/api/endpoint/${id}`);
      console.log('Eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  }

  return (
    <button onClick={handleDelete}>
      Eliminar
    </button>
  );
}

// Ejemplo 5: Uso con TypeScript (tipos personalizados)
interface User {
  id: number;
  name: string;
  email: string;
}

export function ExampleTypedComponent() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        // El método get acepta un tipo genérico
        const result = await api.get<User[]>('/api/users');
        setUsers(result);
      } catch (err) {
        console.error('Error:', err);
      }
    }

    fetchUsers();
  }, []);

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name} - {user.email}</li>
      ))}
    </ul>
  );
}
