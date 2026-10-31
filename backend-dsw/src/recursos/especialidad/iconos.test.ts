import { describe, expect, it } from 'vitest';
import { validarIconoEspecialidad } from './iconos.js';

describe('icono de especialidad', () => {
  it('permite omitirlo en clientes anteriores y actualizaciones parciales', () => {
    expect(() => validarIconoEspecialidad(undefined)).not.toThrow();
  });
  it('acepta las opciones del catálogo', () => {
    for (const icono of ['medicina', 'corazon', 'cerebro', 'hueso', 'ojo', 'piel', 'pediatria', 'odontologia']) {
      expect(() => validarIconoEspecialidad(icono)).not.toThrow();
    }
  });
  it.each([null, '', 'https://imagen.com/a.svg', 'inventado', 3, {}, ['corazon']])('rechaza valores fuera del catálogo: %j', (valor) => {
    expect(() => validarIconoEspecialidad(valor)).toThrow('Seleccioná un icono válido');
  });
});
