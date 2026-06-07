import { Request, Response, NextFunction } from 'express';
import { Usuario } from './usuario.entidad.js';
import { orm } from '../../shared/orm.js';
 

const em = orm.em;

function sanitizeusuarioInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = 
  {
    id: req.body.id,
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    password: req.body.password,
    email: req.body.email,
    rol: req.body.rol,
    id_asociado: req.body.id_asociado,
  };

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
    const usuarios = await em.find(
      Usuario,
      {},
     );
    res.status(200).json({ message: 'encontrado todos los usuarios', data: usuarios });
  } 
  catch (error: any) 
  {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const usuario = await em.findOneOrFail(
      Usuario,
      { id },
    );
    res.status(200).json({ message: 'encontrado usuario', data: usuario });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const usuario = em.create(Usuario, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'usuario Creado', data: usuario });
  } 
  catch (error: any) 
  {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const usuarioToUpdate = await em.findOneOrFail(Usuario, { id });
    em.assign(usuarioToUpdate, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({ message: 'usuario updated', data: usuarioToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try 
  {
    const id = Number.parseInt(req.params.id);
    const usuario = em.getReference(Usuario, id);
    await em.removeAndFlush(usuario);
  } 
  catch (error: any) 
  {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeusuarioInput, findAll, findOne, add, update, remove };
