import EncabezadoPagina from '../Componentes/EncabezadoPagina';
// src/Paginas/Registro.tsx
import { useState, type FormEvent } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  Alert,
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import type { RegistroUsuarioForm } from "../Tipos/dominio";
import { registrar } from "../Servicios/authService";
import { useAuth } from '../Contextos/AuthContext';
import { destinoTrasAutenticacion } from '../Servicios/reservaPendiente';

const initialForm: RegistroUsuarioForm = {
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function capitalizar(valor: string): string {
  if (!valor) return valor;
  return valor.charAt(0).toUpperCase() + valor.slice(1);
}

interface LocationState {
  from?: string;
  mensaje?: string;
}

export default function Registro() {
  const { guardarSesion } = useAuth();
  const [form, setForm] = useState<RegistroUsuarioForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof RegistroUsuarioForm, string>>>({});
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) ?? {};

  const handleChange =
    (field: keyof RegistroUsuarioForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const valor =
        field === "nombre" || field === "apellido" ? capitalizar(e.target.value) : e.target.value;
      setForm((prev) => ({ ...prev, [field]: valor }));
    };

  const validate = (): boolean => {
    const nuevosErrores: Partial<Record<keyof RegistroUsuarioForm, string>> = {};

    if (!form.nombre.trim()) nuevosErrores.nombre = "Ingresá tu nombre.";
    if (!form.apellido.trim()) nuevosErrores.apellido = "Ingresá tu apellido.";
    if (!/^\d{7,8}$/.test(form.dni)) nuevosErrores.dni = "DNI inválido.";
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      nuevosErrores.email = "Ingresá un email válido.";
    if (form.password.length < 8)
      nuevosErrores.password = "La contraseña debe tener al menos 8 caracteres.";
    if (form.confirmPassword !== form.password)
      nuevosErrores.confirmPassword = "Las contraseñas no coinciden.";
    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorApi(null);
    if (!validate()) return;

    setCargando(true);
    try {
      const usuario = await registrar(form);
      guardarSesion(usuario);
      navigate(destinoTrasAutenticacion(state.from), { replace: true });
    } catch (err) {
      setErrorApi(err instanceof Error ? err.message : "No se pudo completar el registro.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 } }}>
        <EncabezadoPagina>
        <Typography variant="h4" component="h1" gutterBottom>
          Crear cuenta
        </Typography>
        </EncabezadoPagina>

        {state.mensaje && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {state.mensaje}
          </Alert>
        )}

        {errorApi && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorApi}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={form.nombre}
                onChange={handleChange("nombre")}
                error={!!errors.nombre}
                helperText={errors.nombre}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Apellido"
                value={form.apellido}
                onChange={handleChange("apellido")}
                error={!!errors.apellido}
                helperText={errors.apellido}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="DNI"
                value={form.dni}
                onChange={handleChange("dni")}
                error={!!errors.dni}
                helperText={errors.dni}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={form.email}
                onChange={handleChange("email")}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type={mostrarPassword ? "text" : "password"}
                label="Contraseña"
                value={form.password}
                onChange={handleChange("password")}
                error={!!errors.password}
                helperText={errors.password}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          onClick={() => setMostrarPassword((prev) => !prev)}
                          edge="end"
                        >
                          {mostrarPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type={mostrarConfirmPassword ? "text" : "password"}
                label="Confirmar contraseña"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            mostrarConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                          }
                          onClick={() => setMostrarConfirmPassword((prev) => !prev)}
                          edge="end"
                        >
                          {mostrarConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 3 }}
            disabled={cargando}
          >
            {cargando ? <CircularProgress size={24} color="inherit" /> : "Registrarme"}
          </Button>

          <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
            ¿Ya tenés cuenta?{" "}
            <Link component={RouterLink} to="/login" state={{ from: state.from }}>
              Iniciá sesión
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
