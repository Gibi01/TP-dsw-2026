// src/Servicios/usuarioService.ts
import { api, type ApiResponse } from "./api";
import type { PerfilUsuario } from "../Tipos/dominio";

export async function obtenerPerfil(id: number): Promise<PerfilUsuario> {
  const respuesta = await api.get<ApiResponse<PerfilUsuario>>(`/usuarios/${id}`);
  return respuesta.data;
}

export interface DatosPerfilEditable {
  email?: string;
  dni?: string;
  foto?: string | null;
  direccion?: string;
  telefonoCelular?: string;
}

export async function actualizarPerfil(
  id: number,
  datos: DatosPerfilEditable
): Promise<PerfilUsuario> {
  const respuesta = await api.patch<ApiResponse<PerfilUsuario>>(`/usuarios/${id}`, datos);
  return respuesta.data;
}
