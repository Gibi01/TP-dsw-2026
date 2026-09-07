import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { Usuario } from './usuario.entidad.js';
import { orm } from '../../shared/orm.js';
import { limpiarInput, validarCamposRequeridos, parsearIdNumerico } from '../../shared/validacion.js';
import { ConflictError, ForbiddenError } from '../../shared/errores.js';

const em = orm.em;

const CAMPOS = [
  'nombre',
  'apellido',
  'password',
  'email',
  'rol',
  'dni',
  'foto',
  'obraSocial',
  'direccion',
  'telefonoCelular',
];
const CAMPOS_REQUERIDOS = ['nombre', 'apellido', 'password', 'email', 'dni'];
const SALT_ROUNDS = 10;
const ROLES_VALIDOS = ['paciente', 'admin', 'doctor'];

function sanitizeusuarioInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = limpiarInput(req.body, CAMPOS);
  next();
}

function validarUsuarioCreacion(req: Request, res: Response, next: NextFunction) {
  validarCamposRequeridos(req.body.sanitizedInput, CAMPOS_REQUERIDOS);
  // nadie se puede poner admin solo al registrarse
  req.body.sanitizedInput.rol = 'paciente';
  next();
}

function ocultarPassword(usuario: Usuario) {
  const { password, ...resto } = usuario;
  return resto;
}

async function findAll(req: Request, res: Response) {
  const usuarios = await em.find(Usuario, {});
  res.status(200).json({ message: 'encontrado todos los usuarios', data: usuarios.map(ocultarPassword) });
}

async function findOne(req: Request, res: Response) {
  const id = parsearIdNumerico(req.params.id);
  if (req.usuario?.rol !== 'admin' && req.usuario?.id !== id) {
    throw new ForbiddenError('Solo podés ver tu propio usuario');
  }
  const usuario = await em.findOneOrFail(Usuario, { id });
  res.status(200).json({ message: 'encontrado usuario', data: ocultarPassword(usuario) });
}

async function add(req: Request, res: Response) {
  const email = req.body.sanitizedInput.email as string;
  const existente = await em.findOne(Usuario, { email });
  if (existente) {
    throw new ConflictError('Ya existe un usuario con ese email');
  }

  const passwordHasheada = await bcrypt.hash(req.body.sanitizedInput.password as string, SALT_ROUNDS);
  const usuario = em.create(Usuario, { ...req.body.sanitizedInput, password: passwordHasheada });
  await em.flush();
  res.status(201).json({ message: 'usuario Creado', data: ocultarPassword(usuario) });
}

async function update(req: Request, res: Response) {
  const id = parsearIdNumerico(req.params.id);
  if (req.usuario?.rol !== 'admin' && req.usuario?.id !== id) {
    throw new ForbiddenError('Solo podés modificar tu propio usuario');
  }

  const usuarioToUpdate = await em.findOneOrFail(Usuario, { id });

  const cambios: Record<string, unknown> = { ...req.body.sanitizedInput };

  // el dni no se puede tocar una vez cargado, ni un admin desde este endpoint
  delete cambios.dni;

  if (cambios.password) {
    cambios.password = await bcrypt.hash(cambios.password as string, SALT_ROUNDS);
  }
  if (cambios.rol !== undefined) {
    if (req.usuario?.rol !== 'admin' || !ROLES_VALIDOS.includes(cambios.rol as string)) {
      delete cambios.rol; // el rol solo lo cambia un admin, y a un valor valido
    }
  }
  if (cambios.email !== undefined && cambios.email !== usuarioToUpdate.email) {
    const existente = await em.findOne(Usuario, { email: cambios.email as string });
    if (existente) {
      throw new ConflictError('Ya existe un usuario con ese email');
    }
  }

  em.assign(usuarioToUpdate, cambios);
  await em.flush();
  res.status(200).json({ message: 'usuario updated', data: ocultarPassword(usuarioToUpdate) });
}

async function remove(req: Request, res: Response) {
  const id = parsearIdNumerico(req.params.id);
  const usuario = await em.findOneOrFail(Usuario, { id });
  await em.removeAndFlush(usuario);
  res.status(200).json({ message: 'usuario eliminado' });
}

export { sanitizeusuarioInput, validarUsuarioCreacion, findAll, findOne, add, update, remove };
