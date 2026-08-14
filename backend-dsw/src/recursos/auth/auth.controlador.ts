import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Usuario } from '../usuarios/usuario.entidad.js';
import { orm } from '../../shared/orm.js';
import { config } from '../../shared/config.js';
import { BadRequestError, UnauthorizedError } from '../../shared/errores.js';

const em = orm.em;

async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError('Email y password son obligatorios');
  }

  const usuario = await em.findOne(Usuario, { email });
  if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'] }
  );

  res.status(200).json({
    message: 'login exitoso',
    data: {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
    },
  });
}

export { login };
