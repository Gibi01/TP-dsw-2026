import { Router } from 'express';
import {
  sanitizeMotivoCancelacionInput,
  validarMotivoCancelacionCreacion,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './motivoCancelacion.controlador.js';
import { verificarSesion, autorizarRoles } from '../../shared/middlewares/auth.middleware.js';

export const motivoCancelacionRouter = Router();

motivoCancelacionRouter.get('/', findAll);
motivoCancelacionRouter.get('/:id', findOne);
motivoCancelacionRouter.post('/', verificarSesion, autorizarRoles('admin'), sanitizeMotivoCancelacionInput, validarMotivoCancelacionCreacion, add);
motivoCancelacionRouter.put('/:id', verificarSesion, autorizarRoles('admin'), sanitizeMotivoCancelacionInput, update);
motivoCancelacionRouter.patch('/:id', verificarSesion, autorizarRoles('admin'), sanitizeMotivoCancelacionInput, update);
motivoCancelacionRouter.delete('/:id', verificarSesion, autorizarRoles('admin'), remove);

export default motivoCancelacionRouter;
