import { Router } from 'express';
import {
  sanitizeDoctorAlta,
  sanitizeDoctorEdicion,
  validarDoctorCreacion,
  findAll,
  findOne,
  misDatos,
  add,
  update,
  remove,
} from './doctor.controlador.js';
import { verificarSesion, autorizarRoles, intentarVerificarSesion } from '../../shared/middlewares/auth.middleware.js';

export const doctorRouter = Router();

doctorRouter.get('/', intentarVerificarSesion, findAll);
doctorRouter.get('/mios', verificarSesion, autorizarRoles('doctor'), misDatos);
doctorRouter.get('/:matricula', intentarVerificarSesion, findOne);
doctorRouter.post('/', verificarSesion, autorizarRoles('admin'), sanitizeDoctorAlta, validarDoctorCreacion, add);
doctorRouter.put('/:matricula', verificarSesion, autorizarRoles('admin'), sanitizeDoctorEdicion, update);
doctorRouter.patch('/:matricula', verificarSesion, autorizarRoles('admin'), sanitizeDoctorEdicion, update);
doctorRouter.delete('/:matricula', verificarSesion, autorizarRoles('admin'), remove);

export default doctorRouter;
