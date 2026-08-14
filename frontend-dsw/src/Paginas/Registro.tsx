// src/Paginas/Registro.tsx
import { useState, type FormEvent } from "react";
import { Link as RouterLink } from "react-router-dom";
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
} from "@mui/material";
import type { RegistroUsuarioForm } from "../Tipos/dominio";

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
  const [enviado, setEnviado] = useState(false);

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // TODO: reemplazar por la llamada real, por ejemplo:
    // await api.post("/auth/registro", form);
    console.log("Registro (mock):", form);
    setEnviado(true);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Crear cuenta
        </Typography>

        {enviado && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Formulario válido. (Todavía no se envía al backend.)
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={form.nombre}
                onChange={handleChange("nombre")}
                error={!!errors.nombre}
                helperText={errors.nombre}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apellido"
                value={form.apellido}
                onChange={handleChange("apellido")}
                error={!!errors.apellido}
                helperText={errors.apellido}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="DNI"
                value={form.dni}
                onChange={handleChange("dni")}
                error={!!errors.dni}
                helperText={errors.dni}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="Contraseña"
                value={form.password}
                onChange={handleChange("password")}
                error={!!errors.password}
                helperText={errors.password}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="Confirmar contraseña"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
              />
            </Grid>
          </Grid>

          <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 3 }}>
            Registrarme
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
