import { Request, Response, NextFunction } from 'express';
import { Agenda } from './agenda.entidad.js';
import { Doctor } from '../doctor/doctor.entidad.js';
import { orm } from '../../shared/orm.js';
import { limpiarInput, validarCamposRequeridos, parsearIdNumerico } from '../../shared/validacion.js';
import { BadRequestError } from '../../shared/errores.js';

const em = orm.em;

const CAMPOS = ['doctorId', 'diaSemana', 'horaInicio', 'horaFin', 'duracionTurnoMinutos'];
const CAMPOS_REQUERIDOS = ['doctorId', 'diaSemana', 'horaInicio', 'horaFin', 'duracionTurnoMinutos'];
const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function sanitizeAgendaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = limpiarInput(req.body, CAMPOS);
  next();
}

function validarAgendaCreacion(req: Request, res: Response, next: NextFunction) {
  validarCamposRequeridos(req.body.sanitizedInput, CAMPOS_REQUERIDOS);
  next();
}

function minutosDesde(horaHHMM: string): number {
  const [h, m] = horaHHMM.split(':').map(Number);
  return h * 60 + m;
}

// Valida formato/consistencia de los campos de una agenda ya en sanitizedInput.
// Se corre tanto en creación (todos los campos) como en edición (solo los presentes).
function validarDatosAgenda(datos: Record<string, unknown>) {
  if (datos.diaSemana !== undefined) {
    const dia = Number(datos.diaSemana);
    if (!Number.isInteger(dia) || dia < 0 || dia > 6) {
      throw new BadRequestError('diaSemana debe ser un entero entre 0 (domingo) y 6 (sábado)');
    }
  }
  if (datos.horaInicio !== undefined && !HORA_REGEX.test(String(datos.horaInicio))) {
    throw new BadRequestError('horaInicio debe tener formato HH:MM');
  }
  if (datos.horaFin !== undefined && !HORA_REGEX.test(String(datos.horaFin))) {
    throw new BadRequestError('horaFin debe tener formato HH:MM');
  }
  if (datos.horaInicio !== undefined && datos.horaFin !== undefined) {
    if (minutosDesde(String(datos.horaInicio)) >= minutosDesde(String(datos.horaFin))) {
      throw new BadRequestError('horaInicio debe ser anterior a horaFin');
    }
  }
  if (datos.duracionTurnoMinutos !== undefined) {
    const duracion = Number(datos.duracionTurnoMinutos);
    if (!Number.isInteger(duracion) || duracion <= 0) {
      throw new BadRequestError('duracionTurnoMinutos debe ser un entero positivo');
    }
  }
}

async function findAll(req: Request, res: Response) {
  const filtro: Record<string, unknown> = {};
  if (req.query.doctorId) {
    filtro.doctor = parsearIdNumerico(req.query.doctorId as string);
  }
  const agendas = await em.find(Agenda, filtro, { populate: ['doctor'] });
  res.status(200).json({ message: 'encontradas todas las agendas', data: agendas });
}

async function findOne(req: Request, res: Response) {
  const id = parsearIdNumerico(req.params.id);
  const agenda = await em.findOneOrFail(Agenda, { id }, { populate: ['doctor'] });
  res.status(200).json({ message: 'encontrada agenda', data: agenda });
}

async function add(req: Request, res: Response) {
  const { doctorId, ...datos } = req.body.sanitizedInput as { doctorId: unknown; [key: string]: unknown };
  validarDatosAgenda(datos);

  const matricula = parsearIdNumerico(String(doctorId));
  const doctor = await em.findOneOrFail(Doctor, { matricula });

  const agenda = em.create(Agenda, {
    doctor,
    diaSemana: Number(datos.diaSemana),
    horaInicio: String(datos.horaInicio),
    horaFin: String(datos.horaFin),
    duracionTurnoMinutos: Number(datos.duracionTurnoMinutos),
  });

  await em.flush();
  res.status(201).json({ message: 'agenda creada', data: agenda });
}

async function update(req: Request, res: Response) {
  const id = parsearIdNumerico(req.params.id);
  const agenda = await em.findOneOrFail(Agenda, { id });

  const { doctorId, ...datos } = req.body.sanitizedInput as { doctorId?: unknown; [key: string]: unknown };
  validarDatosAgenda(datos);

  if (doctorId !== undefined) {
    const matricula = parsearIdNumerico(String(doctorId));
    agenda.doctor = await em.findOneOrFail(Doctor, { matricula });
  }

  em.assign(agenda, datos);
  await em.flush();
  res.status(200).json({ message: 'agenda actualizada', data: agenda });
}

async function remove(req: Request, res: Response) {
  const id = parsearIdNumerico(req.params.id);
  const agenda = await em.findOneOrFail(Agenda, { id });
  await em.removeAndFlush(agenda);
  res.status(200).json({ message: 'agenda eliminada' });
}

export {
  sanitizeAgendaInput,
  validarAgendaCreacion,
  findAll,
  findOne,
  add,
  update,
  remove,
};
