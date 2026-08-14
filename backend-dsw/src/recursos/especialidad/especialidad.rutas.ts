import { Router } from 'express';
import {
  sanitizeEspecialidadInput,
  validarEspecialidadCreacion,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './especialidad.controlador.js';
import { verificarToken, autorizarRoles } from '../../shared/middlewares/auth.middleware.js';

export const especialidadRouter = Router();

especialidadRouter.get('/', findAll);
especialidadRouter.get('/:id', findOne);
especialidadRouter.post('/', verificarToken, autorizarRoles('admin'), sanitizeEspecialidadInput, validarEspecialidadCreacion, add);
especialidadRouter.put('/:id', verificarToken, autorizarRoles('admin'), sanitizeEspecialidadInput, update);
especialidadRouter.patch('/:id', verificarToken, autorizarRoles('admin'), sanitizeEspecialidadInput, update);
especialidadRouter.delete('/:id', verificarToken, autorizarRoles('admin'), remove);

export default especialidadRouter;
