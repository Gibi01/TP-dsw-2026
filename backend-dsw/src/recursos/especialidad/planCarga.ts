import { catalogoEspecialidades } from './catalogo.js';

const normalizar = (valor: string) => valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLowerCase();

export function planCarga(existentes: { idEspecialidad: number; descripcionEsp: string; icono: string }[]) {
  return catalogoEspecialidades.map(opcion => {
    const nombres = [opcion.nombre, ...opcion.alias].map(normalizar);
    const coincidencias = existentes.filter(item => nombres.includes(normalizar(item.descripcionEsp)));
    if (coincidencias.length > 1) throw new Error(`Especialidad duplicada: ${opcion.nombre}. Resolver antes de cargar.`);
    const existente = coincidencias[0];
    return { opcion, existente, accion: !existente ? 'crear' : existente.icono === 'medicina' ? 'actualizar' : 'conservar' };
  });
}
