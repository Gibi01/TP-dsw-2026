import { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth.js';
import { orm } from '../orm.js';
import { config } from '../config.js';
import { Usuario } from '../../recursos/usuarios/usuario.entidad.js';
import { UnauthorizedError, ForbiddenError } from '../errores.js';

declare global {
  namespace Express {
    interface Request { usuario?: { id: number; rol: string } }
  }
}

async function cargarSesion(req: Request) {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const origin = req.headers.origin;
    if ((origin && origin !== config.auth.origin) || req.headers['sec-fetch-site'] === 'cross-site') {
      throw new ForbiddenError('Origen de la solicitud no permitido');
    }
  }
  const sesion = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!sesion) return;
  const perfil = await orm.em.findOne(Usuario, { authUserId: sesion.user.id });
  if (!perfil) throw new UnauthorizedError('La cuenta no tiene un perfil asociado');
  req.usuario = { id: perfil.id, rol: sesion.user.role ?? 'paciente' };
}

export async function verificarSesion(req: Request, res: Response, next: NextFunction) {
  await cargarSesion(req);
  if (!req.usuario) throw new UnauthorizedError('Sesión inválida o expirada');
  next();
}

export async function intentarVerificarSesion(req: Request, res: Response, next: NextFunction) {
  await cargarSesion(req);
  next();
}

export function autorizarRoles(...rolesPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) throw new UnauthorizedError();
    if (!rolesPermitidos.includes(req.usuario.rol)) throw new ForbiddenError();
    next();
  };
}
