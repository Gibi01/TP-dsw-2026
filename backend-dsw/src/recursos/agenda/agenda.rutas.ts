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
import { verificarSesion, autorizarRoles } from '../../shared/middlewares/auth.middleware.js';

export const agendaRouter = Router();

agendaRouter.get('/', findAll);
agendaRouter.get('/:id', findOne);
agendaRouter.post('/', verificarSesion, autorizarRoles('admin', 'doctor'), sanitizeAgendaInput, validarAgendaCreacion, add);
agendaRouter.put('/:id', verificarSesion, autorizarRoles('admin', 'doctor'), sanitizeAgendaInput, update);
agendaRouter.patch('/:id', verificarSesion, autorizarRoles('admin', 'doctor'), sanitizeAgendaInput, update);
agendaRouter.delete('/:id', verificarSesion, autorizarRoles('admin', 'doctor'), remove);

export default agendaRouter;
