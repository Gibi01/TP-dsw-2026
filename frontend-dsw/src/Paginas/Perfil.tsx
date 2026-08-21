// src/Paginas/Perfil.tsx
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Box,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import { useAuth } from "../Contextos/AuthContext";
import { obtenerPerfil, actualizarPerfil } from "../Servicios/usuarioService";
import type { PerfilUsuario } from "../Tipos/dominio";

export default function Perfil() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);

  const MAX_FOTO_BYTES = 2 * 1024 * 1024; // 2MB: no hay almacenamiento de archivos, viaja como base64

  useEffect(() => {
    if (!usuario) return;
    obtenerPerfil(usuario.id)
      .then(setPerfil)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "No se pudo cargar tu perfil.")
      )
      .finally(() => setLoading(false));
  }, [usuario]);

  const handleChange =
    (campo: keyof PerfilUsuario) => (e: ChangeEvent<HTMLInputElement>) => {
      setPerfil((prev) => (prev ? { ...prev, [campo]: e.target.value } : prev));
    };

  const handleFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo si lo corrige
    if (!file) return;

    setErrorFoto(null);

    const esPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
    if (!esPng) {
      setErrorFoto("El archivo debe ser una imagen .png.");
      return;
    }
    if (file.size > MAX_FOTO_BYTES) {
      setErrorFoto("La imagen no puede pesar más de 2MB.");
      return;
    }

    const lector = new FileReader();
    lector.onload = () => {
      setPerfil((prev) => (prev ? { ...prev, foto: lector.result as string } : prev));
    };
    lector.onerror = () => setErrorFoto("No se pudo leer el archivo.");
    lector.readAsDataURL(file);
  };

  const quitarFoto = () => {
    setPerfil((prev) => (prev ? { ...prev, foto: undefined } : prev));
    setErrorFoto(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!perfil || !usuario) return;

    setGuardando(true);
    setErrorGuardar(null);
    setGuardadoOk(false);
    try {
      const actualizado = await actualizarPerfil(usuario.id, {
        email: perfil.email,
        foto: perfil.foto,
        obraSocial: perfil.obraSocial,
        direccion: perfil.direccion,
        telefonoCelular: perfil.telefonoCelular,
      });
      setPerfil(actualizado);
      setGuardadoOk(true);
    } catch (err) {
      setErrorGuardar(err instanceof Error ? err.message : "No se pudieron guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !perfil) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">{error ?? "No se encontró tu perfil."}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Stack spacing={1} sx={{ mb: 3, alignItems: "center" }}>
          <Avatar src={perfil.foto || "/Avatar_default.jpg"} sx={{ width: 80, height: 80 }} />
          <Typography variant="h5" component="h1">
            {perfil.nombre} {perfil.apellido}
          </Typography>
        </Stack>

        {guardadoOk && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Perfil actualizado.
          </Alert>
        )}
        {errorGuardar && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorGuardar}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            margin="normal"
            type="email"
            label="Email"
            value={perfil.email}
            onChange={handleChange("email")}
          />
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Foto de perfil
            </Typography>
            {errorFoto && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {errorFoto}
              </Alert>
            )}
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Button variant="outlined" component="label">
                Elegir archivo
                <input type="file" accept=".png,image/png" hidden onChange={handleFotoChange} />
              </Button>
              {perfil.foto && (
                <Button color="error" onClick={quitarFoto}>
                  Quitar foto
                </Button>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              El archivo debe ser .png. Si no cargás una foto válida, se muestra un avatar por
              defecto.
            </Typography>
          </Box>
          <TextField
            fullWidth
            margin="normal"
            label="DNI"
            value={perfil.dni ?? ""}
            disabled
            helperText="El DNI no se puede modificar."
          />
          <TextField
            fullWidth
            margin="normal"
            label="Obra social"
            value={perfil.obraSocial ?? ""}
            onChange={handleChange("obraSocial")}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Dirección"
            value={perfil.direccion ?? ""}
            onChange={handleChange("direccion")}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Teléfono celular"
            value={perfil.telefonoCelular ?? ""}
            onChange={handleChange("telefonoCelular")}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 3 }}
            disabled={guardando}
          >
            {guardando ? <CircularProgress size={24} color="inherit" /> : "Guardar cambios"}
          </Button>

          <Button
            variant="outlined"
            size="large"
            fullWidth
            sx={{ mt: 2 }}
            startIcon={<HistoryIcon />}
            onClick={() => navigate("/mis-turnos")}
          >
            Ver histórico de turnos
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
