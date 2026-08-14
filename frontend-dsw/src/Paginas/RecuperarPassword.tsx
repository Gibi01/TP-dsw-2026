// src/Paginas/RecuperarPassword.tsx
// Placeholder: todavía no hay backend/servicio de mail para esto. El formulario
// valida el email y muestra la confirmación, pero no dispara ningún envío real.
// Cuando haya un servicio de mail, esto pasa a llamar a un endpoint real
// (ver TODO en handleSubmit).
import { useState, type FormEvent } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Container, Paper, Typography, TextField, Button, Link, Alert, Box } from "@mui/material";

export default function RecuperarPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Ingresá un email válido.");
      return;
    }

    // TODO: cuando exista un servicio de mail, reemplazar por:
    // await api.post("/auth/recuperar-password", { email });
    setEnviado(true);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Recuperar contraseña
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Ingresá tu email y te vamos a enviar instrucciones para recuperar tu contraseña.
        </Typography>

        {enviado ? (
          <Alert severity="success">
            Si el email está registrado, en breve vas a recibir instrucciones para recuperar tu
            contraseña.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              type="email"
              label="Email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 3 }}>
              Enviar instrucciones
            </Button>
          </Box>
        )}

        <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
          <Link component={RouterLink} to="/login">
            Volver a iniciar sesión
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}
