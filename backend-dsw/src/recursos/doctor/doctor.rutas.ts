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
import { verificarToken, autorizarRoles, intentarVerificarToken } from '../../shared/middlewares/auth.middleware.js';

export const doctorRouter = Router();

doctorRouter.get('/', intentarVerificarToken, findAll);
doctorRouter.get('/mios', verificarToken, autorizarRoles('doctor'), misDatos);
doctorRouter.get('/:matricula', intentarVerificarToken, findOne);
doctorRouter.post('/', verificarToken, autorizarRoles('admin'), sanitizeDoctorAlta, validarDoctorCreacion, add);
doctorRouter.put('/:matricula', verificarToken, autorizarRoles('admin'), sanitizeDoctorEdicion, update);
doctorRouter.patch('/:matricula', verificarToken, autorizarRoles('admin'), sanitizeDoctorEdicion, update);
doctorRouter.delete('/:matricula', verificarToken, autorizarRoles('admin'), remove);

export default doctorRouter;
