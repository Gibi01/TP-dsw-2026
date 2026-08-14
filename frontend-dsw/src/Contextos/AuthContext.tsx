// src/Contextos/AuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import type { UsuarioSesion } from "../Tipos/dominio";

interface AuthContextValue {
  usuario: UsuarioSesion | null;
  estaAutenticado: boolean;
  guardarSesion: (token: string, usuario: UsuarioSesion) => void;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function leerUsuarioGuardado(): UsuarioSesion | null {
  const crudo = localStorage.getItem("usuario");
  if (!crudo) return null;
  try {
    return JSON.parse(crudo) as UsuarioSesion;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(leerUsuarioGuardado);

  const guardarSesion = (token: string, nuevoUsuario: UsuarioSesion) => {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(nuevoUsuario));
    setUsuario(nuevoUsuario);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{ usuario, estaAutenticado: usuario !== null, guardarSesion, cerrarSesion }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return contexto;
}
