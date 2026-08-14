// src/Tipos/dominio.ts
// Interfaces del modelo de dominio. Reflejan el shape real que devuelve el backend
// (ver backend-dsw/src/recursos/*/*.entidad.ts), no un mock aparte.

export interface Especialidad {
  idEspecialidad: number;
  descripcionEsp: string;
}

export interface Doctor {
  matricula: number;
  nombrePr: string;
  apellidoPr: string;
  especialidades?: Especialidad[];
}

export interface RegistroUsuarioForm {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface UsuarioSesion {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}

export interface Turno {
  id: number;
  usuarioId: number;
  doctor: Doctor;
  fechaHoraEmision: string;
  fechaHoraTurno: string;
  estado: "reservado" | "cancelado";
  fechaHoraCancelacion: string | null;
  motivoCancelacion: string | null;
}
