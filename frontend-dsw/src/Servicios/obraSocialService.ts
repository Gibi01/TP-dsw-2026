// src/Servicios/obraSocialService.ts
import { api, type ApiResponse } from "./api";
import type { ObraSocial } from "../Tipos/dominio";

export async function getObrasSociales(): Promise<ObraSocial[]> {
  const respuesta = await api.get<ApiResponse<ObraSocial[]>>("/obras-sociales");
  return respuesta.data;
}

// id lo pone el backend solo (autoincrement), nunca se manda desde el front
export async function crearObraSocial(datos: Pick<ObraSocial, "nombre">): Promise<ObraSocial> {
  const respuesta = await api.post<ApiResponse<ObraSocial>>("/obras-sociales", datos);
  return respuesta.data;
}

export async function actualizarObraSocial(
  id: number,
  datos: Partial<Pick<ObraSocial, "nombre">>
): Promise<ObraSocial> {
  const respuesta = await api.patch<ApiResponse<ObraSocial>>(`/obras-sociales/${id}`, datos);
  return respuesta.data;
}

export async function eliminarObraSocial(id: number): Promise<void> {
  await api.delete(`/obras-sociales/${id}`);
}
