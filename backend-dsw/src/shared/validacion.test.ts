import { describe, expect, it } from 'vitest';
import { limpiarInput, validarCamposRequeridos, parsearIdNumerico } from './validacion.js';
import { BadRequestError } from './errores.js';

describe('limpiarInput', () => {
  it('conserva solo los campos permitidos y descarta undefined', () => {
    const resultado = limpiarInput(
      { nombre: 'Juan', apellido: undefined, extra: 'no permitido' },
      ['nombre', 'apellido']
    );
    expect(resultado).toEqual({ nombre: 'Juan' });
  });
});

describe('validarCamposRequeridos', () => {
  it('no lanza error cuando todos los campos requeridos están presentes', () => {
    expect(() =>
      validarCamposRequeridos({ nombre: 'Juan', email: 'juan@test.com' }, ['nombre', 'email'])
    ).not.toThrow();
  });

  it('lanza BadRequestError cuando falta un campo requerido', () => {
    expect(() => validarCamposRequeridos({ nombre: 'Juan' }, ['nombre', 'email'])).toThrow(
      BadRequestError
    );
  });

  it('trata string vacío como campo faltante', () => {
    expect(() => validarCamposRequeridos({ nombre: '' }, ['nombre'])).toThrow(BadRequestError);
  });
});

describe('parsearIdNumerico', () => {
  it('devuelve el número parseado para un id válido', () => {
    expect(parsearIdNumerico('42')).toBe(42);
  });

  it('lanza BadRequestError para un id no numérico', () => {
    expect(() => parsearIdNumerico('abc')).toThrow(BadRequestError);
  });
});
