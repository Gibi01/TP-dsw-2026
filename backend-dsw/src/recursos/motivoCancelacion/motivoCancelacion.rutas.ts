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
import { verificarToken, autorizarRoles } from '../../shared/middlewares/auth.middleware.js';

export const motivoCancelacionRouter = Router();

motivoCancelacionRouter.get('/', findAll);
motivoCancelacionRouter.get('/:id', findOne);
motivoCancelacionRouter.post('/', verificarToken, autorizarRoles('admin'), sanitizeMotivoCancelacionInput, validarMotivoCancelacionCreacion, add);
motivoCancelacionRouter.put('/:id', verificarToken, autorizarRoles('admin'), sanitizeMotivoCancelacionInput, update);
motivoCancelacionRouter.patch('/:id', verificarToken, autorizarRoles('admin'), sanitizeMotivoCancelacionInput, update);
motivoCancelacionRouter.delete('/:id', verificarToken, autorizarRoles('admin'), remove);

export default motivoCancelacionRouter;
