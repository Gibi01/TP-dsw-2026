import express, { Request, Response, NextFunction } from 'express';
import 'reflect-metadata';
import { orm, syncSchema } from './shared/orm.js';
import { RequestContext } from '@mikro-orm/core';
import sanatorioRouter from './recursos/sanatorio/sanatorio.rutas.js';

const app = express();
app.use(express.json());

//luego de los middlewares base como express

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});

app.use('/api/sanatorios', sanatorioRouter);

/* escalable -> CODED BY CLAUDE -> NOT CHECKEADO
const routes: [string, Router][] = [
  ['/api/sanatorios', sanatorioRouter],
  // ['/api/pacientes', pacienteRouter],
];

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});

routes.forEach(([path, router]) => app.use(path, router));
});
*/

await syncSchema(); // never in production

app.listen(3000, () => {
  console.log('funka');
});
