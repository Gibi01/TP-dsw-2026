import express, { Request, Response, NextFunction } from 'express';
import 'reflect-metadata';
import { orm, syncSchema } from './shared/orm.js';
import { RequestContext } from '@mikro-orm/core';
import sanatorioRouter from './recursos/sanatorio/sanatorio.rutas.js';
import usuarioRouter from './recursos/usuarios/usuario.rutas.js';
import morgan from 'morgan';

const app = express();
app.use(express.json());

//luego de los middlewares base como express

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});

app.use(morgan('dev')); // Agrega el middleware de Morgan para el logging de solicitudes

//Cruds
app.use('/api/sanatorios', sanatorioRouter);
app.use('/api/usuarios', usuarioRouter);


await syncSchema(); // never in production

app.listen(3000, () => {
  console.log('funka');
});
