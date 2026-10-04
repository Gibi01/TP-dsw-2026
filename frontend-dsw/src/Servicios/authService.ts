// src/Servicios/authService.ts
import { api, type ApiResponse } from "./api";
import { authClient } from './authClient';
import type { LoginForm, RegistroUsuarioForm, UsuarioSesion } from "../Tipos/dominio";

export async function obtenerSesion(): Promise<UsuarioSesion> {
  const respuesta = await api.get<ApiResponse<UsuarioSesion>>('/usuarios/me');
  return respuesta.data;
}

export async function login(form: LoginForm): Promise<UsuarioSesion> {
  const { error } = await authClient.signIn.email(form);
  if (error) throw new Error(error.message ?? 'No se pudo iniciar sesión');
  return obtenerSesion();
}

export async function registrar(form: RegistroUsuarioForm): Promise<UsuarioSesion> {
  const payload = {
    nombre: form.nombre,
    apellido: form.apellido,
    dni: form.dni,
    email: form.email,
    password: form.password,
  };
  const respuesta = await api.post<ApiResponse<UsuarioSesion>>("/usuarios", payload);
  return respuesta.data;
}
