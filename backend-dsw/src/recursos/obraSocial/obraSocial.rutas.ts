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
import { verificarToken, autorizarRoles } from '../../shared/middlewares/auth.middleware.js';

export const obraSocialRouter = Router();

obraSocialRouter.get('/', findAll);
obraSocialRouter.get('/:id', findOne);
obraSocialRouter.post('/', verificarToken, autorizarRoles('admin'), sanitizeObraSocialInput, validarObraSocialCreacion, add);
obraSocialRouter.put('/:id', verificarToken, autorizarRoles('admin'), sanitizeObraSocialInput, update);
obraSocialRouter.patch('/:id', verificarToken, autorizarRoles('admin'), sanitizeObraSocialInput, update);
obraSocialRouter.delete('/:id', verificarToken, autorizarRoles('admin'), remove);

export default obraSocialRouter;
