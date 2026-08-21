import express from 'express';
import 'reflect-metadata';
import cors from 'cors';
import morgan from 'morgan';
import { orm, syncSchema } from './shared/orm.js';
import { RequestContext } from '@mikro-orm/core';
import { config } from './shared/config.js';
import { manejadorErrores, rutaNoEncontrada } from './shared/manejadorErrores.js';

import authRouter from './recursos/auth/auth.rutas.js';
import sanatorioRouter from './recursos/sanatorio/sanatorio.rutas.js';
import usuarioRouter from './recursos/usuarios/usuario.rutas.js';
import doctorRouter from './recursos/doctor/doctor.rutas.js';
import especialidadRouter from './recursos/especialidad/especialidad.rutas.js';
import turnoRouter from './recursos/turno/turno.rutas.js';
import agendaRouter from './recursos/agenda/agenda.rutas.js';
import { iniciarTareaNoAsistidos } from './recursos/turno/turno.controlador.js';

export const app = express();
app.use(cors());
// límite subido de 100kb (default) a 5mb: la foto de perfil viaja en base64 en el body.
app.use(express.json({ limit: '5mb' }));

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});

app.use(morgan('dev'));

app.use('/api/auth', authRouter);
app.use('/api/sanatorios', sanatorioRouter);
app.use('/api/usuarios', usuarioRouter);
app.use('/api/doctores', doctorRouter);
app.use('/api/especialidades', especialidadRouter);
app.use('/api/turnos', turnoRouter);
app.use('/api/agendas', agendaRouter);

app.use(rutaNoEncontrada);
app.use(manejadorErrores);

if (process.env.NODE_ENV !== 'test') {
  await syncSchema(); // never in production
  iniciarTareaNoAsistidos(); // pasa turnos vencidos de "pendiente" a "no_asistido" cada 15min

  app.listen(config.port, () => {
    console.log(`servidor escuchando en el puerto ${config.port}`);
  });
}
