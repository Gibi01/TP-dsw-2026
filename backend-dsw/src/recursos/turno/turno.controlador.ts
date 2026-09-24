import { Request, Response, NextFunction } from 'express';
import { LockMode } from '@mikro-orm/core';
import { Turno } from './turno.entidad.js';
import { Doctor } from '../doctor/doctor.entidad.js';
import { resolverDoctorDelUsuario } from '../doctor/doctor.controlador.js';
import { Especialidad } from '../especialidad/especialidad.entidad.js';
import { Usuario } from '../usuarios/usuario.entidad.js';
import { Agenda } from '../agenda/agenda.entidad.js';
import { ObraSocial } from '../obraSocial/obraSocial.entidad.js';
import { MotivoCancelacion } from '../motivoCancelacion/motivoCancelacion.entidad.js';
import { orm } from '../../shared/orm.js';
import { limpiarInput, validarCamposRequeridos, parsearIdNumerico } from '../../shared/validacion.js';
import { BadRequestError, ForbiddenError, ConflictError, NotFoundError } from '../../shared/errores.js';
import { encolarNotificacion } from './notificacionTurno.servicio.js';

const em = orm.em;

const MINUTOS_CORTESIA_ASISTENCIA = 15;

const CAMPOS_CREACION = ['doctorId', 'fechaHoraTurno', 'obraSocialId'];
const CAMPOS_REQUERIDOS_CREACION = ['doctorId', 'fechaHoraTurno'];

// cancelar un turno no exige nada: tanto el texto libre como el motivo preestablecido
// (motivoCancelacionPreestablecidoId) son opcionales
const CAMPOS_CANCELACION = ['motivoCancelacion', 'motivoCancelacionPreestablecidoId'];

function sanitizeTurnoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = limpiarInput(req.body, CAMPOS_CREACION);
  next();
}

function validarTurnoCreacion(req: Request, res: Response, next: NextFunction) {
  validarCamposRequeridos(req.body.sanitizedInput, CAMPOS_REQUERIDOS_CREACION);
  next();
}

function sanitizeCancelacionInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = limpiarInput(req.body, CAMPOS_CANCELACION);
  next();
}

function validarFecha(fecha: unknown): string {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new BadRequestError('El parámetro fecha es obligatorio, formato YYYY-MM-DD');
  }
  return fecha;
}

function rangoDelDia(fecha: string): { inicio: Date; fin: Date } {
  return {
    inicio: new Date(`${fecha}T00:00:00`),
    fin: new Date(`${fecha}T23:59:59`),
  };
}

function minutosDesde(horaHHMM: string): number {
  const [h, m] = horaHHMM.split(':').map(Number);
  return h * 60 + m;
}

function formatoFecha(d: Date): string {
  const anio = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

// datos publicos del doctor que se embeben en un turno
function doctorPublico(doctor: Doctor) {
  const usuario = doctor.usuario;
  const especialidades = doctor.especialidades?.isInitialized() ? doctor.especialidades.getItems() : [];
  return {
    matricula: doctor.matricula,
    nombre: usuario?.nombre,
    apellido: usuario?.apellido,
    especialidades: especialidades.map((e) => ({
      idEspecialidad: e.idEspecialidad,
      descripcionEsp: e.descripcionEsp,
    })),
  };
}

// datos publicos del paciente, para que el doctor sepa con quien atiende
function pacientePublico(usuario: Usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    dni: usuario.dni ?? null,
    telefonoCelular: usuario.telefonoCelular ?? null,
  };
}

// armamos a mano la respuesta del turno, nunca mandamos la entidad completa a res.json porque
// si usuario/doctor.usuario quedaron hidratados se serializa hasta el hash de la contraseña
function serializarTurno(turno: Turno) {
  return {
    id: turno.id,
    usuarioId: typeof turno.usuario === 'object' ? turno.usuario.id : turno.usuario,
    doctor: doctorPublico(turno.doctor),
    obraSocial: turno.obraSocial ? { id: turno.obraSocial.id, nombre: turno.obraSocial.nombre } : null,
    fechaHoraEmision: turno.fechaHoraEmision,
    fechaHoraTurno: turno.fechaHoraTurno,
    estado: turno.estado,
    fechaHoraCancelacion: turno.fechaHoraCancelacion ?? null,
    motivoCancelacion: turno.motivoCancelacion ?? null,
    motivoCancelacionPreestablecido: turno.motivoCancelacionPreestablecido
      ? { id: turno.motivoCancelacionPreestablecido.id, descripcion: turno.motivoCancelacionPreestablecido.descripcion }
      : null,
  };
}

