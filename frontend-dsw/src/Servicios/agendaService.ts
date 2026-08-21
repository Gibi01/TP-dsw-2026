// src/Servicios/agendaService.ts
import { api, type ApiResponse } from "./api";

export interface NuevaAgenda {
  doctorId: number;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  duracionTurnoMinutos: number;
}

export interface Agenda {
  id: number;
  doctor: { matricula: number; nombre: string; apellido: string };
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  duracionTurnoMinutos: number;
}

export async function crearAgenda(datos: NuevaAgenda): Promise<Agenda> {
  const respuesta = await api.post<ApiResponse<Agenda>>("/agendas", datos);
  return respuesta.data;
}

export async function getAgendas(doctorId?: number): Promise<Agenda[]> {
  const query = doctorId ? `?doctorId=${doctorId}` : "";
  const respuesta = await api.get<ApiResponse<Agenda[]>>(`/agendas${query}`);
  return respuesta.data;
}

export async function actualizarAgenda(id: number, datos: Partial<NuevaAgenda>): Promise<Agenda> {
  const respuesta = await api.patch<ApiResponse<Agenda>>(`/agendas/${id}`, datos);
  return respuesta.data;
}

export async function eliminarAgenda(id: number): Promise<void> {
  await api.delete(`/agendas/${id}`);
}
