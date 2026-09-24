// src/Componentes/RutaPrivada.tsx
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Contextos/AuthContext";

interface Props {
  children: ReactNode;
}

// ruta que necesita sesion. si no hay sesion manda a /registro (no a /login) y guarda
// de donde vino para volver ahi despues
export default function RutaPrivada({ children }: Props) {
  const { estaAutenticado } = useAuth();
  const location = useLocation();

  if (!estaAutenticado) {
    return (
      <Navigate
        to="/registro"
        replace
        state={{ from: location.pathname, mensaje: "Creá una cuenta para ver tus turnos." }}
      />
    );
  }

  return <>{children}</>;
}