// igual que serializarTurno pero suma el paciente, la usa el doctor para ver con quien atiende
function serializarTurnoParaDoctor(turno: Turno) {
  return {
    ...serializarTurno(turno),
    paciente: pacientePublico(turno.usuario),
  };
}

// pasa a no_asistido automaticamente cualquier turno pendiente que ya supero los 15 minutos
// de cortesia desde su horario
// (ni se presento ni lo cancelo). se corre antes de cualquier lectura de turnos, y ademas
// hay un setInterval aparte (iniciarTareaNoAsistidos) para que se actualice aunque nadie consulte
async function marcarNoAsistidosVencidos(): Promise<void> {
  const limite = new Date(Date.now() - MINUTOS_CORTESIA_ASISTENCIA * 60 * 1000);
  const turnos = await orm.em.fork().find(Turno, {
    estado: 'pendiente', fechaHoraTurno: { $lt: limite },
  }, { fields: ['id'], limit: 100 });
  for (const turno of turnos) {
    await orm.em.fork().transactional(async (tx) => {
      const actual = await tx.findOne(Turno, { id: turno.id }, {
        populate: ['usuario', 'doctor', 'doctor.usuario'],
        lockMode: LockMode.PESSIMISTIC_WRITE,
      });
      if (!actual || actual.estado !== 'pendiente' || actual.fechaHoraTurno >= limite) return;
      actual.estado = 'no_asistido';
      encolarNotificacion(tx, actual, 'no_asistido');
    });
  }
}

function iniciarTareaNoAsistidos(): void {
  setInterval(() => {
    marcarNoAsistidosVencidos().catch((err) => console.error('error marcando no-asistidos', err));
  }, 5 * 60 * 1000);
}

// genera los horarios del doctor para una fecha en base a su Agenda real (los bloques
// semanales que carga el admin/doctor), no una franja fija. si no hay bloque ese dia de la
// semana, no hay horarios ese dia
async function generarSlotsDelDia(doctor: Doctor, fecha: string): Promise<Date[]> {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const diaSemana = new Date(anio, mes - 1, dia).getDay();

  const bloques = await em.find(Agenda, { doctor, diaSemana });

  const slots: Date[] = [];
  for (const bloque of bloques) {
    const inicioMinutos = minutosDesde(bloque.horaInicio);
    const finMinutos = minutosDesde(bloque.horaFin);
    for (let m = inicioMinutos; m < finMinutos; m += bloque.duracionTurnoMinutos) {
      slots.push(new Date(anio, mes - 1, dia, Math.floor(m / 60), m % 60));
    }
  }
  return slots;
}

async function slotsOcupados(doctor: Doctor, fecha: string): Promise<Set<number>> {
  const { inicio, fin } = rangoDelDia(fecha);
  const turnosDelDia = await em.find(Turno, {
    doctor,
    estado: 'pendiente',
    fechaHoraTurno: { $gte: inicio, $lte: fin },
  });
  return new Set(turnosDelDia.map((t) => t.fechaHoraTurno.getTime()));
}

// GET /api/turnos/disponibilidad?doctorId=&fecha=YYYY-MM-DD
async function disponibilidadDoctor(req: Request, res: Response) {
  const matricula = parsearIdNumerico(req.query.doctorId as string);
  const fecha = validarFecha(req.query.fecha);
  const doctor = await em.findOneOrFail(Doctor, { matricula });
  if (!doctor.activo) {
    throw new NotFoundError('Doctor no encontrado');
  }

  const [ocupados, slotsBase] = await Promise.all([
    slotsOcupados(doctor, fecha),
    generarSlotsDelDia(doctor, fecha),
  ]);
  const disponibles = slotsBase.filter((slot) => !ocupados.has(slot.getTime()));

  res.status(200).json({ message: 'horarios disponibles', data: disponibles });
}

// GET /api/turnos/disponibilidad-especialidad?especialidadId=&fecha=YYYY-MM-DD
// lista los horarios libres de esa especialidad con los doctores que atienden en cada uno.
// aca primero se elige el horario y despues el doctor
async function disponibilidadEspecialidad(req: Request, res: Response) {
  const idEspecialidad = parsearIdNumerico(req.query.especialidadId as string);
  const fecha = validarFecha(req.query.fecha);
  const especialidad = await em.findOneOrFail(
    Especialidad,
    { idEspecialidad },
    { populate: ['doctores', 'doctores.usuario', 'doctores.especialidades'] }
  );

  const disponibles: { fechaHoraTurno: Date; doctor: ReturnType<typeof doctorPublico> }[] = [];

  for (const doctor of especialidad.doctores) {
    if (!doctor.activo) continue; // si esta dado de baja no se ofrece
    const [ocupados, slotsBase] = await Promise.all([
      slotsOcupados(doctor, fecha),
      generarSlotsDelDia(doctor, fecha),
    ]);
    for (const slot of slotsBase) {
      if (!ocupados.has(slot.getTime())) {
        disponibles.push({ fechaHoraTurno: slot, doctor: doctorPublico(doctor) });
      }
    }
  }

  disponibles.sort((a, b) => a.fechaHoraTurno.getTime() - b.fechaHoraTurno.getTime());

  res.status(200).json({ message: 'turnos disponibles para la especialidad', data: disponibles });
}

