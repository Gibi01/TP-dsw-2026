import { Router } from 'express';
import {
  sanitizeDoctorInput,
  validarDoctorCreacion,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './doctor.controlador.js';
import { verificarToken, autorizarRoles } from '../../shared/middlewares/auth.middleware.js';

export const doctorRouter = Router();

doctorRouter.get('/', findAll);
doctorRouter.get('/:matricula', findOne);
doctorRouter.post('/', verificarToken, autorizarRoles('admin'), sanitizeDoctorInput, validarDoctorCreacion, add);
doctorRouter.put('/:matricula', verificarToken, autorizarRoles('admin'), sanitizeDoctorInput, update);
doctorRouter.patch('/:matricula', verificarToken, autorizarRoles('admin'), sanitizeDoctorInput, update);
doctorRouter.delete('/:matricula', verificarToken, autorizarRoles('admin'), remove);

export default doctorRouter;
