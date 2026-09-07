// src/Componentes/RutaPrivada.tsx
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Contextos/AuthContext";

interface Props {
  children: ReactNode;
}

// ruta que necesita sesion. si no hay sesion manda a /login y guarda de donde vino
// para volver ahi despues de loguearse
export default function RutaPrivada({ children }: Props) {
  const { estaAutenticado } = useAuth();
  const location = useLocation();

  if (!estaAutenticado) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, mensaje: "Iniciá sesión para ver tus turnos." }}
      />
    );
  }

  return <>{children}</>;
}