function diasDelMes(anio: number, mes: number): string[] {
  const cantidadDias = new Date(anio, mes, 0).getDate();
  const dias: string[] = [];
  for (let dia = 1; dia <= cantidadDias; dia++) {
    dias.push(`${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`);
  }
  return dias;
}

function validarAnioMes(anio: unknown, mes: unknown): { anio: number; mes: number } {
  const anioNum = Number(anio);
  const mesNum = Number(mes);
  if (!Number.isInteger(anioNum) || !Number.isInteger(mesNum) || mesNum < 1 || mesNum > 12) {
    throw new BadRequestError('anio y mes son obligatorios (mes entre 1 y 12)');
  }
  return { anio: anioNum, mes: mesNum };
}

// GET /api/turnos/disponibilidad-mes?doctorId=&anio=&mes=
// para pintar el calendario: que dias del mes tienen al menos un horario libre con ese doctor
async function disponibilidadMesDoctor(req: Request, res: Response) {
  const matricula = parsearIdNumerico(req.query.doctorId as string);
  const { anio, mes } = validarAnioMes(req.query.anio, req.query.mes);
  const doctor = await em.findOneOrFail(Doctor, { matricula });
  if (!doctor.activo) {
    throw new NotFoundError('Doctor no encontrado');
  }

  const fechasConDisponibilidad: string[] = [];
  for (const fecha of diasDelMes(anio, mes)) {
    const [ocupados, slotsBase] = await Promise.all([
      slotsOcupados(doctor, fecha),
      generarSlotsDelDia(doctor, fecha),
    ]);
    if (slotsBase.some((slot) => !ocupados.has(slot.getTime()))) {
      fechasConDisponibilidad.push(fecha);
    }
  }

  res.status(200).json({ message: 'fechas con disponibilidad', data: fechasConDisponibilidad });
}

// GET /api/turnos/disponibilidad-mes-especialidad?especialidadId=&anio=&mes=
// mismo criterio que arriba pero mirando todos los doctores activos de la especialidad
async function disponibilidadMesEspecialidad(req: Request, res: Response) {
  const idEspecialidad = parsearIdNumerico(req.query.especialidadId as string);
  const { anio, mes } = validarAnioMes(req.query.anio, req.query.mes);
  const especialidad = await em.findOneOrFail(Especialidad, { idEspecialidad }, { populate: ['doctores'] });
  const doctoresActivos = especialidad.doctores.getItems().filter((d) => d.activo);

  const fechasConDisponibilidad: string[] = [];
  for (const fecha of diasDelMes(anio, mes)) {
    let hayDisponibilidad = false;
    for (const doctor of doctoresActivos) {
      const [ocupados, slotsBase] = await Promise.all([
        slotsOcupados(doctor, fecha),
        generarSlotsDelDia(doctor, fecha),
      ]);
      if (slotsBase.some((slot) => !ocupados.has(slot.getTime()))) {
        hayDisponibilidad = true;
        break;
      }
    }
    if (hayDisponibilidad) {
      fechasConDisponibilidad.push(fecha);
    }
  }

  res.status(200).json({ message: 'fechas con disponibilidad', data: fechasConDisponibilidad });
}

