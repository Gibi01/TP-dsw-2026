// src/Servicios/authService.ts
import { api, type ApiResponse } from "./api";
import type { LoginForm, RegistroUsuarioForm, UsuarioSesion } from "../Tipos/dominio";

export interface LoginResultado {
  token: string;
  usuario: UsuarioSesion;
}

export async function login(form: LoginForm): Promise<LoginResultado> {
  const respuesta = await api.post<ApiResponse<LoginResultado>>("/auth/login", form);
  return respuesta.data;
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
