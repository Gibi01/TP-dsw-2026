// src/Paginas/TurnosPacientes.tsx
// vista del doctor logueado como "atiende a", los turnos pendientes que tiene que atender
// la agenda propia se maneja aparte, en MiAgenda.tsx
import { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import type { Doctor, TurnoParaDoctor } from "../Tipos/dominio";
import { getMisDatosDeDoctor } from "../Servicios/doctoresService";
import {
  obtenerTurnosQueAtiendo,
  marcarTurnoAsistido,
  marcarTurnoNoAsistido,
} from "../Servicios/turnosService";
import { formatearFechaHora } from "../Servicios/formatoFechaHora";

export default function TurnosPacientes() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [turnos, setTurnos] = useState<TurnoParaDoctor[]>([]);

  const cargarTurnos = () => {
    obtenerTurnosQueAtiendo("pendiente").then(setTurnos);
  };

  useEffect(() => {
    getMisDatosDeDoctor()
      .then(async (doc) => {
        setDoctor(doc);
        await cargarTurnos();
      })
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudo cargar tu información."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !doctor) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error ?? "No se encontró tu registro de doctor."}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Turnos con pacientes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dr./Dra. {doctor.nombre} {doctor.apellido} — Matrícula {doctor.matricula}
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Turnos pendientes
        </Typography>
        <ListaTurnosPendientes turnos={turnos} onCambio={cargarTurnos} />
      </Paper>
    </Container>
  );
}

function ListaTurnosPendientes({
  turnos,
  onCambio,
}: {
  turnos: TurnoParaDoctor[];
  onCambio: () => void;
}) {
  const [accion, setAccion] = useState<{ turno: TurnoParaDoctor; tipo: "asistio" | "no-asistio" } | null>(
    null
  );
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmar = async () => {
    if (!accion) return;
    setProcesando(true);
    setError(null);
    try {
      if (accion.tipo === "asistio") {
        await marcarTurnoAsistido(accion.turno.id);
      } else {
        await marcarTurnoNoAsistido(accion.turno.id);
      }
      setAccion(null);
      onCambio();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el turno.");
    } finally {
      setProcesando(false);
    }
  };

  if (turnos.length === 0) {
    return <Alert severity="info">No tenés turnos pendientes por atender.</Alert>;
  }

  return (
    <>
      <Stack spacing={2}>
        {turnos.map((turno) => (
          <Paper key={turno.id} variant="outlined" sx={{ p: 2 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}
            >
              <Box>
                <Typography variant="subtitle1">
                  {turno.paciente.nombre} {turno.paciente.apellido}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatearFechaHora(turno.fechaHoraTurno)}
                </Typography>
                {turno.paciente.dni && (
                  <Typography variant="body2" color="text.secondary">
                    DNI {turno.paciente.dni}
                  </Typography>
                )}
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  color="success"
                  variant="outlined"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => setAccion({ turno, tipo: "asistio" })}
                >
                  Asistió
                </Button>
                <Button
                  size="small"
                  color="warning"
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => setAccion({ turno, tipo: "no-asistio" })}
                >
                  No asistió
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Dialog open={accion !== null} onClose={() => setAccion(null)}>
        <DialogTitle>Confirmar</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography>
            {accion?.tipo === "asistio"
              ? "¿El paciente asistió a este turno, quiere cambiar el estado del turno a Asistido?"
              : "¿Confirmás que el paciente no asistió a este turno?"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccion(null)}>Cancelar</Button>
          <Button variant="contained" onClick={confirmar} disabled={procesando}>
            {procesando ? <CircularProgress size={20} color="inherit" /> : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
