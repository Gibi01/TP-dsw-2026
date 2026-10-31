import { afterAll, beforeAll, expect, it } from 'vitest';
import request from 'supertest';

process.env.NODE_ENV = 'test';
const { app } = await import('../../../dist/app.js');
const { orm } = await import('../../../dist/shared/orm.js');
const { auth, authPool } = await import('../../../dist/shared/auth.js');
const { Usuario } = await import('../../../dist/recursos/usuarios/usuario.entidad.js');
const email = `listado.${Date.now()}@example.com`;

let cookie: string;

beforeAll(async () => {
  await auth.api.createUser({ body: { email, password: 'test-iconos-123', name: 'Admin', role: 'admin', data: { apellido: 'Iconos', dni: 'ICONOS' } } });
  const res = await request(app).post('/api/auth/sign-in/email').send({ email, password: 'test-iconos-123' });
  expect(res.status).toBe(200);
  cookie = res.headers['set-cookie'][0].split(';')[0];
});

afterAll(async () => {
  const em = orm.em.fork();
  const usuario = await em.findOne(Usuario, { email });
  if (usuario) {
    for (const tabla of ['auth_session', 'auth_account']) await authPool.execute(`DELETE FROM ${tabla} WHERE userId = ?`, [usuario.authUserId]);
    await authPool.execute('DELETE FROM auth_user WHERE id = ?', [usuario.authUserId]);
    await em.removeAndFlush(usuario);
  }
  await authPool.end();
  await orm.close();
});


it('protege el listado y devuelve fecha de alta y estado sin credenciales', async () => {
  await request(app).get('/api/usuarios/listado').expect(401);
  const res = await request(app).get('/api/usuarios/listado').set('Cookie', cookie).expect(200);
  const usuario = res.body.data.find((u: { email: string }) => u.email === email);
  expect(usuario).toMatchObject({ rol: 'admin', activo: true });
  expect(Number.isNaN(Date.parse(usuario.fechaAlta))).toBe(false);
  expect(Object.keys(usuario).sort()).toEqual(['id','nombre','apellido','email','rol','activo','fechaAlta'].sort());
});

it('incluye médicos dados de baja', async () => {
  const { Doctor } = await import('../../../dist/recursos/doctor/doctor.entidad.js');
  const em = orm.em.fork();
  const usuario = await em.findOneOrFail(Usuario, { email });
  const doctor = em.create(Doctor, { matricula: 990000 + Math.floor(Math.random()*9000), usuario, activo: false });
  try {
    await em.persistAndFlush(doctor);
    const res = await request(app).get('/api/usuarios/listado').set('Cookie', cookie).expect(200);
    expect(res.body.data.find((u: { email: string }) => u.email === email).activo).toBe(false);
  } finally {
    await em.nativeDelete(Doctor, { matricula: doctor.matricula });
  }
});

it('deniega el listado a pacientes y médicos', async () => {
  const usuario = await orm.em.fork().findOneOrFail(Usuario, { email });
  try {
    for (const rol of ['paciente', 'doctor']) {
      await authPool.execute('UPDATE auth_user SET role = ? WHERE id = ?', [rol, usuario.authUserId]);
      await request(app).get('/api/usuarios/listado').set('Cookie', cookie).expect(403);
    }
  } finally {
    await authPool.execute('UPDATE auth_user SET role = ? WHERE id = ?', ['admin', usuario.authUserId]);
  }
});

it('incluye cuentas bloqueadas y considera los bloqueos vencidos activos', async () => {
  const cuenta = await auth.api.createUser({ body: { email: `bloqueado.${email}`, password: 'test-listado-123', name: 'Paciente', role: 'paciente', data: { apellido: 'Listado', dni: 'LISTADO' } } });
  try {
    await authPool.execute('UPDATE auth_user SET banned = 1, banExpires = NULL WHERE id = ?', [cuenta.user.id]);
    let res = await request(app).get('/api/usuarios/listado').set('Cookie', cookie).expect(200);
    expect(res.body.data.find((u: { email: string }) => u.email === cuenta.user.email)).toMatchObject({ activo: false, rol: 'paciente' });
    await authPool.execute('UPDATE auth_user SET banExpires = ? WHERE id = ?', [new Date('2020-01-01'), cuenta.user.id]);
    res = await request(app).get('/api/usuarios/listado').set('Cookie', cookie).expect(200);
    expect(res.body.data.find((u: { email: string }) => u.email === cuenta.user.email).activo).toBe(true);
  } finally {
    for (const tabla of ['auth_session', 'auth_account']) await authPool.execute(`DELETE FROM ${tabla} WHERE userId = ?`, [cuenta.user.id]);
    await authPool.execute('DELETE FROM auth_user WHERE id = ?', [cuenta.user.id]);
    await orm.em.fork().nativeDelete(Usuario, { authUserId: cuenta.user.id });
  }
});
