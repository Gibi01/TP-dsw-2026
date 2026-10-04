import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UsuarioSesion } from '../Tipos/dominio';
import { authClient } from '../Servicios/authClient';
import { obtenerSesion } from '../Servicios/authService';

interface AuthContextValue {
  usuario: UsuarioSesion | null;
  estaAutenticado: boolean;
  cargandoSesion: boolean;
  guardarSesion: (usuario: UsuarioSesion) => void;
  actualizarUsuario: (parcial: Partial<UsuarioSesion>) => void;
  cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const { data: sesion, isPending } = authClient.useSession();
  const navigate = useNavigate();

  useEffect(() => {
    // Retira los datos de la autenticación anterior; no se guardan nuevas credenciales aquí.
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }, []);

  useEffect(() => {
    if (isPending) return;
    let cancelado = false;
    if (!sesion) {
      setUsuario(null);
      setCargandoPerfil(false);
      return;
    }
    setCargandoPerfil(true);
    obtenerSesion().then((perfil) => {
      if (!cancelado) setUsuario(perfil);
    }).catch(() => {
      if (!cancelado) setUsuario(null);
    }).finally(() => {
      if (!cancelado) setCargandoPerfil(false);
    });
    return () => { cancelado = true; };
  }, [sesion?.user.id, isPending]);

  useEffect(() => {
    function manejarSesionVencida() {
      setUsuario(null);
      navigate('/login', { replace: true, state: { mensaje: 'Tu sesión expiró. Iniciá sesión de nuevo.' } });
    }
    window.addEventListener('auth:sesion-vencida', manejarSesionVencida);
    return () => window.removeEventListener('auth:sesion-vencida', manejarSesionVencida);
  }, [navigate]);

  const cerrarSesion = async () => {
    const { error } = await authClient.signOut();
    if (error) throw new Error(error.message ?? 'No se pudo cerrar la sesión');
    setUsuario(null);
  };

  return <AuthContext.Provider value={{
    usuario, estaAutenticado: usuario !== null,
    cargandoSesion: isPending || cargandoPerfil,
    guardarSesion: setUsuario,
    actualizarUsuario: (parcial) => setUsuario((prev) => prev ? { ...prev, ...parcial } : null),
    cerrarSesion,
  }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return contexto;
}
