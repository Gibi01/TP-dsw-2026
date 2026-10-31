import { api, type ApiResponse } from './api';

export interface UsuarioListado {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  activo: boolean;
  fechaAlta: string | null;
}

export async function getUsuariosListado(): Promise<UsuarioListado[]> {
  return (await api.get<ApiResponse<UsuarioListado[]>>('/usuarios/listado')).data;
}
