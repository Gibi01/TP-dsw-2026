// src/Paginas/MisTurnos.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
  Stack,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
} from "@mui/material";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import type { EstadoTurno, Turno } from "../Tipos/dominio";
import { obtenerMisTurnos, cancelarTurno } from "../Servicios/turnosService";
import { formatearFechaHora } from "../Servicios/formatoFechaHora";

const ETIQUETA_ESTADO: Record<EstadoTurno, string> = {
  pendiente: "Pendiente",
  cancelado: "Cancelado",
  asistido: "Asistido",
  no_asistido: "No asistido",
};

const COLOR_ESTADO: Record<EstadoTurno, "success" | "default" | "info" | "warning"> = {
  pendiente: "success",
  cancelado: "default",
  asistido: "info",
  no_asistido: "warning",
};

// vista de "mis turnos" como paciente, las reservas del usuario logueado con un doctor
// es igual para cualquier rol, incluso si un doctor se atendio con otro colega
// (la vista del doctor como "atiende a" esta en TurnosPacientes.tsx)
export default function MisTurnos() {
  const [searchParams] = useSearchParams();

  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // si viene de "Ver Turnos Reservados" en Inicio.tsx con ?pendientes=1, arranca filtrado
  // a futuro. despues se puede sacar el filtro para ver el historico
  const [soloPendientes, setSoloPendientes] = useState(searchParams.get("pendientes") === "1");

  const turnosVisibles = useMemo(() => {
    if (!soloPendientes) return turnos;
    const ahora = Date.now();
    return turnos.filter(
      (t) => t.estado === "pendiente" && new Date(t.fechaHoraTurno).getTime() > ahora
    );
  }, [turnos, soloPendientes]);

  const [turnoACancelar, setTurnoACancelar] = useState<Turno | null>(null);
  const [motivo, setMotivo] = useState("");
  const [cancelando, setCancelando] = useState(false);
  const [errorCancelacion, setErrorCancelacion] = useState<string | null>(null);

  const cargarTurnos = () => {
    setLoading(true);
    setError(null);
    obtenerMisTurnos()
      .then(setTurnos)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "No se pudieron obtener tus turnos.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarTurnos();
  }, []);

  const abrirCancelacion = (turno: Turno) => {
    setTurnoACancelar(turno);
    setMotivo("");
    setErrorCancelacion(null);
  };

  const confirmarCancelacion = async () => {
    if (!turnoACancelar) return;
    if (!motivo.trim()) {
      setErrorCancelacion("Contanos el motivo de la cancelación.");
      return;
    }

    setCancelando(true);
    setErrorCancelacion(null);
    try {
      await cancelarTurno(turnoACancelar.id, motivo.trim());
      setTurnoACancelar(null);
      cargarTurnos();
    } catch (err) {
      setErrorCancelacion(err instanceof Error ? err.message : "No se pudo cancelar el turno.");
    } finally {
      setCancelando(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mis turnos
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={soloPendientes}
              onChange={(e) => setSoloPendientes(e.target.checked)}
            />
          }
          label="Mostrar solo turnos pendientes"
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : turnosVisibles.length === 0 ? (
        <Alert severity="info">
          {soloPendientes
            ? "No tenés turnos pendientes."
            : "Todavía no reservaste ningún turno."}
        </Alert>
      ) : (
        <Stack spacing={2}>
          {turnosVisibles.map((turno) => (
            <Card key={turno.id} variant="outlined">
              <CardContent>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}
                >
                  <Box>
                    <Typography variant="h6" component="div">
                       Dr./Dra. {turno.doctor.nombre} {turno.doctor.apellido}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatearFechaHora(turno.fechaHoraTurno)}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                      {turno.doctor.especialidades?.map((esp) => (
                        <Chip
                          key={esp.idEspecialidad}
                          label={esp.descripcionEsp}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                  <Chip label={ETIQUETA_ESTADO[turno.estado]} color={COLOR_ESTADO[turno.estado]} />
                </Stack>

                {turno.estado === "cancelado" && turno.motivoCancelacion && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Motivo de cancelación: {turno.motivoCancelacion}
                  </Alert>
                )}

                {turno.estado === "pendiente" && (
                  <Button
                    startIcon={<EventBusyIcon />}
                    color="error"
                    sx={{ mt: 2 }}
                    onClick={() => abrirCancelacion(turno)}
                  >
                    Cancelar turno
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog
        open={turnoACancelar !== null}
        onClose={() => setTurnoACancelar(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Cancelar turno</DialogTitle>
        <DialogContent>
          {errorCancelacion && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorCancelacion}
            </Alert>
          )}
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label="Motivo de la cancelación"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTurnoACancelar(null)}>Volver</Button>
          <Button
            onClick={confirmarCancelacion}
            color="error"
            variant="contained"
            disabled={cancelando}
          >
            {cancelando ? <CircularProgress size={20} color="inherit" /> : "Confirmar cancelación"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
