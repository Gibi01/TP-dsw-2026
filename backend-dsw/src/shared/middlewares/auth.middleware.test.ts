import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ getSession: vi.fn(), findOne: vi.fn() }));
vi.mock('../auth.js', () => ({ auth: { api: { getSession: mocks.getSession } } }));
vi.mock('../orm.js', () => ({ orm: { em: { findOne: mocks.findOne } } }));
vi.mock('../config.js', () => ({ config: { auth: { origin: 'http://localhost:5173' } } }));
import { verificarSesion, autorizarRoles } from './auth.middleware.js';
import { UnauthorizedError, ForbiddenError } from '../errores.js';

beforeEach(() => vi.resetAllMocks());

describe('verificarSesion', () => {
  it('rechaza una sesión ausente o vencida', async () => {
    mocks.getSession.mockResolvedValue(null);
    await expect(verificarSesion({ headers: {} } as any, {} as any, vi.fn())).rejects.toThrow(UnauthorizedError);
  });
  it('rechaza una cuenta sin perfil', async () => {
    mocks.getSession.mockResolvedValue({ user: { id: 'cuenta', role: 'paciente' } });
    mocks.findOne.mockResolvedValue(null);
    await expect(verificarSesion({ headers: {} } as any, {} as any, vi.fn())).rejects.toThrow(UnauthorizedError);
  });
  it('usa el rol de Better Auth y el id del perfil para conservar los controles de propiedad', async () => {
    mocks.getSession.mockResolvedValue({ user: { id: 'cuenta', role: 'paciente' } });
    mocks.findOne.mockResolvedValue({ id: 7, rol: 'admin' });
    const req = { headers: {}, usuario: undefined } as any;
    const next = vi.fn();
    await verificarSesion(req, {} as any, next);
    expect(req.usuario).toEqual({ id: 7, rol: 'paciente' });
    expect(next).toHaveBeenCalledOnce();
  });
});

describe('autorizarRoles', () => {
  it('permite un rol autorizado', () => {
    const next = vi.fn();
    autorizarRoles('admin')({ usuario: { id: 1, rol: 'admin' } } as any, {} as any, next);
    expect(next).toHaveBeenCalledOnce();
  });
  it('rechaza un rol diferente', () => {
    expect(() => autorizarRoles('admin')({ usuario: { id: 1, rol: 'paciente' } } as any, {} as any, vi.fn())).toThrow(ForbiddenError);
  });
});
