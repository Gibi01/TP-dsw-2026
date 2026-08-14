import { describe, expect, it } from 'vitest';
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from './errores.js';

describe('clases de error de la API', () => {
  it.each([
    [BadRequestError, 400],
    [UnauthorizedError, 401],
    [ForbiddenError, 403],
    [NotFoundError, 404],
    [ConflictError, 409],
  ] as const)('%s expone el status %i', (ErrorClass, status) => {
    const error = new ErrorClass();
    expect(error.status).toBe(status);
    expect(error).toBeInstanceOf(Error);
  });

  it('permite personalizar el mensaje', () => {
    const error = new NotFoundError('doctor no encontrado');
    expect(error.message).toBe('doctor no encontrado');
  });
});
