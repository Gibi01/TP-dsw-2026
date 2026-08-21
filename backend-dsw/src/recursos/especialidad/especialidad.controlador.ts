import { Request, Response, NextFunction } from 'express';
import { Especialidad } from './especialidad.entidad.js';
import { orm } from '../../shared/orm.js';
import { limpiarInput, validarCamposRequeridos, parsearIdNumerico } from '../../shared/validacion.js';

const em = orm.em;

// idEspecialidad no se acepta desde el cliente: la asigna la base de datos (autoincrement).
const CAMPOS = ['descripcionEsp'];
const CAMPOS_REQUERIDOS = ['descripcionEsp'];

function sanitizeEspecialidadInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = limpiarInput(req.body, CAMPOS);
  next();
}

function validarEspecialidadCreacion(req: Request, res: Response, next: NextFunction) {
  validarCamposRequeridos(req.body.sanitizedInput, CAMPOS_REQUERIDOS);
  next();
}

async function findAll(req: Request, res: Response) {
  const especialidades = await em.find(Especialidad, {});
  res.status(200).json({ message: 'encontradas todas las especialidades', data: especialidades });
}

async function findOne(req: Request, res: Response) {
  const idEspecialidad = parsearIdNumerico(req.params.id);
  const especialidad = await em.findOneOrFail(
    Especialidad,
    { idEspecialidad },
    { populate: ['doctores', 'doctores.usuario'] }
  );
  const data = {
    idEspecialidad: especialidad.idEspecialidad,
    descripcionEsp: especialidad.descripcionEsp,
    // Un doctor dado de baja no se ofrece como opción bajo ningún concepto. Nunca se expone
    // el Usuario completo del doctor (contraseña incluida), solo los datos públicos.
    doctores: especialidad.doctores
      .getItems()
      .filter((d) => d.activo)
      .map((d) => ({ matricula: d.matricula, nombre: d.usuario.nombre, apellido: d.usuario.apellido })),
  };
  res.status(200).json({ message: 'encontrada especialidad', data });
}

async function add(req: Request, res: Response) {
  const especialidad = em.create(Especialidad, req.body.sanitizedInput);
  await em.flush();
  res.status(201).json({ message: 'especialidad creada', data: especialidad });
}

async function update(req: Request, res: Response) {
  const idEspecialidad = parsearIdNumerico(req.params.id);
  const especialidad = await em.findOneOrFail(Especialidad, { idEspecialidad });
  em.assign(especialidad, req.body.sanitizedInput);
  await em.flush();
  res.status(200).json({ message: 'especialidad actualizada', data: especialidad });
}

async function remove(req: Request, res: Response) {
  const idEspecialidad = parsearIdNumerico(req.params.id);
  const especialidad = await em.findOneOrFail(Especialidad, { idEspecialidad });
  await em.removeAndFlush(especialidad);
  res.status(200).json({ message: 'especialidad eliminada' });
}

export {
  sanitizeEspecialidadInput,
  validarEspecialidadCreacion,
  findAll,
  findOne,
  add,
  update,
  remove,
};
