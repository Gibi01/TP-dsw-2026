import { Request, Response, NextFunction } from 'express';
import { Sanatorio } from './sanatorio.entidad.js';
import { orm } from '../../shared/orm.js';
import { limpiarInput, validarCamposRequeridos, parsearIdNumerico } from '../../shared/validacion.js';

const em = orm.em;

const CAMPOS = ['id', 'nombre'];
const CAMPOS_REQUERIDOS = ['nombre'];

function sanitizesanatorioInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = limpiarInput(req.body, CAMPOS);
  next();
}

function validarSanatorioCreacion(req: Request, res: Response, next: NextFunction) {
  validarCamposRequeridos(req.body.sanitizedInput, CAMPOS_REQUERIDOS);
  next();
}

async function findAll(req: Request, res: Response) {
  const sanatorios = await em.find(Sanatorio, {});
  res.status(200).json({ message: 'encontrado todos los sanatorios', data: sanatorios });
}

async function findOne(req: Request, res: Response) {
  const id = parsearIdNumerico(req.params.id);
  const sanatorio = await em.findOneOrFail(Sanatorio, { id });
  res.status(200).json({ message: 'encontrado sanatorio', data: sanatorio });
}

async function add(req: Request, res: Response) {
  const sanatorio = em.create(Sanatorio, req.body.sanitizedInput);
  await em.flush();
  res.status(201).json({ message: 'sanatorio Creado', data: sanatorio });
}

async function update(req: Request, res: Response) {
  const id = parsearIdNumerico(req.params.id);
  const sanatorioToUpdate = await em.findOneOrFail(Sanatorio, { id });
  em.assign(sanatorioToUpdate, req.body.sanitizedInput);
  await em.flush();
  res.status(200).json({ message: 'sanatorio updated', data: sanatorioToUpdate });
}

async function remove(req: Request, res: Response) {
  const id = parsearIdNumerico(req.params.id);
  const sanatorio = await em.findOneOrFail(Sanatorio, { id });
  await em.removeAndFlush(sanatorio);
  res.status(200).json({ message: 'sanatorio eliminado' });
}

export {
  sanitizesanatorioInput,
  validarSanatorioCreacion,
  findAll,
  findOne,
  add,
  update,
  remove,
};
