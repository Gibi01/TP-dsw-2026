// src/Componentes/RutaAdmin.tsx
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Contextos/AuthContext";

interface Props {
  children: ReactNode;
}

// Como RutaPrivada, pero además exige rol admin. Si hay sesión pero no es admin,
// no tiene sentido mandarlo a loguearse de nuevo: se lo devuelve al inicio.
export default function RutaAdmin({ children }: Props) {
  const { usuario, estaAutenticado } = useAuth();
  const location = useLocation();

  if (!estaAutenticado) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, mensaje: "Iniciá sesión para continuar." }}
      />
    );
  }

  if (usuario?.rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
