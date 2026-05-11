import { Request, Response, NextFunction } from 'express';
import { Sanatorio } from './sanatorio.entidad.js';
import { orm } from '../../shared/orm.js';
 
const em = orm.em;

function sanitizesanatorioInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = 
  {
    id: req.body.id,
    nombre: req.body.nombre,
  };

  //more checks here
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

 

async function findAll(req: Request, res: Response) {
  try 
  {
    const sanatorios = await em.find(
      Sanatorio,
      {},
     );
    res.status(200).json({ message: 'encontrado todos los sanatorios', data: sanatorios });
  } 
  catch (error: any) 
  {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const sanatorio = await em.findOneOrFail(
      Sanatorio,
      { id },
    );
    res.status(200).json({ message: 'encontrado sanatorio', data: sanatorio });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const sanatorio = em.create(Sanatorio, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'sanatorio Creado', data: sanatorio });
  } 
  catch (error: any) 
  {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const sanatorioToUpdate = await em.findOneOrFail(Sanatorio, { id });
    em.assign(sanatorioToUpdate, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({ message: 'sanatorio updated', data: sanatorioToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try 
  {
    const id = Number.parseInt(req.params.id);
    const sanatorio = em.getReference(Sanatorio, id);
    await em.removeAndFlush(sanatorio);
  } 
  catch (error: any) 
  {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizesanatorioInput, findAll, findOne, add, update, remove };
