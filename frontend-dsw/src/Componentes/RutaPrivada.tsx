// src/Componentes/RutaPrivada.tsx
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Contextos/AuthContext";

interface Props {
  children: ReactNode;
}

// Envuelve una ruta que requiere sesión iniciada. Si no hay sesión, redirige a /login
// con un mensaje y recuerda desde dónde vino para volver ahí después de loguearse.
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
