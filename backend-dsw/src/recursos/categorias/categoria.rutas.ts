import { Router } from 'express';
import {
  sanitizeCategoriaInput,
  validarCategoriaCreacion,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './categoria.controlador.js';
import { verificarToken, autorizarRoles } from '../../shared/middlewares/auth.middleware.js';

export const categoriaRouter = Router();

categoriaRouter.get('/', findAll);
categoriaRouter.get('/:id', findOne);
categoriaRouter.post('/', verificarToken, autorizarRoles('admin'), sanitizeCategoriaInput, validarCategoriaCreacion, add);
categoriaRouter.put('/:id', verificarToken, autorizarRoles('admin'), sanitizeCategoriaInput, update);
categoriaRouter.patch('/:id', verificarToken, autorizarRoles('admin'), sanitizeCategoriaInput, update);
categoriaRouter.delete('/:id', verificarToken, autorizarRoles('admin'), remove);

export default categoriaRouter;
