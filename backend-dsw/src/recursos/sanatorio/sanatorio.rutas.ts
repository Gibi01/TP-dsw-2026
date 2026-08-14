import { Router } from "express"
import {
  sanitizesanatorioInput,
  validarSanatorioCreacion,
  findAll,
  findOne,
  add,
  update,
  remove,
} from "./sanatorio.controlador.js"
import { verificarToken, autorizarRoles } from "../../shared/middlewares/auth.middleware.js"

export const sanatorioRouter = Router()

sanatorioRouter.get('/', findAll);
sanatorioRouter.get('/:id', findOne);
sanatorioRouter.post('/', verificarToken, autorizarRoles('admin'), sanitizesanatorioInput, validarSanatorioCreacion, add);
sanatorioRouter.put('/:id', verificarToken, autorizarRoles('admin'), sanitizesanatorioInput, update);
sanatorioRouter.patch('/:id', verificarToken, autorizarRoles('admin'), sanitizesanatorioInput, update);
sanatorioRouter.delete('/:id', verificarToken, autorizarRoles('admin'), remove);

export default sanatorioRouter
