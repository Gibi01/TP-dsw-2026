import { Router } from 'express';
import {
  sanitizeObraSocialInput,
  validarObraSocialCreacion,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './obraSocial.controlador.js';
import { verificarSesion, autorizarRoles } from '../../shared/middlewares/auth.middleware.js';

export const obraSocialRouter = Router();

obraSocialRouter.get('/', findAll);
obraSocialRouter.get('/:id', findOne);
obraSocialRouter.post('/', verificarSesion, autorizarRoles('admin'), sanitizeObraSocialInput, validarObraSocialCreacion, add);
obraSocialRouter.put('/:id', verificarSesion, autorizarRoles('admin'), sanitizeObraSocialInput, update);
obraSocialRouter.patch('/:id', verificarSesion, autorizarRoles('admin'), sanitizeObraSocialInput, update);
obraSocialRouter.delete('/:id', verificarSesion, autorizarRoles('admin'), remove);

export default obraSocialRouter;
