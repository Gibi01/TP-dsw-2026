// src/Contextos/AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { UsuarioSesion } from "../Tipos/dominio";

interface AuthContextValue {
  usuario: UsuarioSesion | null;
  estaAutenticado: boolean;
  guardarSesion: (token: string, usuario: UsuarioSesion) => void;
  actualizarUsuario: (parcial: Partial<UsuarioSesion>) => void;
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
  const navigate = useNavigate();

  const guardarSesion = (token: string, nuevoUsuario: UsuarioSesion) => {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(nuevoUsuario));
    setUsuario(nuevoUsuario);
  };

  // actualiza el usuario sin tener que volver a loguearse (por ej cuando cambia la foto)
  const actualizarUsuario = (parcial: Partial<UsuarioSesion>) => {
    setUsuario((prev) => {
      if (!prev) return prev;
      const actualizado = { ...prev, ...parcial };
      localStorage.setItem("usuario", JSON.stringify(actualizado));
      return actualizado;
    });
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  // si el token vencio (evento que tira api.ts en un 401) cierra sesion sola y manda al login
  useEffect(() => {
    function manejarSesionVencida() {
      setUsuario(null);
      navigate("/login", {
        replace: true,
        state: { mensaje: "Tu sesión expiró. Iniciá sesión de nuevo." },
      });
    }
    window.addEventListener("auth:sesion-vencida", manejarSesionVencida);
    return () => window.removeEventListener("auth:sesion-vencida", manejarSesionVencida);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        estaAutenticado: usuario !== null,
        guardarSesion,
        actualizarUsuario,
        cerrarSesion,
      }}
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
