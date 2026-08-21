// src/Tipos/dominio.ts
// Interfaces del modelo de dominio. Reflejan el shape real que devuelve el backend
// (ver backend-dsw/src/recursos/*/*.entidad.ts), no un mock aparte.

export interface Especialidad {
  idEspecialidad: number;
  descripcionEsp: string;
}

// El doctor es también un Usuario (cuenta propia): nombre/apellido/email/foto viven ahí,
// no se duplican en Doctor. "activo" es la baja lógica: un doctor inactivo no se ofrece
// como opción al paciente bajo ningún concepto.
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
}

export interface PerfilUsuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  dni?: string;
  foto?: string;
  obraSocial?: string;
  direccion?: string;
  telefonoCelular?: string;
}

// Pendiente: recién reservado. Cancelado: el paciente lo canceló. Asistido: el paciente se
// presentó (lo confirma el doctor). No asistido: no se presentó ni canceló (lo aplica el
// doctor manualmente, o el sistema automáticamente 12hs después de la fecha/hora del turno).
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

// Datos del paciente embebidos en un turno, tal como los ve el doctor en "Mis turnos".
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

// Un horario disponible de una especialidad: primero se elige el horario, después el
// doctor que atiende en ese horario (puede haber más de uno).
export interface SlotEspecialidad {
  fechaHoraTurno: string;
  doctor: Doctor;
}
