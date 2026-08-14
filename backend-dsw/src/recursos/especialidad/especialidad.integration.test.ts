// Test de integración: ejercita ruta -> controlador -> ORM -> base de datos real.
// Requiere la misma base MySQL que usa "pnpm dev" (ver .env / .env.example) levantada y accesible.
//
// Importa desde dist/ (compilado) en vez de los .ts fuente: el discovery de entidades de
// MikroORM hace un import() en runtime de cada entidad, y ese import puntual no pasa por el
// transformer de vitest. Contra .ts crudo eso rompe en Windows con un error de ESM al no poder
// resolver la extensión; contra .js ya compilado (lo que corre "pnpm dev" en producción) funciona
// igual que en la app real. El script "pretest" (ver package.json) corre "pnpm build" antes de
// esto para asegurar que dist/ esté actualizado.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

process.env.NODE_ENV = 'test';

const { app } = await import('../../../dist/app.js');
const { orm } = await import('../../../dist/shared/orm.js');
const { Especialidad } = await import('../../../dist/recursos/especialidad/especialidad.entidad.js');

const especialidadDeTest = { idEspecialidad: 9001, descripcionEsp: 'Especialidad de test' };

beforeAll(async () => {
  await orm.em.fork().nativeDelete(Especialidad, { idEspecialidad: especialidadDeTest.idEspecialidad });
});

afterAll(async () => {
  await orm.em.fork().nativeDelete(Especialidad, { idEspecialidad: especialidadDeTest.idEspecialidad });
  await orm.close();
});

describe('API /api/especialidades', () => {
  it('GET /api/especialidades responde 200 con un arreglo', async () => {
    const res = await request(app).get('/api/especialidades');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/especialidades sin token responde 401', async () => {
    const res = await request(app).post('/api/especialidades').send(especialidadDeTest);
    expect(res.status).toBe(401);
  });

  it('GET /api/especialidades/:id responde 404 para un id inexistente', async () => {
    const res = await request(app).get('/api/especialidades/999999');
    expect(res.status).toBe(404);
  });
});
