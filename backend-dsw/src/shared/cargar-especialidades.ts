import { orm } from './orm.js';
import { Especialidad } from '../recursos/especialidad/especialidad.entidad.js';
import { planCarga } from '../recursos/especialidad/planCarga.js';

// Carga aditiva: conserva nombres, ids, relaciones y elecciones personalizadas del administrador.
try {
  await orm.em.fork().transactional(async em => {
    const existentes = await em.find(Especialidad, {});
    const plan = planCarga(existentes);
    for (const { opcion, existente, accion } of plan) {
      if (accion === 'crear') {
        const nueva = new Especialidad();
        nueva.descripcionEsp = opcion.nombre;
        nueva.icono = opcion.id;
        em.persist(nueva);
      } else if (accion === 'actualizar' && existente) {
        const entidad = existentes.find(item => item.idEspecialidad === existente.idEspecialidad)!;
        entidad.icono = opcion.id;
      }
    }
    await em.flush();
    console.log(JSON.stringify({ creadas: plan.filter(x => x.accion === 'crear').length,
      iconosActualizados: plan.filter(x => x.accion === 'actualizar').length,
      conservadas: plan.filter(x => x.accion === 'conservar').length }));
  });
} finally {
  await orm.close();
}
