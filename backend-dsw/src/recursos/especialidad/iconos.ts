import { BadRequestError } from '../../shared/errores.js';
import { catalogoEspecialidades } from './catalogo.js';

// Identificadores públicos compartidos con el catálogo visual del frontend.
export const ICONOS_ESPECIALIDAD = ['medicina', ...catalogoEspecialidades.map(item => item.id)];

export function validarIconoEspecialidad(valor: unknown): void {
  if (valor === undefined) return;
  if (typeof valor !== 'string' || !ICONOS_ESPECIALIDAD.some(icono => icono === valor)) {
    throw new BadRequestError('Seleccioná un icono válido del catálogo de especialidades.');
  }
}
