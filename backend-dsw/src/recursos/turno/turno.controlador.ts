import { Request, Response, NextFunction } from 'express';
import { Turno } from './turno.entidad.js';
import { Doctor } from '../doctor/doctor.entidad.js';
import { Especialidad } from '../especialidad/especialidad.entidad.js';
import { Usuario } from '../usuarios/usuario.entidad.js';
import { Agenda } from '../agenda/agenda.entidad.js';
import { orm } from '../../shared/orm.js';
import { limpiarInput, validarCamposRequeridos, parsearIdNumerico } from '../../shared/validacion.js';
import { BadRequestError, ForbiddenError, ConflictError } from '../../shared/errores.js';

const em = orm.em;

const CAMPOS_CREACION = ['doctorId', 'fechaHoraTurno'];
const CAMPOS_REQUERIDOS_CREACION = ['doctorId', 'fechaHoraTurno'];

const CAMPOS_CANCELACION = ['motivoCancelacion'];
const CAMPOS_REQUERIDOS_CANCELACION = ['motivoCancelacion'];

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

function validarCancelacionInput(req: Request, res: Response, next: NextFunction) {
  validarCamposRequeridos(req.body.sanitizedInput, CAMPOS_REQUERIDOS_CANCELACION);
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

// Arma a mano la respuesta pública de un turno: nunca se pasa la entidad completa a res.json,
// porque si "usuario" queda hidratado en el identity map (p. ej. por otra consulta previa) su
// serialización por defecto incluye el hash de la contraseña. Solo se expone el id del usuario.
function serializarTurno(turno: Turno) {
  return {
    id: turno.id,
    usuarioId: typeof turno.usuario === 'object' ? turno.usuario.id : turno.usuario,
    doctor: turno.doctor,
    fechaHoraEmision: turno.fechaHoraEmision,
    fechaHoraTurno: turno.fechaHoraTurno,
    estado: turno.estado,
    fechaHoraCancelacion: turno.fechaHoraCancelacion ?? null,
    motivoCancelacion: turno.motivoCancelacion ?? null,
  };
}

// Genera los horarios ofrecibles de un doctor en una fecha a partir de su Agenda real
// (bloques semanales que carga el admin), no de una franja fija. Si el doctor no tiene
// ningún bloque de agenda para ese día de la semana, no tiene horarios ese día.
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
    estado: 'reservado',
    fechaHoraTurno: { $gte: inicio, $lte: fin },
  });
  return new Set(turnosDelDia.map((t) => t.fechaHoraTurno.getTime()));
}

// GET /api/turnos/disponibilidad?doctorId=&fecha=YYYY-MM-DD
async function disponibilidadDoctor(req: Request, res: Response) {
  const matricula = parsearIdNumerico(req.query.doctorId as string);
  const fecha = validarFecha(req.query.fecha);
  const doctor = await em.findOneOrFail(Doctor, { matricula });

  const [ocupados, slotsBase] = await Promise.all([
    slotsOcupados(doctor, fecha),
    generarSlotsDelDia(doctor, fecha),
  ]);
  const disponibles = slotsBase.filter((slot) => !ocupados.has(slot.getTime()));

  res.status(200).json({ message: 'horarios disponibles', data: disponibles });
}

// GET /api/turnos/disponibilidad-especialidad?especialidadId=&fecha=YYYY-MM-DD
// No importa el doctor: se listan todos los horarios libres de cualquier doctor de la especialidad.
async function disponibilidadEspecialidad(req: Request, res: Response) {
  const idEspecialidad = parsearIdNumerico(req.query.especialidadId as string);
  const fecha = validarFecha(req.query.fecha);
  const especialidad = await em.findOneOrFail(
    Especialidad,
    { idEspecialidad },
    { populate: ['doctores'] }
  );

  const disponibles: { fechaHoraTurno: Date; doctor: { matricula: number; nombrePr: string; apellidoPr: string } }[] = [];

  for (const doctor of especialidad.doctores) {
    const [ocupados, slotsBase] = await Promise.all([
      slotsOcupados(doctor, fecha),
      generarSlotsDelDia(doctor, fecha),
    ]);
    for (const slot of slotsBase) {
      if (!ocupados.has(slot.getTime())) {
        disponibles.push({
          fechaHoraTurno: slot,
          doctor: { matricula: doctor.matricula, nombrePr: doctor.nombrePr, apellidoPr: doctor.apellidoPr },
        });
      }
    }
  }

  disponibles.sort((a, b) => a.fechaHoraTurno.getTime() - b.fechaHoraTurno.getTime());

  res.status(200).json({ message: 'turnos disponibles para la especialidad', data: disponibles });
}

