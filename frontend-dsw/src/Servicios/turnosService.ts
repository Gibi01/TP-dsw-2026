// src/Servicios/turnosService.ts
import { api, type ApiResponse } from "./api";
import type { Turno } from "../Tipos/dominio";

export interface FiltroMisTurnos {
  fecha?: string;
  especialidadId?: number;
  doctorId?: number;
}

export async function obtenerMisTurnos(filtro: FiltroMisTurnos = {}): Promise<Turno[]> {
  const params = new URLSearchParams();
  if (filtro.fecha) params.set("fecha", filtro.fecha);
  if (filtro.especialidadId) params.set("especialidadId", String(filtro.especialidadId));
  if (filtro.doctorId) params.set("doctorId", String(filtro.doctorId));

  const query = params.toString();
  const respuesta = await api.get<ApiResponse<Turno[]>>(`/turnos/mios${query ? `?${query}` : ""}`);
  return respuesta.data;
}

export async function cancelarTurno(id: number, motivoCancelacion: string): Promise<Turno> {
  const respuesta = await api.patch<ApiResponse<Turno>>(`/turnos/${id}/cancelar`, {
    motivoCancelacion,
  });
  return respuesta.data;
}

// Horarios libres de un doctor puntual en una fecha (YYYY-MM-DD). El backend arma esta lista
// a partir de la Agenda real del doctor, descontando lo ya reservado.
export async function getDisponibilidadDoctor(doctorId: number, fecha: string): Promise<string[]> {
  const respuesta = await api.get<ApiResponse<string[]>>(
    `/turnos/disponibilidad?doctorId=${doctorId}&fecha=${fecha}`
  );
  return respuesta.data;
}

export async function reservarTurno(doctorId: number, fechaHoraTurno: string): Promise<Turno> {
  const respuesta = await api.post<ApiResponse<Turno>>("/turnos", { doctorId, fechaHoraTurno });
  return respuesta.data;
}
