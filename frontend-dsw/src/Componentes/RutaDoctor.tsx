// src/Componentes/RutaDoctor.tsx
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Contextos/AuthContext";

interface Props {
  children: ReactNode;
}

// igual que RutaAdmin pero pide rol doctor. si esta logueado pero no es doctor lo mando al inicio
export default function RutaDoctor({ children }: Props) {
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

  if (usuario?.rol !== "doctor") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
