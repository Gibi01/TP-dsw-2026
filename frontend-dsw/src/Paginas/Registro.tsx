// src/Paginas/Registro.tsx
import { useState, type FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
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

const initialForm: RegistroUsuarioForm = {
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function Registro() {
  const [form, setForm] = useState<RegistroUsuarioForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof RegistroUsuarioForm, string>>>({});
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange =
    (field: keyof RegistroUsuarioForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const validate = (): boolean => {
    const nuevosErrores: Partial<Record<keyof RegistroUsuarioForm, string>> = {};

    if (!form.nombre.trim()) nuevosErrores.nombre = "Ingresá tu nombre.";
    if (!form.apellido.trim()) nuevosErrores.apellido = "Ingresá tu apellido.";
    if (!/^\d{7,8}$/.test(form.dni)) nuevosErrores.dni = "DNI inválido.";
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      nuevosErrores.email = "Ingresá un email válido.";
    if (form.password.length < 6)
      nuevosErrores.password = "La contraseña debe tener al menos 6 caracteres.";
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
      await registrar(form);
      navigate("/login", {
        state: { mensaje: "Cuenta creada. Iniciá sesión para continuar." },
      });
    } catch (err) {
      setErrorApi(err instanceof Error ? err.message : "No se pudo completar el registro.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Crear cuenta
        </Typography>

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
            <Link component={RouterLink} to="/login">
              Iniciá sesión
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
