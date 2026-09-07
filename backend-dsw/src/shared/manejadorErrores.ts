import { Request, Response, NextFunction } from 'express';
import { NotFoundError as OrmNotFoundError, ValidationError as OrmValidationError } from '@mikro-orm/core';
import { ErrorApi } from './errores.js';

// manejador de errores global, tiene que ir al final de todo (despues del catch-all de ruta no encontrada)
export function manejadorErrores(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ErrorApi) {
    return res.status(err.status).json({ message: err.message });
  }

  if (err instanceof OrmNotFoundError) {
    return res.status(404).json({ message: 'Recurso no encontrado' });
  }

  if (err instanceof OrmValidationError) {
    return res.status(400).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: 'Error interno del servidor' });
}

export function rutaNoEncontrada(req: Request, res: Response) {
  res.status(404).json({ message: `No existe la ruta ${req.method} ${req.originalUrl}` });
}
