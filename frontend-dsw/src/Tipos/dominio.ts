// src/Tipos/dominio.ts
// interfaces del dominio, calcadas de lo que devuelve el backend de verdad

export interface Especialidad {
  idEspecialidad: number;
  descripcionEsp: string;
}

// el doctor tambien es un usuario, nombre/apellido/email/foto estan ahi, no se duplican
// "activo" es la baja logica, si esta en false no se lo ofrece nunca como opcion
export interface Doctor {
  matricula: number;
  nombre: string;
  apellido: string;
  email?: string;
  foto?: string | null;
  especialidades?: Especialidad[];
  activo?: boolean;
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
  foto?: string | null;
}

export interface PerfilUsuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  dni?: string;
  foto?: string | null;
  obraSocial?: string;
  direccion?: string;
  telefonoCelular?: string;
}

// pendiente = recien reservado, cancelado = el paciente lo cancelo, asistido = vino (lo confirma
// el doctor), no_asistido = no vino ni cancelo (a mano o automatico a las 12hs del turno)
export type EstadoTurno = "pendiente" | "cancelado" | "asistido" | "no_asistido";

export interface Turno {
  id: number;
  usuarioId: number;
  doctor: Doctor;
  fechaHoraEmision: string;
  fechaHoraTurno: string;
  estado: EstadoTurno;
  fechaHoraCancelacion: string | null;
  motivoCancelacion: string | null;
}

// datos del paciente que vienen adentro del turno, como los ve el doctor en "Mis turnos"
export interface PacienteDeTurno {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  dni: string | null;
  telefonoCelular: string | null;
}

export interface TurnoParaDoctor extends Turno {
  paciente: PacienteDeTurno;
}

// un horario disponible de una especialidad, primero se elige el horario y despues el
// doctor que atiende ahi (puede haber mas de uno)
export interface SlotEspecialidad {
  fechaHoraTurno: string;
  doctor: Doctor;
}
