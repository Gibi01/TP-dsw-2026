// src/Servicios/especialidadesService.ts
import { api, type ApiResponse } from "./api";
import type { Especialidad } from "../Tipos/dominio";

export async function getEspecialidades(): Promise<Especialidad[]> {
  const respuesta = await api.get<ApiResponse<Especialidad[]>>("/especialidades");
  return respuesta.data;
}
