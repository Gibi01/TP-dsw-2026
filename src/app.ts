import express, { Request, Response, NextFunction } from 'express';
import 'reflect-metadata';
import { orm, syncSchema } from './shared/orm.js';
import { RequestContext } from '@mikro-orm/core';

const app = express();
app.use(express.json());

//luego de los middlewares base como express

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});


await syncSchema(); // never in production

app.listen(3000, () => {
  console.log('funka');
});
