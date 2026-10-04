import { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { Usuario } from './usuario.entidad.js';
import { orm } from '../../shared/orm.js';
import { auth } from '../../shared/auth.js';
import { limpiarInput, validarCamposRequeridos, parsearIdNumerico } from '../../shared/validacion.js';
import { BadRequestError, ForbiddenError } from '../../shared/errores.js';

const em = orm.em;
const CAMPOS = ['nombre', 'apellido', 'password', 'email', 'rol', 'dni', 'foto', 'direccion', 'telefonoCelular'];

function sanitizeusuarioInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = limpiarInput(req.body, CAMPOS);
  next();
}

function validarUsuarioCreacion(req: Request, res: Response, next: NextFunction) {
  validarCamposRequeridos(req.body.sanitizedInput, ['nombre', 'apellido', 'password', 'email', 'dni']);
  next();
}

async function findAll(req: Request, res: Response) {
  res.json({ message: 'usuarios encontrados', data: await em.find(Usuario, {}) });
}

async function me(req: Request, res: Response) {
  res.json({ message: 'tu perfil', data: await em.findOneOrFail(Usuario, { id: req.usuario!.id }) });
}

async function findOne(req: Request, res: Response) {
  const id = parsearIdNumerico(req.params.id);
  if (req.usuario?.rol !== 'admin' && req.usuario?.id !== id) throw new ForbiddenError('Solo podés ver tu propio usuario');
  res.json({ message: 'usuario encontrado', data: await em.findOneOrFail(Usuario, { id }) });
}

async function add(req: Request, res: Response) {
  const datos = req.body.sanitizedInput;
  const resultado = await auth.api.signUpEmail({
    body: { name: datos.nombre, apellido: datos.apellido, dni: datos.dni, email: datos.email, password: datos.password },
    headers: fromNodeHeaders(req.headers),
  });
  const usuario = await em.findOneOrFail(Usuario, { authUserId: resultado.user.id });
  res.status(201).json({ message: 'usuario creado', data: usuario });
}

async function update(req: Request, res: Response) {
  const id = parsearIdNumerico(req.params.id);
  if (req.usuario?.rol !== 'admin' && req.usuario?.id !== id) throw new ForbiddenError('Solo podés modificar tu propio usuario');
  const usuario = await em.findOneOrFail(Usuario, { id });
  const { nombre, apellido, email, rol, password, foto, direccion, telefonoCelular } = req.body.sanitizedInput;
  if (password !== undefined) throw new BadRequestError('Usá el cambio de contraseña de Better Auth con tu contraseña actual');
  const headers = fromNodeHeaders(req.headers);
  if (rol !== undefined && (req.usuario!.rol !== 'admin' || !['paciente', 'admin'].includes(rol))) {
    throw new ForbiddenError('No podés asignar ese rol');
  }
  const datos = Object.fromEntries(Object.entries({ name: nombre, apellido, email }).filter(([, v]) => v !== undefined));
  if (req.usuario!.rol === 'admin') {
    if (Object.keys(datos).length) await auth.api.adminUpdateUser({ headers, body: { userId: usuario.authUserId, data: datos } });
    if (rol !== undefined) await auth.api.setRole({ headers, body: { userId: usuario.authUserId, role: rol } });
  } else {
    if (email !== undefined && email !== usuario.email) await auth.api.changeEmail({ headers, body: { newEmail: email } });
    if (nombre !== undefined || apellido !== undefined) await auth.api.updateUser({ headers, body: { name: nombre, apellido } });
  }
  await em.refresh(usuario);
  em.assign(usuario, Object.fromEntries(Object.entries({ foto, direccion, telefonoCelular }).filter(([, v]) => v !== undefined)));
  await em.flush();
  res.json({ message: 'usuario actualizado', data: usuario });
}

async function remove(req: Request, res: Response) {
  const usuario = await em.findOneOrFail(Usuario, { id: parsearIdNumerico(req.params.id) });
  await auth.api.removeUser({ headers: fromNodeHeaders(req.headers), body: { userId: usuario.authUserId } });
  res.json({ message: 'usuario eliminado' });
}

export { sanitizeusuarioInput, validarUsuarioCreacion, findAll, findOne, me, add, update, remove };
