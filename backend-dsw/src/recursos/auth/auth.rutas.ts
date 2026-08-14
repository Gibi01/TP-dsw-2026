import { Router } from 'express';
import { login } from './auth.controlador.js';

export const authRouter = Router();

authRouter.post('/login', login);

export default authRouter;
