// src/Paginas/DoctorDetalle.tsx
// Detalle de un doctor: su info + los horarios disponibles de una fecha elegida.
// El usuario hace click en un horario, confirma, y se reserva el turno.
// Ver la agenda es público; reservar requiere sesión iniciada.

import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import type { Doctor } from "../Tipos/dominio";
import { getDoctor } from "../Servicios/doctoresService";
import { getDisponibilidadDoctor, reservarTurno } from "../Servicios/turnosService";
import { useAuth } from "../Contextos/AuthContext";

function hoyISO(): string {
  const hoy = new Date();
  const offsetMs = hoy.getTimezoneOffset() * 60000;
  return new Date(hoy.getTime() - offsetMs).toISOString().slice(0, 10);
}

export default function DoctorDetalle() {
  const { matricula } = useParams<{ matricula: string }>();
  const matriculaNum = Number(matricula);
  const navigate = useNavigate();
  const location = useLocation();
  const { estaAutenticado } = useAuth();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [errorDoctor, setErrorDoctor] = useState<string | null>(null);

  const [fecha, setFecha] = useState(hoyISO());
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errorSlots, setErrorSlots] = useState<string | null>(null);

  const [slotElegido, setSlotElegido] = useState<string | null>(null);
  const [reservando, setReservando] = useState(false);
  const [errorReserva, setErrorReserva] = useState<string | null>(null);

  useEffect(() => {
    if (!matricula) return;
    setLoadingDoctor(true);
    setErrorDoctor(null);
    getDoctor(matriculaNum)
      .then(setDoctor)
      .catch((err) =>
        setErrorDoctor(err instanceof Error ? err.message : "No se pudo cargar el doctor.")
      )
      .finally(() => setLoadingDoctor(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matricula]);

  useEffect(() => {
    if (!matricula) return;
    setLoadingSlots(true);
    setErrorSlots(null);
    getDisponibilidadDoctor(matriculaNum, fecha)
      .then(setSlots)
      .catch((err) =>
        setErrorSlots(err instanceof Error ? err.message : "No se pudo obtener la disponibilidad.")
      )
      .finally(() => setLoadingSlots(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matricula, fecha]);

  const elegirSlot = (slot: string) => {
    if (!estaAutenticado) {
      navigate("/login", {
        state: { from: location.pathname, mensaje: "Iniciá sesión para reservar un turno." },
      });
      return;
    }
    setSlotElegido(slot);
    setErrorReserva(null);
  };

  const confirmarReserva = async () => {
    if (!slotElegido) return;
    setReservando(true);
    setErrorReserva(null);
    try {
      await reservarTurno(matriculaNum, slotElegido);
      navigate("/mis-turnos");
    } catch (err) {
      setErrorReserva(err instanceof Error ? err.message : "No se pudo reservar el turno.");
    } finally {
      setReservando(false);
    }
  };

  if (loadingDoctor) {
    return (
      <Container maxWidth="md" sx={{ py: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (errorDoctor || !doctor) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{errorDoctor ?? "Doctor no encontrado."}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h1">
              Dr./Dra. {doctor.nombrePr} {doctor.apellidoPr}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Matrícula {doctor.matricula}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
              {doctor.especialidades?.map((esp) => (
                <Chip
                  key={esp.idEspecialidad}
                  label={esp.descripcionEsp}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Turnos disponibles
      </Typography>

      <TextField
        type="date"
        label="Fecha"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      {errorSlots && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorSlots}
        </Alert>
      )}

      {loadingSlots ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : slots.length === 0 ? (
        <Alert severity="info">No hay horarios disponibles para esta fecha.</Alert>
      ) : (
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {slots.map((slot) => (
            <Button key={slot} variant="outlined" onClick={() => elegirSlot(slot)} sx={{ mb: 1 }}>
              {new Date(slot).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            </Button>
          ))}
        </Stack>
      )}

      <Dialog open={slotElegido !== null} onClose={() => setSlotElegido(null)}>
        <DialogTitle>Confirmar turno</DialogTitle>
        <DialogContent>
          {errorReserva && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorReserva}
            </Alert>
          )}
          {slotElegido && (
            <Typography>
              Turno con Dr./Dra. {doctor.nombrePr} {doctor.apellidoPr} el{" "}
              {new Date(slotElegido).toLocaleString("es-AR")}.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSlotElegido(null)}>Cancelar</Button>
          <Button variant="contained" onClick={confirmarReserva} disabled={reservando}>
            {reservando ? <CircularProgress size={20} color="inherit" /> : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
