// src/Servicios/profesionalesService.ts
import type { Profesional } from "../Tipos/dominio";
// import { api } from "./api"; // <- descomentar cuando conectes el backend

const MOCK_PROFESIONALES: Profesional[] = [
  {
    id: 1,
    matricula: "MP-1001",
    nombrePr: "Laura",
    apellidoPr: "Gómez",
    especialidades: [{ id: 1, idEspecialidad: "CARD", descripcionEsp: "Cardiología" }],
  },
  {
    id: 2,
    matricula: "MP-1002",
    nombrePr: "Martín",
    apellidoPr: "Pérez",
    especialidades: [{ id: 3, idEspecialidad: "PED", descripcionEsp: "Pediatría" }],
  },
  {
    id: 3,
    matricula: "MP-1003",
    nombrePr: "Sofía",
    apellidoPr: "Fernández",
    especialidades: [{ id: 2, idEspecialidad: "DERM", descripcionEsp: "Dermatología" }],
  },
  {
    id: 4,
    matricula: "MP-1004",
    nombrePr: "Diego",
    apellidoPr: "Álvarez",
    especialidades: [
      { id: 4, idEspecialidad: "TRAU", descripcionEsp: "Traumatología" },
      { id: 6, idEspecialidad: "CLIN", descripcionEsp: "Clínica Médica" },
    ],
  },
  {
    id: 5,
    matricula: "MP-1005",
    nombrePr: "Valentina",
    apellidoPr: "Rodríguez",
    especialidades: [{ id: 5, idEspecialidad: "GINE", descripcionEsp: "Ginecología" }],
  },
  {
    id: 6,
    matricula: "MP-1006",
    nombrePr: "Nicolás",
    apellidoPr: "Gómez",
    especialidades: [{ id: 6, idEspecialidad: "CLIN", descripcionEsp: "Clínica Médica" }],
  },
];

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface ProfesionalesFiltro {
  nombre?: string;
  especialidadId?: number;
}

export async function getProfesionales(
  filtro: ProfesionalesFiltro = {}
): Promise<Profesional[]> {
  // Real:
  // const params = new URLSearchParams();
  // if (filtro.nombre) params.set("nombre", filtro.nombre);
  // if (filtro.especialidadId) params.set("especialidadId", String(filtro.especialidadId));
  // return api.get<Profesional[]>(`/profesionales?${params.toString()}`);

  let resultado = MOCK_PROFESIONALES;

  if (filtro.nombre && filtro.nombre.trim() !== "") {
    const q = filtro.nombre.trim().toLowerCase();
    resultado = resultado.filter(
      (p) =>
        p.nombrePr.toLowerCase().includes(q) ||
        p.apellidoPr.toLowerCase().includes(q)
    );
  }

  if (filtro.especialidadId) {
    resultado = resultado.filter((p) =>
      p.especialidades.some((e) => e.id === filtro.especialidadId)
    );
  }

  return delay(resultado);
}
