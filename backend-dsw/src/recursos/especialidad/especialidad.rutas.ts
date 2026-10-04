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
import { verificarSesion, autorizarRoles } from '../../shared/middlewares/auth.middleware.js';

export const especialidadRouter = Router();

especialidadRouter.get('/', findAll);
especialidadRouter.get('/:id', findOne);
especialidadRouter.post('/', verificarSesion, autorizarRoles('admin'), sanitizeEspecialidadInput, validarEspecialidadCreacion, add);
especialidadRouter.put('/:id', verificarSesion, autorizarRoles('admin'), sanitizeEspecialidadInput, update);
especialidadRouter.patch('/:id', verificarSesion, autorizarRoles('admin'), sanitizeEspecialidadInput, update);
especialidadRouter.delete('/:id', verificarSesion, autorizarRoles('admin'), remove);

export default especialidadRouter;
