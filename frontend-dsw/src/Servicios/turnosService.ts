// src/Servicios/turnosService.ts
import { api, type ApiResponse } from "./api";
import type { EstadoTurno, SlotEspecialidad, Turno, TurnoParaDoctor } from "../Tipos/dominio";

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

// GET /turnos/atiendo, el doctor logueado ve los turnos que tiene que atender
export async function obtenerTurnosQueAtiendo(estado?: EstadoTurno): Promise<TurnoParaDoctor[]> {
  const query = estado ? `?estado=${estado}` : "";
  const respuesta = await api.get<ApiResponse<TurnoParaDoctor[]>>(`/turnos/atiendo${query}`);
  return respuesta.data;
}

export async function cancelarTurno(id: number, motivoCancelacion: string): Promise<Turno> {
  const respuesta = await api.patch<ApiResponse<Turno>>(`/turnos/${id}/cancelar`, {
    motivoCancelacion,
  });
  return respuesta.data;
}

// el doctor confirma que el paciente vino al turno
export async function marcarTurnoAsistido(id: number): Promise<TurnoParaDoctor> {
  const respuesta = await api.patch<ApiResponse<TurnoParaDoctor>>(`/turnos/${id}/asistio`, {});
  return respuesta.data;
}

// el doctor marca a mano que el paciente no vino (si no, el sistema lo marca solo a las 12hs)
export async function marcarTurnoNoAsistido(id: number): Promise<TurnoParaDoctor> {
  const respuesta = await api.patch<ApiResponse<TurnoParaDoctor>>(`/turnos/${id}/no-asistio`, {});
  return respuesta.data;
}

// horarios libres de un doctor en una fecha (YYYY-MM-DD), el backend lo arma a partir de su agenda descontando lo reservado
export async function getDisponibilidadDoctor(doctorId: number, fecha: string): Promise<string[]> {
  const respuesta = await api.get<ApiResponse<string[]>>(
    `/turnos/disponibilidad?doctorId=${doctorId}&fecha=${fecha}`
  );
  return respuesta.data;
}

// horarios libres de cualquier doctor de una especialidad, primero se elige el horario y despues el doctor (puede haber mas de uno en el mismo horario)
export async function getDisponibilidadEspecialidad(
  especialidadId: number,
  fecha: string
): Promise<SlotEspecialidad[]> {
  const respuesta = await api.get<ApiResponse<SlotEspecialidad[]>>(
    `/turnos/disponibilidad-especialidad?especialidadId=${especialidadId}&fecha=${fecha}`
  );
  return respuesta.data;
}

export async function reservarTurno(doctorId: number, fechaHoraTurno: string): Promise<Turno> {
  const respuesta = await api.post<ApiResponse<Turno>>("/turnos", { doctorId, fechaHoraTurno });
  return respuesta.data;
}
