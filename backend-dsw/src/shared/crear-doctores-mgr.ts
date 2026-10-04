import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { verifyPassword } from 'better-auth/crypto';
import { auth, authPool } from './auth.js';
import { orm } from './orm.js';
import { Usuario } from '../recursos/usuarios/usuario.entidad.js';
import { Doctor } from '../recursos/doctor/doctor.entidad.js';
import { Agenda } from '../recursos/agenda/agenda.entidad.js';
import { Especialidad } from '../recursos/especialidad/especialidad.entidad.js';

const personajes = [
  { nombre: 'Jetstream', apellido: 'Sam', slug: 'jetstream-sam', especialidad: 'Traumatología', dias: [1, 3, 5], inicio: '09:00', fin: '12:00' },
  { nombre: 'Mistral', apellido: 'Desperado', slug: 'mistral', especialidad: 'Cardiología', dias: [2, 4], inicio: '10:00', fin: '13:00' },
  { nombre: 'Monsoon', apellido: 'Desperado', slug: 'monsoon', especialidad: 'Neurología', dias: [1, 2, 4], inicio: '14:00', fin: '17:00' },
  { nombre: 'Sundowner', apellido: 'Desperado', slug: 'sundowner', especialidad: 'Cirugía general', dias: [2, 3, 5], inicio: '08:00', fin: '11:00' },
  { nombre: 'Senator', apellido: 'Armstrong', slug: 'senator-armstrong', especialidad: 'Clínica médica', dias: [1, 3, 5], inicio: '16:00', fin: '19:00' },
];

try {
  if (process.env.NODE_ENV === 'production') throw new Error('Este comando es solo para la base local de desarrollo');
  const password = process.env.MGR_DOCTOR_PASSWORD;
  if (!password || password.length < 8) throw new Error('Definí MGR_DOCTOR_PASSWORD con al menos 8 caracteres');
  const conAgenda = process.argv.includes('--con-agenda');
  const em = orm.em.fork();
  // Comprobar todos los archivos antes de crear cuentas.
  for (const personaje of personajes) {
    await access(fileURLToPath(new URL(`../../../frontend-dsw/public/avatares-doctores/${personaje.slug}.png`, import.meta.url)));
  }
  const ultimaEspecialidad = await em.findOne(Especialidad, { idEspecialidad: { $gt: 0 } }, { orderBy: { idEspecialidad: 'DESC' } });
  let siguienteEspecialidad = (ultimaEspecialidad?.idEspecialidad ?? 0) + 1;
  const ultimoDoctor = await em.findOne(Doctor, { matricula: { $gt: 0 } }, { orderBy: { matricula: 'DESC' } });
  let siguienteMatricula = Math.max(700010, (ultimoDoctor?.matricula ?? 0) + 1);
  for (const [indice, personaje] of personajes.entries()) {
    let especialidad = await em.findOne(Especialidad, { descripcionEsp: personaje.especialidad });
    if (!especialidad) {
      especialidad = em.create(Especialidad, { idEspecialidad: siguienteEspecialidad++, descripcionEsp: personaje.especialidad });
      await em.persistAndFlush(especialidad);
    }
    const email = `${personaje.slug}@hospital-ripper.test`;
    let usuario = await em.findOne(Usuario, { email });
    if (!usuario) {
      const cuenta = await auth.api.createUser({ body: {
        name: personaje.nombre, email, password, role: 'doctor',
        data: { apellido: personaje.apellido, dni: String(80000001 + indice) },
      } });
      usuario = await em.findOneOrFail(Usuario, { authUserId: cuenta.user.id });
    }
    if (usuario.rol !== 'doctor') throw new Error(`El email ${email} pertenece a una cuenta que no es doctor`);
    const credenciales = await em.getConnection().execute<{ password: string }[]>(
      'select password from auth_account where userId = ? and providerId = ?', [usuario.authUserId, 'credential']
    );
    if (!credenciales[0] || !await verifyPassword({ hash: credenciales[0].password, password })) {
      throw new Error(`La cuenta ${email} ya existe con otra contraseña; no se modificó`);
    }
    usuario.foto = `/avatares-doctores/${personaje.slug}.png`;
    let doctor: Doctor | null = await em.findOne(Doctor, { usuario: usuario.id }, { populate: ['especialidades'] });
    if (!doctor) {
      doctor = em.create(Doctor, { matricula: siguienteMatricula++, usuario, activo: true });
      em.persist(doctor);
    }
    doctor.especialidades.add(especialidad);
    await em.flush();
    if (conAgenda && await em.count(Agenda, { doctor }) === 0) {
      for (const diaSemana of personaje.dias) {
        em.persist(em.create(Agenda, { doctor, diaSemana, horaInicio: personaje.inicio, horaFin: personaje.fin, duracionTurnoMinutos: 30 }));
      }
      await em.flush();
    }
    console.log(JSON.stringify({ nombre: `${usuario.nombre} ${usuario.apellido}`, email, matricula: doctor.matricula, foto: usuario.foto, especialidad: especialidad.descripcionEsp, passwordVerificada: true, conAgenda }));
  }
} finally {
  await authPool.end();
  await orm.close();
}
