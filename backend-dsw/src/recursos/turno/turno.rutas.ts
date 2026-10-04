import { Router } from 'express';
import {
  sanitizeTurnoInput,
  validarTurnoCreacion,
  sanitizeCancelacionInput,
  disponibilidadDoctor,
  disponibilidadEspecialidad,
  disponibilidadMesDoctor,
  disponibilidadMesEspecialidad,
  add,
  misTurnos,
  turnosQueAtiendo,
  findOne,
  cancelar,
  marcarAsistido,
  marcarNoAsistido,
} from './turno.controlador.js';
import { verificarSesion, autorizarRoles } from '../../shared/middlewares/auth.middleware.js';

export const turnoRouter = Router();

// Disponibilidad: se puede explorar sin estar logueado
turnoRouter.get('/disponibilidad', disponibilidadDoctor);
turnoRouter.get('/disponibilidad-especialidad', disponibilidadEspecialidad);
turnoRouter.get('/disponibilidad-mes', disponibilidadMesDoctor);
turnoRouter.get('/disponibilidad-mes-especialidad', disponibilidadMesEspecialidad);
// Resto de las rutas requieren autenticación
turnoRouter.get('/mios', verificarSesion, misTurnos);
turnoRouter.get('/atiendo', verificarSesion, autorizarRoles('doctor'), turnosQueAtiendo);
turnoRouter.post('/', verificarSesion, sanitizeTurnoInput, validarTurnoCreacion, add);
turnoRouter.patch('/:id/cancelar', verificarSesion, sanitizeCancelacionInput, cancelar);
turnoRouter.patch('/:id/asistio', verificarSesion, autorizarRoles('doctor'), marcarAsistido);
turnoRouter.patch('/:id/no-asistio', verificarSesion, autorizarRoles('doctor'), marcarNoAsistido);
turnoRouter.get('/:id', verificarSesion, findOne);

export default turnoRouter;
