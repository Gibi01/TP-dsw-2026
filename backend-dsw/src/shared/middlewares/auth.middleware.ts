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

// Requiere que req.usuario tenga uno de los roles indicados. Usar siempre después de verificarToken.
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
