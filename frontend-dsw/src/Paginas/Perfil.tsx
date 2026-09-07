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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import { useAuth } from "../Contextos/AuthContext";
import { obtenerPerfil, actualizarPerfil } from "../Servicios/usuarioService";
import type { PerfilUsuario } from "../Tipos/dominio";

export default function Perfil() {
  const { usuario, actualizarUsuario } = useAuth();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [mensajeGuardadoOk, setMensajeGuardadoOk] = useState("Perfil actualizado.");
  const [errorFoto, setErrorFoto] = useState<string | null>(null);

  const [confirmarEliminarFoto, setConfirmarEliminarFoto] = useState(false);
  const [eliminandoFoto, setEliminandoFoto] = useState(false);
  const [errorEliminarFoto, setErrorEliminarFoto] = useState<string | null>(null);

  const MAX_FOTO_BYTES = 2 * 1024 * 1024; // 2MB, va como base64 porque no hay almacenamiento de archivos

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
    e.target.value = ""; // asi se puede volver a elegir el mismo archivo si lo corrige
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

  const abrirConfirmarEliminarFoto = () => {
    setConfirmarEliminarFoto(true);
    setErrorEliminarFoto(null);
  };

  // esto se guarda al toque, no espera al boton "Guardar cambios" como el resto del form
  // asi se ve de una que quedo con el avatar por defecto
  const confirmarEliminacionFoto = async () => {
    if (!usuario) return;
    setEliminandoFoto(true);
    setErrorEliminarFoto(null);
    try {
      const actualizado = await actualizarPerfil(usuario.id, { foto: null });
      setPerfil(actualizado);
      actualizarUsuario({ foto: null });
      setConfirmarEliminarFoto(false);
      setMensajeGuardadoOk("Foto de perfil eliminada.");
      setGuardadoOk(true);
      setErrorGuardar(null);
    } catch (err) {
      setErrorEliminarFoto(err instanceof Error ? err.message : "No se pudo eliminar la foto.");
    } finally {
      setEliminandoFoto(false);
    }
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
        foto: perfil.foto ?? null,
        obraSocial: perfil.obraSocial,
        direccion: perfil.direccion,
        telefonoCelular: perfil.telefonoCelular,
      });
      setPerfil(actualizado);
      // actualiza el avatar del navbar al toque sin recargar la pagina
      actualizarUsuario({ foto: actualizado.foto ?? null });
      setMensajeGuardadoOk("Perfil actualizado.");
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
            {mensajeGuardadoOk}
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
                <Button color="error" onClick={abrirConfirmarEliminarFoto}>
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

      <Dialog
        open={confirmarEliminarFoto}
        onClose={() => (!eliminandoFoto ? setConfirmarEliminarFoto(false) : undefined)}
      >
        <DialogTitle>Eliminar foto de perfil</DialogTitle>
        <DialogContent>
          {errorEliminarFoto && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorEliminarFoto}
            </Alert>
          )}
          <Typography>¿Seguro que querés eliminar tu foto de perfil?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmarEliminarFoto(false)} disabled={eliminandoFoto}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmarEliminacionFoto}
            disabled={eliminandoFoto}
          >
            {eliminandoFoto ? <CircularProgress size={20} color="inherit" /> : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
