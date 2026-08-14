// src/Servicios/doctoresService.ts
import { api, type ApiResponse } from "./api";
import type { Doctor } from "../Tipos/dominio";

export interface FiltroDoctores {
  nombre?: string;
  especialidadId?: number;
}

export async function getDoctores(filtro: FiltroDoctores = {}): Promise<Doctor[]> {
  const doctores = await api
    .get<ApiResponse<Doctor[]>>("/doctores")
    .then((respuesta) => respuesta.data);

  // El backend no soporta filtro por nombre/especialidad en /doctores todavía,
  // así que se filtra del lado del cliente (lista chica, alcanza para este TP).
  let resultado = doctores;

  if (filtro.nombre && filtro.nombre.trim() !== "") {
    const q = filtro.nombre.trim().toLowerCase();
    resultado = resultado.filter(
      (d) => d.nombrePr.toLowerCase().includes(q) || d.apellidoPr.toLowerCase().includes(q)
    );
  }

  if (filtro.especialidadId) {
    resultado = resultado.filter((d) =>
      d.especialidades?.some((e) => e.idEspecialidad === filtro.especialidadId)
    );
  }

  return resultado;
}

export async function getDoctor(matricula: number): Promise<Doctor> {
  const respuesta = await api.get<ApiResponse<Doctor>>(`/doctores/${matricula}`);
  return respuesta.data;
}
