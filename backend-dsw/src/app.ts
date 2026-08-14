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
import categoriaRouter from './recursos/categorias/categoria.rutas.js';

export const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});

app.use(morgan('dev'));

app.use('/api/auth', authRouter);
app.use('/api/sanatorios', sanatorioRouter);
app.use('/api/usuarios', usuarioRouter);
app.use('/api/doctores', doctorRouter);
app.use('/api/especialidades', especialidadRouter);
app.use('/api/categorias', categoriaRouter);

app.use(rutaNoEncontrada);
app.use(manejadorErrores);

if (process.env.NODE_ENV !== 'test') {
  await syncSchema(); // never in production

  app.listen(config.port, () => {
    console.log(`servidor escuchando en el puerto ${config.port}`);
  });
}
