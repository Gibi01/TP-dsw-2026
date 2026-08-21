// src/Servicios/especialidadesService.ts
import { api, type ApiResponse } from "./api";
import type { Especialidad } from "../Tipos/dominio";

export async function getEspecialidades(): Promise<Especialidad[]> {
  const respuesta = await api.get<ApiResponse<Especialidad[]>>("/especialidades");
  return respuesta.data;
}

// idEspecialidad lo asigna el backend (autoincrement): nunca se manda desde el cliente.
export async function crearEspecialidad(
  datos: Pick<Especialidad, "descripcionEsp">
): Promise<Especialidad> {
  const respuesta = await api.post<ApiResponse<Especialidad>>("/especialidades", datos);
  return respuesta.data;
}

export async function actualizarEspecialidad(
  idEspecialidad: number,
  datos: Partial<Pick<Especialidad, "descripcionEsp">>
): Promise<Especialidad> {
  const respuesta = await api.patch<ApiResponse<Especialidad>>(
    `/especialidades/${idEspecialidad}`,
    datos
  );
  return respuesta.data;
}

export async function eliminarEspecialidad(idEspecialidad: number): Promise<void> {
  await api.delete(`/especialidades/${idEspecialidad}`);
}
