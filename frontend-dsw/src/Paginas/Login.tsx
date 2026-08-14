// src/Paginas/Login.tsx
import { useState, type FormEvent } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Box,
} from "@mui/material";
import type { LoginForm } from "../Tipos/dominio";

const initialForm: LoginForm = { email: "", password: "" };

export default function Login() {
  const [form, setForm] = useState<LoginForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});
  const [enviado, setEnviado] = useState(false);

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // TODO: reemplazar por la llamada real, por ejemplo:
    // const data = await api.post("/auth/login", form);
    // localStorage.setItem("token", data.token);
    console.log("Login (mock):", form);
    setEnviado(true);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Iniciar sesión
        </Typography>

        {enviado && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Formulario válido. (Todavía no se envía al backend.)
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
            type="password"
            label="Contraseña"
            margin="normal"
            value={form.password}
            onChange={handleChange("password")}
            error={!!errors.password}
            helperText={errors.password}
          />

          <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 3 }}>
            Ingresar
          </Button>

          <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
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
