import { Router } from 'express';
import {
  sanitizeTurnoInput,
  validarTurnoCreacion,
  sanitizeCancelacionInput,
  validarCancelacionInput,
  disponibilidadDoctor,
  disponibilidadEspecialidad,
  add,
  misTurnos,
  turnosQueAtiendo,
  findOne,
  cancelar,
  marcarAsistido,
  marcarNoAsistido,
} from './turno.controlador.js';
import { verificarToken, autorizarRoles } from '../../shared/middlewares/auth.middleware.js';

export const turnoRouter = Router();

// la disponibilidad se puede ver sin estar logueado, el login hace falta recien para reservar
turnoRouter.get('/disponibilidad', disponibilidadDoctor);
turnoRouter.get('/disponibilidad-especialidad', disponibilidadEspecialidad);

turnoRouter.get('/mios', verificarToken, misTurnos);
turnoRouter.get('/atiendo', verificarToken, autorizarRoles('doctor'), turnosQueAtiendo);
turnoRouter.post('/', verificarToken, sanitizeTurnoInput, validarTurnoCreacion, add);
turnoRouter.patch('/:id/cancelar', verificarToken, sanitizeCancelacionInput, validarCancelacionInput, cancelar);
turnoRouter.patch('/:id/asistio', verificarToken, autorizarRoles('doctor'), marcarAsistido);
turnoRouter.patch('/:id/no-asistio', verificarToken, autorizarRoles('doctor'), marcarNoAsistido);
turnoRouter.get('/:id', verificarToken, findOne);

export default turnoRouter;
