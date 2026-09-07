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

  // el backend todavia no filtra por nombre/especialidad, asi que filtro aca (la lista es chica, alcanza)
  let resultado = doctores;

  if (filtro.nombre && filtro.nombre.trim() !== "") {
    const q = filtro.nombre.trim().toLowerCase();
    resultado = resultado.filter(
      (d) => d.nombre.toLowerCase().includes(q) || d.apellido.toLowerCase().includes(q)
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

// GET /doctores/mios, el doctor logueado consulta sus propios datos (matricula, etc)
export async function getMisDatosDeDoctor(): Promise<Doctor> {
  const respuesta = await api.get<ApiResponse<Doctor>>("/doctores/mios");
  return respuesta.data;
}

export interface NuevoDoctor {
  matricula: number;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  dni: string;
  especialidadIds?: number[];
}

export async function crearDoctor(datos: NuevoDoctor): Promise<Doctor> {
  const respuesta = await api.post<ApiResponse<Doctor>>("/doctores", datos);
  return respuesta.data;
}

export interface EdicionDoctor {
  especialidadIds?: number[];
  activo?: boolean;
}

export async function actualizarDoctor(matricula: number, datos: EdicionDoctor): Promise<Doctor> {
  const respuesta = await api.patch<ApiResponse<Doctor>>(`/doctores/${matricula}`, datos);
  return respuesta.data;
}

// es baja logica, no se borra el doctor ni sus turnos, solo deja de aparecer como opcion
export async function darDeBajaDoctor(matricula: number): Promise<void> {
  await api.delete(`/doctores/${matricula}`);
}
