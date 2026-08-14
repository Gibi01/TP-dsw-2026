import { Request, Response, NextFunction } from 'express';
import { Categoria } from './categoria.entidad.js';
import { orm } from '../../shared/orm.js';
import { limpiarInput, validarCamposRequeridos, parsearIdNumerico } from '../../shared/validacion.js';

const em = orm.em;

const CAMPOS = ['nombre'];
const CAMPOS_REQUERIDOS = ['nombre'];

function sanitizeCategoriaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = limpiarInput(req.body, CAMPOS);
  next();
}

function validarCategoriaCreacion(req: Request, res: Response, next: NextFunction) {
  validarCamposRequeridos(req.body.sanitizedInput, CAMPOS_REQUERIDOS);
  next();
}

async function findAll(req: Request, res: Response) {
  const categorias = await em.find(Categoria, {});
  res.status(200).json({ message: 'encontradas todas las categorías', data: categorias });
}

async function findOne(req: Request, res: Response) {
  const id = parsearIdNumerico(req.params.id);
  const categoria = await em.findOneOrFail(Categoria, { id });
  res.status(200).json({ message: 'encontrada categoría', data: categoria });
}

async function add(req: Request, res: Response) {
  const categoria = em.create(Categoria, req.body.sanitizedInput);
  await em.flush();
  res.status(201).json({ message: 'categoría creada', data: categoria });
}

async function update(req: Request, res: Response) {
  const id = parsearIdNumerico(req.params.id);
  const categoria = await em.findOneOrFail(Categoria, { id });
  em.assign(categoria, req.body.sanitizedInput);
  await em.flush();
  res.status(200).json({ message: 'categoría actualizada', data: categoria });
}

async function remove(req: Request, res: Response) {
  const id = parsearIdNumerico(req.params.id);
  const categoria = await em.findOneOrFail(Categoria, { id });
  await em.removeAndFlush(categoria);
  res.status(200).json({ message: 'categoría eliminada' });
}

export {
  sanitizeCategoriaInput,
  validarCategoriaCreacion,
  findAll,
  findOne,
  add,
  update,
  remove,
};
