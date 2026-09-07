// test de integracion, necesita mysql levantado (mismo que usa pnpm dev)
// importamos desde dist/ y no desde los .ts porque mikroorm hace un import() de las entidades
// en runtime y en windows tira error de ESM si son .ts crudos. por eso "pretest" compila antes
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

process.env.NODE_ENV = 'test';

const { app } = await import('../../../dist/app.js');
const { orm } = await import('../../../dist/shared/orm.js');
const { Especialidad } = await import('../../../dist/recursos/especialidad/especialidad.entidad.js');

const especialidadDeTest = { idEspecialidad: 9001, descripcionEsp: 'Especialidad de test' };

beforeAll(async () => { // no deberia haber 9000 especialidades pero por las dudas limpio
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
