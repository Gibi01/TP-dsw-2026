import { Router } from 'express';
import {
  sanitizeAgendaInput,
  validarAgendaCreacion,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './agenda.controlador.js';
import { verificarToken, autorizarRoles } from '../../shared/middlewares/auth.middleware.js';

export const agendaRouter = Router();

agendaRouter.get('/', findAll);
agendaRouter.get('/:id', findOne);
agendaRouter.post('/', verificarToken, autorizarRoles('admin'), sanitizeAgendaInput, validarAgendaCreacion, add);
agendaRouter.put('/:id', verificarToken, autorizarRoles('admin'), sanitizeAgendaInput, update);
agendaRouter.patch('/:id', verificarToken, autorizarRoles('admin'), sanitizeAgendaInput, update);
agendaRouter.delete('/:id', verificarToken, autorizarRoles('admin'), remove);

export default agendaRouter;
