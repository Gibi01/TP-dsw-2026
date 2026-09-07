import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { UnauthorizedError, ForbiddenError } from '../errores.js';

export interface JwtPayload {
  id: number;
  rol: string;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: JwtPayload;
    }
  }
}

export function verificarToken(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token no provisto');
  }

  const token = header.slice('Bearer '.length);
  try {
    req.usuario = jwt.verify(token, config.jwt.secret) as JwtPayload;
    next();
  } catch {
    throw new UnauthorizedError('Token inválido o expirado');
  }
}

// version de verificarToken que no explota si no hay token, total no asigna req.usuario y listo.
// la uso en rutas publicas que cambian un poco si sos admin (ej el listado de doctores)
export function intentarVerificarToken(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      req.usuario = jwt.verify(header.slice('Bearer '.length), config.jwt.secret) as JwtPayload;
    } catch {
      // token invalido o vencido, no importa, seguimos como si no hubiera token
    }
  }
  next();
}

// chequea que req.usuario tenga alguno de estos roles, siempre va despues de verificarToken
export function autorizarRoles(...rolesPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      throw new UnauthorizedError();
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      throw new ForbiddenError();
    }
    next();
  };
}
