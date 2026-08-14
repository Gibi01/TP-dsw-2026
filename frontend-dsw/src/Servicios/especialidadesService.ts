// src/Servicios/especialidadesService.ts
import type { Especialidad } from "../Tipos/dominio";
// import { api } from "./api"; // <- descomentar cuando conectes el backend

const MOCK_ESPECIALIDADES: Especialidad[] = [
  { id: 1, idEspecialidad: "CARD", descripcionEsp: "Cardiología" },
  { id: 2, idEspecialidad: "DERM", descripcionEsp: "Dermatología" },
  { id: 3, idEspecialidad: "PED", descripcionEsp: "Pediatría" },
  { id: 4, idEspecialidad: "TRAU", descripcionEsp: "Traumatología" },
  { id: 5, idEspecialidad: "GINE", descripcionEsp: "Ginecología" },
  { id: 6, idEspecialidad: "CLIN", descripcionEsp: "Clínica Médica" },
];

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getEspecialidades(): Promise<Especialidad[]> {
  // Real: return api.get<Especialidad[]>("/especialidades");
  return delay(MOCK_ESPECIALIDADES);
}
