// src/Servicios/motivoCancelacionService.ts
import { api, type ApiResponse } from "./api";
import type { MotivoCancelacion } from "../Tipos/dominio";

export async function getMotivosCancelacion(): Promise<MotivoCancelacion[]> {
  const respuesta = await api.get<ApiResponse<MotivoCancelacion[]>>("/motivos-cancelacion");
  return respuesta.data;
}

// id lo pone el backend solo (autoincrement), nunca se manda desde el front
export async function crearMotivoCancelacion(
  datos: Pick<MotivoCancelacion, "descripcion">
): Promise<MotivoCancelacion> {
  const respuesta = await api.post<ApiResponse<MotivoCancelacion>>("/motivos-cancelacion", datos);
  return respuesta.data;
}

export async function actualizarMotivoCancelacion(
  id: number,
  datos: Partial<Pick<MotivoCancelacion, "descripcion">>
): Promise<MotivoCancelacion> {
  const respuesta = await api.patch<ApiResponse<MotivoCancelacion>>(`/motivos-cancelacion/${id}`, datos);
  return respuesta.data;
}

export async function eliminarMotivoCancelacion(id: number): Promise<void> {
  await api.delete(`/motivos-cancelacion/${id}`);
}
