// test de integracion, cubre todo el circuito de doctor-como-usuario, agenda propia,
// reserva de turno y los 4 estados (pendiente/asistido/no_asistido/cancelado).
// mismo approach que especialidad.integration.test.ts (importa desde dist/, ver ese archivo
// para el porque), y necesita mysql real levantado
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

process.env.NODE_ENV = 'test';

const { app } = await import('../../../dist/app.js');
const { orm } = await import('../../../dist/shared/orm.js');
const { Especialidad } = await import('../../../dist/recursos/especialidad/especialidad.entidad.js');
const { Doctor } = await import('../../../dist/recursos/doctor/doctor.entidad.js');
const { Usuario } = await import('../../../dist/recursos/usuarios/usuario.entidad.js');
const { Agenda } = await import('../../../dist/recursos/agenda/agenda.entidad.js');
const { Turno } = await import('../../../dist/recursos/turno/turno.entidad.js');

const sufijo = Date.now();
const MATRICULA = 900000 + (sufijo % 1000);
const EMAIL_DOCTOR = `doctor.test.${sufijo}@example.com`;
const EMAIL_PACIENTE = `paciente.test.${sufijo}@example.com`;

const tokenAdmin = jwt.sign({ id: 1, rol: 'admin' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

function fechaManana(): { fecha: string; diaSemana: number } {
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const anio = manana.getFullYear();
  const mes = String(manana.getMonth() + 1).padStart(2, '0');
  const dia = String(manana.getDate()).padStart(2, '0');
  return { fecha: `${anio}-${mes}-${dia}`, diaSemana: manana.getDay() };
}

let idEspecialidad: number;
let tokenDoctor: string;
let tokenPaciente: string;
let agendaId: number;
let turnoAsistidoId: number;
let turnoNoAsistidoId: number;

async function limpiar() {
  const em = orm.em.fork();
  await em.nativeDelete(Turno, { doctor: MATRICULA });
  await em.nativeDelete(Agenda, { doctor: MATRICULA });
  await em.nativeDelete(Doctor, { matricula: MATRICULA });
  await em.nativeDelete(Usuario, { email: { $in: [EMAIL_DOCTOR, EMAIL_PACIENTE] } });
  await em.nativeDelete(Especialidad, { descripcionEsp: `Especialidad test ${sufijo}` });
}

beforeAll(limpiar);
afterAll(async () => {
  await limpiar();
  await orm.close();
});

describe('Doctor como usuario + estados de turno', () => {
  it('un admin crea la especialidad y el doctor (con cuenta propia)', async () => {
    const resEsp = await request(app)
      .post('/api/especialidades')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ descripcionEsp: `Especialidad test ${sufijo}` });
    expect(resEsp.status).toBe(201);
    idEspecialidad = resEsp.body.data.idEspecialidad;

    const resDoctor = await request(app)
      .post('/api/doctores')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        matricula: MATRICULA,
        nombre: 'Raiden',
        apellido: 'Test',
        email: EMAIL_DOCTOR,
        password: '123456',
        dni: `DOC${sufijo}`,
        especialidadIds: [idEspecialidad],
      });
    expect(resDoctor.status).toBe(201);
    expect(resDoctor.body.data.activo).toBe(true);
    expect(resDoctor.body.data.password).toBeUndefined();
  });

  it('el doctor puede loguearse con la cuenta creada', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL_DOCTOR, password: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.data.usuario.rol).toBe('doctor');
    tokenDoctor = res.body.data.token;
  });

  it('el doctor puede crear su propia agenda, pero no la de otro doctor', async () => {
    const { diaSemana } = fechaManana();
    const resPropia = await request(app)
      .post('/api/agendas')
      .set('Authorization', `Bearer ${tokenDoctor}`)
      .send({ doctorId: MATRICULA, diaSemana, horaInicio: '08:00', horaFin: '12:00', duracionTurnoMinutos: 30 });
    expect(resPropia.status).toBe(201);
    agendaId = resPropia.body.data.id;

    const resAjena = await request(app)
      .post('/api/agendas')
      .set('Authorization', `Bearer ${tokenDoctor}`)
      .send({ doctorId: MATRICULA + 1, diaSemana, horaInicio: '08:00', horaFin: '12:00', duracionTurnoMinutos: 30 });
    expect(resAjena.status).toBe(403);
  });

  it('la disponibilidad por especialidad nunca expone al Usuario del doctor (ni anidado)', async () => {
    const { fecha } = fechaManana();
    const res = await request(app).get(
      `/api/turnos/disponibilidad-especialidad?especialidadId=${idEspecialidad}&fecha=${fecha}`
    );
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    const cuerpoCrudo = JSON.stringify(res.body.data);
    // nada de esto tiene que aparecer, ni el hash de la contraseña ni el dni/direccion del
    // doctor ni la coleccion inversa "doctores" de la Especialidad anidada (el bug real era que
    // el identity map de mikroorm re-serializaba el ciclo Especialidad->doctores->Usuario entero)
    expect(cuerpoCrudo).not.toContain('password');
    expect(cuerpoCrudo).not.toContain('"usuario"');
    expect(cuerpoCrudo).not.toContain('"doctores"');
    expect(res.body.data[0].doctor.especialidades[0]).toEqual({
      idEspecialidad,
      descripcionEsp: `Especialidad test ${sufijo}`,
    });
  });

  it('un paciente se registra, ve la disponibilidad y reserva dos turnos', async () => {
    const resRegistro = await request(app).post('/api/usuarios').send({
      nombre: 'Paciente',
      apellido: 'Test',
      email: EMAIL_PACIENTE,
      password: '123456',
      dni: `PAC${sufijo}`,
    });
    expect(resRegistro.status).toBe(201);

    const resLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL_PACIENTE, password: '123456' });
    expect(resLogin.status).toBe(200);
    tokenPaciente = resLogin.body.data.token;

    const { fecha } = fechaManana();
    const resDisp = await request(app).get(`/api/turnos/disponibilidad?doctorId=${MATRICULA}&fecha=${fecha}`);
    expect(resDisp.status).toBe(200);
    expect(resDisp.body.data.length).toBeGreaterThanOrEqual(2);
    const [slotA, slotB] = resDisp.body.data;

    const resTurnoA = await request(app)
      .post('/api/turnos')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .send({ doctorId: MATRICULA, fechaHoraTurno: slotA });
    expect(resTurnoA.status).toBe(201);
    expect(resTurnoA.body.data.estado).toBe('pendiente');
    turnoAsistidoId = resTurnoA.body.data.id;

    const resTurnoB = await request(app)
      .post('/api/turnos')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .send({ doctorId: MATRICULA, fechaHoraTurno: slotB });
    expect(resTurnoB.status).toBe(201);
    turnoNoAsistidoId = resTurnoB.body.data.id;
  });

  it('el doctor ve en "atiendo" los turnos pendientes con los datos del paciente', async () => {
    const res = await request(app)
      .get('/api/turnos/atiendo?estado=pendiente')
      .set('Authorization', `Bearer ${tokenDoctor}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    const turno = res.body.data.find((t: any) => t.id === turnoAsistidoId);
    expect(turno.paciente.email).toBe(EMAIL_PACIENTE);
    expect(turno.paciente.password).toBeUndefined();
  });

  it('el doctor marca un turno como asistido, y ya no se puede cancelar ni re-marcar', async () => {
    const res = await request(app)
      .patch(`/api/turnos/${turnoAsistidoId}/asistio`)
      .set('Authorization', `Bearer ${tokenDoctor}`);
    expect(res.status).toBe(200);
    expect(res.body.data.estado).toBe('asistido');

    const resCancelar = await request(app)
      .patch(`/api/turnos/${turnoAsistidoId}/cancelar`)
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .send({ motivoCancelacion: 'ya no hace falta' });
    expect(resCancelar.status).toBe(409);

    const resReAsistido = await request(app)
      .patch(`/api/turnos/${turnoAsistidoId}/asistio`)
      .set('Authorization', `Bearer ${tokenDoctor}`);
    expect(resReAsistido.status).toBe(409);
  });

  it('el doctor marca manualmente un turno como no asistido', async () => {
    const res = await request(app)
      .patch(`/api/turnos/${turnoNoAsistidoId}/no-asistio`)
      .set('Authorization', `Bearer ${tokenDoctor}`);
    expect(res.status).toBe(200);
    expect(res.body.data.estado).toBe('no_asistido');
  });

  it('un paciente no puede marcar turnos como asistidos (no es doctor)', async () => {
    const res = await request(app)
      .patch(`/api/turnos/${turnoNoAsistidoId}/asistio`)
      .set('Authorization', `Bearer ${tokenPaciente}`);
    expect(res.status).toBe(403);
  });

  it('la especialidad lista al doctor activo sin exponer su cuenta', async () => {
    const res = await request(app).get(`/api/especialidades/${idEspecialidad}`);
    expect(res.status).toBe(200);
    const doctor = res.body.data.doctores.find((d: any) => d.matricula === MATRICULA);
    expect(doctor).toBeDefined();
    expect(doctor.password).toBeUndefined();
  });

  it('un admin da de baja al doctor: deja de ofrecerse como opción, sin borrarse', async () => {
    const resBaja = await request(app)
      .delete(`/api/doctores/${MATRICULA}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(resBaja.status).toBe(200);

    const resListaPublica = await request(app).get('/api/doctores');
    expect(resListaPublica.body.data.some((d: any) => d.matricula === MATRICULA)).toBe(false);

    const resListaAdmin = await request(app)
      .get('/api/doctores')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    const doctorDadoDeBaja = resListaAdmin.body.data.find((d: any) => d.matricula === MATRICULA);
    expect(doctorDadoDeBaja).toBeDefined();
    expect(doctorDadoDeBaja.activo).toBe(false);

    const resFicha = await request(app).get(`/api/doctores/${MATRICULA}`);
    expect(resFicha.status).toBe(404);

    const { fecha } = fechaManana();
    const resDisp = await request(app).get(`/api/turnos/disponibilidad?doctorId=${MATRICULA}&fecha=${fecha}`);
    expect(resDisp.status).toBe(404);

    const resEsp = await request(app).get(`/api/especialidades/${idEspecialidad}`);
    expect(resEsp.body.data.doctores.some((d: any) => d.matricula === MATRICULA)).toBe(false);

    // los turnos ya reservados con este doctor siguen existiendo, no se borran
    const turnoSigueExistiendo = await orm.em.fork().findOne(Turno, { id: turnoAsistidoId });
    expect(turnoSigueExistiendo).not.toBeNull();
  });
});