// POST /api/turnos, el usuario logueado reserva un turno con un doctor en un horario puntual
async function add(req: Request, res: Response) {
  const { doctorId, fechaHoraTurno, obraSocialId } = req.body.sanitizedInput as {
    doctorId: unknown;
    fechaHoraTurno: unknown;
    obraSocialId: unknown;
  };

  const matricula = parsearIdNumerico(String(doctorId));
  const fecha = new Date(fechaHoraTurno as string);
  if (Number.isNaN(fecha.getTime())) {
    throw new BadRequestError('fechaHoraTurno inválida');
  }
  if (fecha.getTime() < Date.now()) {
    throw new BadRequestError('No se puede reservar un turno en el pasado');
  }

  const doctor = await em.findOneOrFail(Doctor, { matricula }, { populate: ['usuario', 'especialidades'] });
  if (!doctor.activo) {
    throw new NotFoundError('Doctor no encontrado');
  }
  if (doctor.usuario.id === req.usuario!.id) {
    throw new ForbiddenError('No podés reservar un turno con vos mismo');
  }

  const slotsDelDia = await generarSlotsDelDia(doctor, formatoFecha(fecha));
  const esHorarioDeAgenda = slotsDelDia.some((slot) => slot.getTime() === fecha.getTime());
  if (!esHorarioDeAgenda) {
    throw new BadRequestError('Ese horario no corresponde a la agenda del doctor');
  }

  const ocupado = await em.findOne(Turno, { doctor, fechaHoraTurno: fecha, estado: 'pendiente' });
  if (ocupado) {
    throw new ConflictError('Ese horario ya no está disponible');
  }

  const usuario = await em.findOneOrFail(Usuario, { id: req.usuario!.id });
  const obraSocial =
    obraSocialId === undefined || obraSocialId === null
      ? undefined
      : await em.findOneOrFail(ObraSocial, { id: parsearIdNumerico(String(obraSocialId)) });

  const turno = em.create(Turno, {
    usuario,
    doctor,
    obraSocial,
    fechaHoraEmision: new Date(),
    fechaHoraTurno: fecha,
    estado: 'pendiente',
  });

  await em.flush();
  res.status(201).json({ message: 'turno reservado', data: serializarTurno(turno) });
}

// GET /api/turnos/mios?fecha=&especialidadId=&doctorId=, historico del usuario logueado
async function misTurnos(req: Request, res: Response) {
  await marcarNoAsistidosVencidos();

  const filtro: Record<string, unknown> = { usuario: req.usuario!.id };

  if (req.query.fecha) {
    const fecha = validarFecha(req.query.fecha);
    const { inicio, fin } = rangoDelDia(fecha);
    filtro.fechaHoraTurno = { $gte: inicio, $lte: fin };
  }
  if (req.query.doctorId) {
    filtro.doctor = parsearIdNumerico(req.query.doctorId as string);
  }
  if (req.query.especialidadId) {
    filtro.doctor = { especialidades: parsearIdNumerico(req.query.especialidadId as string) };
  }

  const turnos = await em.find(Turno, filtro, {
    populate: ['doctor', 'doctor.usuario', 'doctor.especialidades', 'obraSocial', 'motivoCancelacionPreestablecido'],
    orderBy: { fechaHoraTurno: 'desc' },
  });

  res.status(200).json({ message: 'mis turnos', data: turnos.map(serializarTurno) });
}

// GET /api/turnos/atiendo?estado=, el doctor logueado ve los turnos que tiene que atender
async function turnosQueAtiendo(req: Request, res: Response) {
  await marcarNoAsistidosVencidos();

  const doctor = await resolverDoctorDelUsuario(req.usuario!.id);
  const filtro: Record<string, unknown> = { doctor: doctor.matricula };
  if (req.query.estado) {
    filtro.estado = req.query.estado;
  }

  const turnos = await em.find(Turno, filtro, {
    populate: ['doctor', 'doctor.usuario', 'doctor.especialidades', 'usuario', 'obraSocial', 'motivoCancelacionPreestablecido'],
    orderBy: { fechaHoraTurno: 'asc' },
  });

  res.status(200).json({ message: 'turnos que atendés', data: turnos.map(serializarTurnoParaDoctor) });
}

async function findOne(req: Request, res: Response) {
  const id = parsearIdNumerico(req.params.id);
  await marcarNoAsistidosVencidos();
  // no populateamos "usuario", con la referencia (el id) alcanza para validar el dueño
  // y asi no se serializa el usuario completo con la contraseña hasheada y todo
  const turno = await em.findOneOrFail(Turno, { id }, { populate: ['doctor', 'doctor.usuario', 'doctor.especialidades', 'obraSocial', 'motivoCancelacionPreestablecido'] });

  const esDuenio = turno.usuario.id === req.usuario?.id;
  const esDoctorDelTurno =
    req.usuario?.rol === 'doctor' && (await resolverDoctorDelUsuario(req.usuario.id)).matricula === turno.doctor.matricula;
  if (req.usuario?.rol !== 'admin' && !esDuenio && !esDoctorDelTurno) {
    throw new ForbiddenError('No podés ver un turno que no es tuyo');
  }

  res.status(200).json({ message: 'turno encontrado', data: serializarTurno(turno) });
}

