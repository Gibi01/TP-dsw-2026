import { expect, it } from 'vitest';
import { planCarga } from './planCarga.js';
import { catalogoEspecialidades } from './catalogo.js';
import { validarIconoEspecialidad } from './iconos.js';

it('contiene 50 especialidades con identificadores válidos y únicos', () => {
  expect(catalogoEspecialidades).toHaveLength(50);
  expect(new Set(catalogoEspecialidades.map(x => x.id)).size).toBe(50);
  for (const item of catalogoEspecialidades) {
    expect(item.id.length).toBeLessThanOrEqual(32);
    expect(() => validarIconoEspecialidad(item.id)).not.toThrow();
  }
});
it('reconoce alias y acentos sin duplicar ni modificar especialidades ajenas', () => {
  const plan = planCarga([{ idEspecialidad: 3, descripcionEsp: ' traumatologia ', icono: 'medicina' },
    { idEspecialidad: 4, descripcionEsp: 'Cardiologia', icono: 'ojo' },
    { idEspecialidad: 13, descripcionEsp: 'Revengance', icono: 'medicina' }]);
  expect(plan.filter(x => x.accion === 'crear')).toHaveLength(48);
  expect(plan.find(x => x.opcion.id === 'hueso')?.existente?.idEspecialidad).toBe(3);
  expect(plan.find(x => x.opcion.id === 'corazon')?.accion).toBe('conservar');
});
it('una segunda carga no crea ni actualiza registros', () => {
  const existentes = catalogoEspecialidades.map((x, i) => ({ idEspecialidad: i + 1, descripcionEsp: x.nombre, icono: x.id }));
  expect(planCarga(existentes).every(x => x.accion === 'conservar')).toBe(true);
});
it('rechaza coincidencias ambiguas antes de escribir', () => {
  expect(() => planCarga(['Traumatología', 'Traumatología y ortopedia'].map((nombre, i) => ({ idEspecialidad: i, descripcionEsp: nombre, icono: 'medicina' })))).toThrow('duplicada');
});
