// src/Servicios/api.ts
// Wrapper mínimo sobre fetch, sin agregar dependencias nuevas
// (tu package.json no tiene axios instalado). Cuando conectes el
// backend real, definí VITE_API_URL en un archivo .env:
//   VITE_API_URL=http://localhost:3000/api

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    // El backend (shared/manejadorErrores.ts) responde { message: "..." } en los errores.
    throw new Error(body?.message ?? `Error ${res.status} al consultar ${path}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Todas las rutas del backend envuelven la respuesta así (ver res.status(...).json({ message, data })).
export interface ApiResponse<T> {
  message: string;
  data: T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
