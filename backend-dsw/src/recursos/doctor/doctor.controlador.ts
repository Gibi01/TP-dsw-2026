import { Request, Response, NextFunction } from 'express';
import { Doctor } from './doctor.entidad.js';
import { Especialidad } from '../especialidad/especialidad.entidad.js';
import { orm } from '../../shared/orm.js';
import { limpiarInput, validarCamposRequeridos, parsearIdNumerico } from '../../shared/validacion.js';

const em = orm.em;

const CAMPOS = ['matricula', 'nombrePr', 'apellidoPr', 'especialidadIds'];
const CAMPOS_REQUERIDOS = ['matricula', 'nombrePr', 'apellidoPr'];

function sanitizeDoctorInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = limpiarInput(req.body, CAMPOS);
  next();
}

function validarDoctorCreacion(req: Request, res: Response, next: NextFunction) {
  validarCamposRequeridos(req.body.sanitizedInput, CAMPOS_REQUERIDOS);
  next();
}

async function findAll(req: Request, res: Response) {
  const doctores = await em.find(Doctor, {}, { populate: ['especialidades'] });
  res.status(200).json({ message: 'encontrados todos los doctores', data: doctores });
}

async function findOne(req: Request, res: Response) {
  const matricula = parsearIdNumerico(req.params.matricula);
  const doctor = await em.findOneOrFail(Doctor, { matricula }, { populate: ['especialidades'] });
  res.status(200).json({ message: 'encontrado doctor', data: doctor });
}

async function add(req: Request, res: Response) {
  const { especialidadIds, ...datos } = req.body.sanitizedInput as {
    especialidadIds?: number[];
    [key: string]: unknown;
  };
  const doctor = em.create(Doctor, datos as any);

  if (Array.isArray(especialidadIds) && especialidadIds.length > 0) {
    const especialidades = await em.find(Especialidad, { idEspecialidad: { $in: especialidadIds } });
    doctor.especialidades.set(especialidades);
  }

  await em.flush();
  res.status(201).json({ message: 'doctor creado', data: doctor });
}

async function update(req: Request, res: Response) {
  const matricula = parsearIdNumerico(req.params.matricula);
  const doctor = await em.findOneOrFail(Doctor, { matricula });

  const { especialidadIds, ...datos } = req.body.sanitizedInput as {
    especialidadIds?: number[];
    [key: string]: unknown;
  };
  em.assign(doctor, datos);

  if (Array.isArray(especialidadIds)) {
    const especialidades = await em.find(Especialidad, { idEspecialidad: { $in: especialidadIds } });
    doctor.especialidades.set(especialidades);
  }

  await em.flush();
  res.status(200).json({ message: 'doctor actualizado', data: doctor });
}

async function remove(req: Request, res: Response) {
  const matricula = parsearIdNumerico(req.params.matricula);
  const doctor = await em.findOneOrFail(Doctor, { matricula });
  await em.removeAndFlush(doctor);
  res.status(200).json({ message: 'doctor eliminado' });
}

export { sanitizeDoctorInput, validarDoctorCreacion, findAll, findOne, add, update, remove };
