// src/Servicios/api.ts
// wrapper de fetch nomas, para no meter axios como dependencia nueva
// si hace falta cambiar la url del back poner VITE_API_URL en el .env

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

    // si tira 401 en una ruta que no sea login es que se vencio el token (en login un 401 es solo que esta mal la contraseña)
    if (res.status === 401 && path !== "/auth/login") {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.dispatchEvent(new Event("auth:sesion-vencida"));
    }

    // el backend manda { message: "..." } en los errores
    throw new Error(body?.message ?? `Error ${res.status} al consultar ${path}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// todas las rutas devuelven { message, data }
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
