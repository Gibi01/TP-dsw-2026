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
  findOne,
  cancelar,
} from './turno.controlador.js';
import { verificarToken } from '../../shared/middlewares/auth.middleware.js';

export const turnoRouter = Router();

// Disponibilidad: se puede explorar sin estar logueado, recién hace falta login para reservar.
turnoRouter.get('/disponibilidad', disponibilidadDoctor);
turnoRouter.get('/disponibilidad-especialidad', disponibilidadEspecialidad);

turnoRouter.get('/mios', verificarToken, misTurnos);
turnoRouter.post('/', verificarToken, sanitizeTurnoInput, validarTurnoCreacion, add);
turnoRouter.patch('/:id/cancelar', verificarToken, sanitizeCancelacionInput, validarCancelacionInput, cancelar);
turnoRouter.get('/:id', verificarToken, findOne);

export default turnoRouter;
