// Las credenciales viajan en la cookie HttpOnly de Better Auth.

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    if (res.status === 401) window.dispatchEvent(new Event('auth:sesion-vencida'));
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