// PATCH /api/turnos/:id/cancelar, tanto el texto libre como el motivo preestablecido
// son opcionales
async function cancelar(req: Request, res: Response) {
  const id = parsearIdNumerico(req.params.id);
  // El usuario se carga para preparar el correo; la respuesta sigue usando serializarTurno.
  const turno = await em.findOneOrFail(Turno, { id }, { populate: ['usuario', 'doctor', 'doctor.usuario', 'doctor.especialidades', 'obraSocial', 'motivoCancelacionPreestablecido'] });

  if (req.usuario?.rol !== 'admin' && turno.usuario.id !== req.usuario?.id) {
    throw new ForbiddenError('No podés cancelar un turno que no es tuyo');
  }
  if (turno.estado !== 'pendiente') {
    throw new ConflictError('Solo se puede cancelar un turno pendiente');
  }

  const { motivoCancelacion, motivoCancelacionPreestablecidoId } = req.body.sanitizedInput as {
    motivoCancelacion?: string;
    motivoCancelacionPreestablecidoId?: unknown;
  };

  turno.estado = 'cancelado';
  turno.fechaHoraCancelacion = new Date();
  if (motivoCancelacion) {
    turno.motivoCancelacion = motivoCancelacion;
  }
  if (motivoCancelacionPreestablecidoId !== undefined) {
    const idMotivo = parsearIdNumerico(String(motivoCancelacionPreestablecidoId));
    turno.motivoCancelacionPreestablecido = await em.findOneOrFail(MotivoCancelacion, { id: idMotivo });
  }

  if (req.usuario?.id === turno.usuario.id) {
    encolarNotificacion(em, turno, 'cancelado');
  }

  await em.flush();
  res.status(200).json({ message: 'turno cancelado', data: serializarTurno(turno) });
}

async function verificarDoctorDelTurno(req: Request, turno: Turno): Promise<void> {
  const doctor = await resolverDoctorDelUsuario(req.usuario!.id);
  if (doctor.matricula !== turno.doctor.matricula) {
    throw new ForbiddenError('No podés modificar un turno que no atendés vos');
  }
}

// PATCH /api/turnos/:id/asistio, el doctor confirma que el paciente se presento
async function marcarAsistido(req: Request, res: Response) {
  const id = parsearIdNumerico(req.params.id);
  const turno = await em.findOneOrFail(Turno, { id }, { populate: ['doctor', 'doctor.usuario', 'doctor.especialidades', 'usuario'] });
  await verificarDoctorDelTurno(req, turno);

  if (turno.estado !== 'pendiente') {
    throw new ConflictError('Solo se puede marcar como asistido un turno pendiente');
  }

  const ahora = new Date();
  const limiteAsistencia = new Date(
    turno.fechaHoraTurno.getTime() + MINUTOS_CORTESIA_ASISTENCIA * 60 * 1000
  );
  if (ahora < turno.fechaHoraTurno || ahora > limiteAsistencia) {
    throw new ConflictError(
      'Solo se puede marcar asistencia desde el horario del turno y durante los 15 minutos posteriores'
    );
  }

  turno.estado = 'asistido';
  encolarNotificacion(em, turno, 'asistido');
  await em.flush();
  res.status(200).json({ message: 'turno marcado como asistido', data: serializarTurnoParaDoctor(turno) });
}

// PATCH /api/turnos/:id/no-asistio, el doctor marca a mano que el paciente no se presento
async function marcarNoAsistido(req: Request, res: Response) {
  const id = parsearIdNumerico(req.params.id);
  const turno = await em.findOneOrFail(Turno, { id }, { populate: ['doctor', 'doctor.usuario', 'doctor.especialidades', 'usuario'] });
  await verificarDoctorDelTurno(req, turno);

  if (turno.estado !== 'pendiente') {
    throw new ConflictError('Solo se puede marcar como no asistido un turno pendiente');
  }

  turno.estado = 'no_asistido';
  encolarNotificacion(em, turno, 'no_asistido');
  await em.flush();
  res.status(200).json({ message: 'turno marcado como no asistido', data: serializarTurnoParaDoctor(turno) });
}

export {
  sanitizeTurnoInput,
  validarTurnoCreacion,
  sanitizeCancelacionInput,
  disponibilidadDoctor,
  disponibilidadEspecialidad,
  disponibilidadMesDoctor,
  disponibilidadMesEspecialidad,
  add,
  misTurnos,
  turnosQueAtiendo,
  findOne,
  cancelar,
  marcarAsistido,
  marcarNoAsistido,
  marcarNoAsistidosVencidos,
  iniciarTareaNoAsistidos,
};
