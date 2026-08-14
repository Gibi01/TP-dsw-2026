// src/Tipos/dominio.ts
// Interfaces del modelo de dominio, a partir del diagrama entidad-relación.

export interface Especialidad {
  id: number;
  idEspecialidad: string;
  descripcionEsp: string;
}

export interface Profesional {
  id: number;
  matricula: string;
  nombrePr: string;
  apellidoPr: string;
  especialidades: Especialidad[];
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
