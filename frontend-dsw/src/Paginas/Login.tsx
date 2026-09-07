// src/Paginas/Login.tsx
import { useState, type FormEvent } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import type { LoginForm } from "../Tipos/dominio";
import { login } from "../Servicios/authService";
import { useAuth } from "../Contextos/AuthContext";

const initialForm: LoginForm = { email: "", password: "" };

interface LocationState {
  from?: string;
  mensaje?: string;
}

export default function Login() {
  const [form, setForm] = useState<LoginForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const { guardarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) ?? {};

  const handleChange =
    (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const validate = (): boolean => {
    const nuevosErrores: Partial<Record<keyof LoginForm, string>> = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      nuevosErrores.email = "Ingresá un email válido.";
    if (!form.password) nuevosErrores.password = "Ingresá tu contraseña.";
    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorApi(null);
    if (!validate()) return;

    setCargando(true);
    try {
      const { token, usuario } = await login(form);
      guardarSesion(token, usuario);
      navigate("/", { replace: true });
    } catch (err) {
      setErrorApi(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Iniciar sesión
        </Typography>

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
          <TextField
            fullWidth
            type="email"
            label="Email"
            margin="normal"
            value={form.email}
            onChange={handleChange("email")}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            fullWidth
            type={mostrarPassword ? "text" : "password"}
            label="Contraseña"
            margin="normal"
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

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 3 }}
            disabled={cargando}
          >
            {cargando ? <CircularProgress size={24} color="inherit" /> : "Ingresar"}
          </Button>

          <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
            <Link component={RouterLink} to="/recuperar-password">
              ¿Olvidaste tu contraseña?
            </Link>
          </Typography>

          <Typography variant="body2" sx={{ mt: 1, textAlign: "center" }}>
            ¿No tenés cuenta?{" "}
            <Link component={RouterLink} to="/registro">
              Registrate
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
