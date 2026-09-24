// src/Componentes/RutaAdmin.tsx
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Contextos/AuthContext";

interface Props {
  children: ReactNode;
}

// igual que RutaPrivada pero pide rol admin. si esta logueado pero no es admin lo mando al inicio
export default function RutaAdmin({ children }: Props) {
  const { usuario, estaAutenticado } = useAuth();
  const location = useLocation();

  if (!estaAutenticado) {
    return (
      <Navigate
        to="/registro"
        replace
        state={{ from: location.pathname, mensaje: "Creá una cuenta para continuar." }}
      />
    );
  }

  if (usuario?.rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
