import { Router } from "express"
import {
  sanitizeusuarioInput,
  validarUsuarioCreacion,
  findAll,
  findOne,
  add,
  update,
  remove,
} from "./usuario.controlador.js"
import { verificarToken, autorizarRoles } from "../../shared/middlewares/auth.middleware.js"

export const usuarioRouter = Router()

usuarioRouter.get('/', verificarToken, autorizarRoles('admin'), findAll);
usuarioRouter.get('/:id', verificarToken, findOne);
usuarioRouter.post('/', sanitizeusuarioInput, validarUsuarioCreacion, add);
usuarioRouter.put('/:id', verificarToken, sanitizeusuarioInput, update);
usuarioRouter.patch('/:id', verificarToken, sanitizeusuarioInput, update);
usuarioRouter.delete('/:id', verificarToken, autorizarRoles('admin'), remove);

export default usuarioRouter
