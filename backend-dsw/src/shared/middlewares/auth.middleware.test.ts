import { describe, expect, it, vi } from 'vitest';

process.env.JWT_SECRET ??= 'secreto-de-test';
process.env.DB_HOST ??= 'localhost';
process.env.DB_NAME ??= 'test';
process.env.DB_USER ??= 'test';
process.env.DB_PASSWORD ??= 'test';

const { verificarToken, autorizarRoles } = await import('./auth.middleware.js');
const { UnauthorizedError, ForbiddenError } = await import('../errores.js');
const jwt = (await import('jsonwebtoken')).default;

function crearRequest(authorization?: string) {
  return { headers: { authorization }, usuario: undefined } as any;
}

describe('verificarToken', () => {
  it('lanza UnauthorizedError si no hay header Authorization', () => {
    const req = crearRequest(undefined);
    expect(() => verificarToken(req, {} as any, vi.fn())).toThrow(UnauthorizedError);
  });

  it('lanza UnauthorizedError si el token es inválido', () => {
    const req = crearRequest('Bearer token-invalido');
    expect(() => verificarToken(req, {} as any, vi.fn())).toThrow(UnauthorizedError);
  });

  it('asigna req.usuario y llama a next cuando el token es válido', () => {
    const token = jwt.sign({ id: 1, rol: 'admin' }, process.env.JWT_SECRET as string);
    const req = crearRequest(`Bearer ${token}`);
    const next = vi.fn();

    verificarToken(req, {} as any, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.usuario).toMatchObject({ id: 1, rol: 'admin' });
  });
});

describe('autorizarRoles', () => {
  it('deja pasar si el usuario tiene uno de los roles permitidos', () => {
    const req = { usuario: { id: 1, rol: 'admin' } } as any;
    const next = vi.fn();

    autorizarRoles('admin', 'paciente')(req, {} as any, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('lanza ForbiddenError si el rol no está permitido', () => {
    const req = { usuario: { id: 1, rol: 'paciente' } } as any;

    expect(() => autorizarRoles('admin')(req, {} as any, vi.fn())).toThrow(ForbiddenError);
  });
});
