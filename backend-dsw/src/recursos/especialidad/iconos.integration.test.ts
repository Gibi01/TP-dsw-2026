import { afterAll, beforeAll, expect, it } from 'vitest';
import request from 'supertest';

process.env.NODE_ENV = 'test';
const { app } = await import('../../../dist/app.js');
const { orm } = await import('../../../dist/shared/orm.js');
const { auth, authPool } = await import('../../../dist/shared/auth.js');
const { Especialidad } = await import('../../../dist/recursos/especialidad/especialidad.entidad.js');
const { Usuario } = await import('../../../dist/recursos/usuarios/usuario.entidad.js');
const email = `iconos.${Date.now()}@example.com`;
const ids: number[] = [];
let cookie: string;

beforeAll(async () => {
  await auth.api.createUser({ body: { email, password: 'test-iconos-123', name: 'Admin', role: 'admin', data: { apellido: 'Iconos', dni: 'ICONOS' } } });
  const res = await request(app).post('/api/auth/sign-in/email').send({ email, password: 'test-iconos-123' });
  expect(res.status).toBe(200);
  cookie = res.headers['set-cookie'][0].split(';')[0];
});

afterAll(async () => {
  const em = orm.em.fork();
  if (ids.length) await em.nativeDelete(Especialidad, { idEspecialidad: { $in: ids } });
  const usuario = await em.findOne(Usuario, { email });
  if (usuario) {
    for (const tabla of ['auth_session', 'auth_account']) await authPool.execute(`DELETE FROM ${tabla} WHERE userId = ?`, [usuario.authUserId]);
    await authPool.execute('DELETE FROM auth_user WHERE id = ?', [usuario.authUserId]);
    await em.removeAndFlush(usuario);
  }
  await authPool.end();
  await orm.close();
});

it('persiste el icono, lo devuelve al listar y al consultar, y lo conserva al editar solo el nombre', async () => {
  const creada = await request(app).post('/api/especialidades').set('Cookie', cookie)
    .send({ descripcionEsp: 'Prueba icono', icono: 'corazon' });
  expect(creada.status).toBe(201);
  const id = creada.body.data.idEspecialidad;
  ids.push(id);
  expect(creada.body.data.icono).toBe('corazon');
  const editada = await request(app).patch(`/api/especialidades/${id}`).set('Cookie', cookie).send({ icono: 'ojo' });
  expect(editada.status).toBe(200);
  await request(app).patch(`/api/especialidades/${id}`).set('Cookie', cookie).send({ descripcionEsp: 'Prueba renombrada' }).expect(200);
  const detalle = await request(app).get(`/api/especialidades/${id}`).expect(200);
  expect(detalle.body.data).toMatchObject({ descripcionEsp: 'Prueba renombrada', icono: 'ojo' });
  const lista = await request(app).get('/api/especialidades').expect(200);
  expect(lista.body.data.find((esp: { idEspecialidad: number }) => esp.idEspecialidad === id).icono).toBe('ojo');
  await request(app).patch(`/api/especialidades/${id}`).set('Cookie', cookie).send({ icono: 'no-existe' }).expect(400);
  const guardada = await orm.em.fork().findOneOrFail(Especialidad, { idEspecialidad: id });
  expect(guardada.icono).toBe('ojo');
});

it('usa el icono médico si el cliente no envía una elección', async () => {
  const res = await request(app).post('/api/especialidades').set('Cookie', cookie).send({ descripcionEsp: 'Prueba sin icono' });
  expect(res.status).toBe(201);
  ids.push(res.body.data.idEspecialidad);
  expect(res.body.data.icono).toBe('medicina');
});

it('lista solo especialidades con médicos activos, sin exigir agenda, y conserva el catálogo completo', async () => {
  const { Doctor } = await import('../../../dist/recursos/doctor/doctor.entidad.js');
  const em = orm.em.fork();
  const especialidad = em.create(Especialidad, { descripcionEsp: 'Prueba visibilidad médico activo' });
  await em.persistAndFlush(especialidad);
  ids.push(especialidad.idEspecialidad);
  const id = especialidad.idEspecialidad;
  const aparece = async () => {
    const res = await request(app).get('/api/especialidades?conMedicosActivos=true').expect(200);
    return res.body.data.filter((esp: { idEspecialidad: number }) => esp.idEspecialidad === id).length;
  };
  let doctor: InstanceType<typeof Doctor> | undefined;
  try {
    expect(await aparece()).toBe(0);
    doctor = em.create(Doctor, { matricula: 980000 + Math.floor(Math.random() * 10000),
      usuario: await em.findOneOrFail(Usuario, { email }), activo: true, especialidades: [especialidad] });
    await em.persistAndFlush(doctor);
    expect(await aparece()).toBe(1);
    doctor.activo = false;
    await em.flush();
    expect(await aparece()).toBe(0);
    const todas = await request(app).get('/api/especialidades').expect(200);
    expect(todas.body.data.some((esp: { idEspecialidad: number }) => esp.idEspecialidad === id)).toBe(true);
    doctor.activo = true;
    await em.flush();
    expect(await aparece()).toBe(1);
    doctor.especialidades.remove(especialidad);
    await em.flush();
    expect(await aparece()).toBe(0);
  } finally {
    if (doctor) await em.nativeDelete(Doctor, { matricula: doctor.matricula });
  }
});