// POST /api/turnos — el usuario logueado reserva un turno con un doctor en un horario puntual.
async function add(req: Request, res: Response) {
  const { doctorId, fechaHoraTurno } = req.body.sanitizedInput as {
    doctorId: unknown;
    fechaHoraTurno: unknown;
  };

  const matricula = parsearIdNumerico(String(doctorId));
  const fecha = new Date(fechaHoraTurno as string);
  if (Number.isNaN(fecha.getTime())) {
    throw new BadRequestError('fechaHoraTurno inválida');
  }
  if (fecha.getTime() < Date.now()) {
    throw new BadRequestError('No se puede reservar un turno en el pasado');
  }

  const doctor = await em.findOneOrFail(Doctor, { matricula });

  const slotsDelDia = await generarSlotsDelDia(doctor, formatoFecha(fecha));
  const esHorarioDeAgenda = slotsDelDia.some((slot) => slot.getTime() === fecha.getTime());
  if (!esHorarioDeAgenda) {
    throw new BadRequestError('Ese horario no corresponde a la agenda del doctor');
  }

  const ocupado = await em.findOne(Turno, { doctor, fechaHoraTurno: fecha, estado: 'reservado' });
  if (ocupado) {
    throw new ConflictError('Ese horario ya no está disponible');
  }

  const usuario = em.getReference(Usuario, req.usuario!.id);
  const turno = em.create(Turno, {
    usuario,
    doctor,
    fechaHoraEmision: new Date(),
    fechaHoraTurno: fecha,
    estado: 'reservado',
  });

  await em.flush();
  res.status(201).json({ message: 'turno reservado', data: serializarTurno(turno) });
}

// GET /api/turnos/mios?fecha=&especialidadId=&doctorId= — histórico del usuario logueado.
async function misTurnos(req: Request, res: Response) {
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
    populate: ['doctor', 'doctor.especialidades'],
    orderBy: { fechaHoraTurno: 'desc' },
  });

  res.status(200).json({ message: 'mis turnos', data: turnos.map(serializarTurno) });
}

async function findOne(req: Request, res: Response) {
  const id = parsearIdNumerico(req.params.id);
  // No se populatea "usuario": alcanza con la referencia (trae el id) para validar el dueño,
  // y evita serializar el usuario completo -contraseña hasheada incluida- en la respuesta.
  const turno = await em.findOneOrFail(Turno, { id }, { populate: ['doctor'] });

  if (req.usuario?.rol !== 'admin' && turno.usuario.id !== req.usuario?.id) {
    throw new ForbiddenError('No podés ver un turno que no es tuyo');
  }

  res.status(200).json({ message: 'turno encontrado', data: serializarTurno(turno) });
}

// PATCH /api/turnos/:id/cancelar — requiere motivoCancelacion en el body.
async function cancelar(req: Request, res: Response) {
  const id = parsearIdNumerico(req.params.id);
  // Igual que en findOne: no se populatea "usuario" para no filtrar la contraseña hasheada.
  const turno = await em.findOneOrFail(Turno, { id });

  if (req.usuario?.rol !== 'admin' && turno.usuario.id !== req.usuario?.id) {
    throw new ForbiddenError('No podés cancelar un turno que no es tuyo');
  }
  if (turno.estado === 'cancelado') {
    throw new ConflictError('El turno ya estaba cancelado');
  }

  turno.estado = 'cancelado';
  turno.fechaHoraCancelacion = new Date();
  turno.motivoCancelacion = req.body.sanitizedInput.motivoCancelacion as string;

  await em.flush();
  res.status(200).json({ message: 'turno cancelado', data: serializarTurno(turno) });
}

export {
  sanitizeTurnoInput,
  validarTurnoCreacion,
  sanitizeCancelacionInput,
  validarCancelacionInput,
  disponibilidadDoctor,
  disponibilidadEspecialidad,
  add,
  misTurnos,
  findOne,
  cancelar,
};
