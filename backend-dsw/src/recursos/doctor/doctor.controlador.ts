import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { Doctor } from './doctor.entidad.js';
import { Especialidad } from '../especialidad/especialidad.entidad.js';
import { Usuario } from '../usuarios/usuario.entidad.js';
import { orm } from '../../shared/orm.js';
import { limpiarInput, validarCamposRequeridos, parsearIdNumerico } from '../../shared/validacion.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../../shared/errores.js';

const em = orm.em;
const SALT_ROUNDS = 10;

// Alta: además de la matrícula, se cargan los datos de la cuenta (Usuario) del doctor.
const CAMPOS_ALTA = [
  'matricula',
  'nombre',
  'apellido',
  'email',
  'password',
  'dni',
  'especialidadIds',
];
const CAMPOS_REQUERIDOS_ALTA = ['matricula', 'nombre', 'apellido', 'email', 'password', 'dni'];

// Edición: la matrícula y la cuenta (Usuario) no se tocan por acá; el doctor edita su perfil
// por /api/usuarios/:id como cualquier usuario, y la matrícula es inmutable (es la PK).
const CAMPOS_EDICION = ['especialidadIds', 'activo'];

function sanitizeDoctorAlta(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = limpiarInput(req.body, CAMPOS_ALTA);
  next();
}

function sanitizeDoctorEdicion(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = limpiarInput(req.body, CAMPOS_EDICION);
  next();
}

function validarDoctorCreacion(req: Request, res: Response, next: NextFunction) {
  validarCamposRequeridos(req.body.sanitizedInput, CAMPOS_REQUERIDOS_ALTA);
  next();
}

// Respuesta pública de un doctor: nunca se serializa el Usuario completo (evita filtrar el
// hash de la contraseña); solo los datos de perfil que hacen falta para mostrarlo. Las
// especialidades van como DTO plano, nunca la entidad Especialidad cruda: esa entidad puede
// traer su propia colección "doctores" populada en otro punto del mismo request y volver a
// serializar el Usuario completo en un ciclo.
function serializarDoctor(doctor: Doctor) {
  const usuario = doctor.usuario;
  const especialidades = doctor.especialidades.isInitialized() ? doctor.especialidades.getItems() : [];
  return {
    matricula: doctor.matricula,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    foto: usuario.foto ?? null,
    especialidades: especialidades.map((e) => ({
      idEspecialidad: e.idEspecialidad,
      descripcionEsp: e.descripcionEsp,
    })),
    activo: doctor.activo,
  };
}

async function resolverDoctorDelUsuario(usuarioId: number): Promise<Doctor> {
  const doctor = await em.findOne(Doctor, { usuario: usuarioId }, { populate: ['usuario', 'especialidades'] });
  if (!doctor) {
    throw new ForbiddenError('Tu cuenta no tiene un doctor asociado');
  }
  return doctor;
}

async function findAll(req: Request, res: Response) {
  const filtro: Record<string, unknown> = {};
  // Un admin ve también los doctores dados de baja (para poder reactivarlos); cualquier
  // otro (paciente, doctor, o sin sesión) solo ve los activos: no deben ofrecerse como opción.
  if (req.usuario?.rol !== 'admin') {
    filtro.activo = true;
  }
  const doctores = await em.find(Doctor, filtro, { populate: ['usuario', 'especialidades'] });
  res.status(200).json({ message: 'encontrados todos los doctores', data: doctores.map(serializarDoctor) });
}

async function findOne(req: Request, res: Response) {
  const matricula = parsearIdNumerico(req.params.matricula);
  const doctor = await em.findOneOrFail(Doctor, { matricula }, { populate: ['usuario', 'especialidades'] });
  if (!doctor.activo && req.usuario?.rol !== 'admin') {
    throw new NotFoundError('Doctor no encontrado');
  }
  res.status(200).json({ message: 'encontrado doctor', data: serializarDoctor(doctor) });
}

// GET /api/doctores/mios — el doctor logueado consulta su propio registro (matrícula, etc).
async function misDatos(req: Request, res: Response) {
  const doctor = await resolverDoctorDelUsuario(req.usuario!.id);
  res.status(200).json({ message: 'tu registro de doctor', data: serializarDoctor(doctor) });
}

async function add(req: Request, res: Response) {
  const { matricula, especialidadIds, ...datosUsuario } = req.body.sanitizedInput as {
    matricula: unknown;
    especialidadIds?: number[];
    [key: string]: unknown;
  };

  const email = datosUsuario.email as string;
  const existente = await em.findOne(Usuario, { email });
  if (existente) {
    throw new ConflictError('Ya existe un usuario con ese email');
  }

  const matriculaNum = parsearIdNumerico(String(matricula));
  const matriculaExistente = await em.findOne(Doctor, { matricula: matriculaNum });
  if (matriculaExistente) {
    throw new ConflictError('Ya existe un doctor con esa matrícula');
  }

  const passwordHasheada = await bcrypt.hash(datosUsuario.password as string, SALT_ROUNDS);
  const usuario = em.create(Usuario, {
    nombre: datosUsuario.nombre as string,
    apellido: datosUsuario.apellido as string,
    email,
    dni: datosUsuario.dni as string,
    password: passwordHasheada,
    rol: 'doctor',
  });

  const doctor = em.create(Doctor, { matricula: matriculaNum, usuario, activo: true });

  if (Array.isArray(especialidadIds) && especialidadIds.length > 0) {
    const especialidades = await em.find(Especialidad, { idEspecialidad: { $in: especialidadIds } });
    doctor.especialidades.set(especialidades);
  }

  await em.flush();
  res.status(201).json({ message: 'doctor creado', data: serializarDoctor(doctor) });
}

async function update(req: Request, res: Response) {
  const matricula = parsearIdNumerico(req.params.matricula);
  const doctor = await em.findOneOrFail(Doctor, { matricula }, { populate: ['usuario', 'especialidades'] });

  const { especialidadIds, activo } = req.body.sanitizedInput as {
    especialidadIds?: number[];
    activo?: boolean;
  };

  if (Array.isArray(especialidadIds)) {
    const especialidades = await em.find(Especialidad, { idEspecialidad: { $in: especialidadIds } });
    doctor.especialidades.set(especialidades);
  }
  if (activo !== undefined) {
    doctor.activo = Boolean(activo);
  }

  await em.flush();
  res.status(200).json({ message: 'doctor actualizado', data: serializarDoctor(doctor) });
}

// DELETE /api/doctores/:matricula — baja lógica: nunca se borra de la base (ni el doctor
// ni sus turnos), solo deja de ofrecerse como opción de reserva.
async function remove(req: Request, res: Response) {
  const matricula = parsearIdNumerico(req.params.matricula);
  const doctor = await em.findOneOrFail(Doctor, { matricula });
  doctor.activo = false;
  await em.flush();
  res.status(200).json({ message: 'doctor dado de baja' });
}

export {
  sanitizeDoctorAlta,
  sanitizeDoctorEdicion,
  validarDoctorCreacion,
  resolverDoctorDelUsuario,
  findAll,
  findOne,
  misDatos,
  add,
  update,
  remove,
};
