// src/Paginas/EspecialidadTurnos.tsx
// Al elegir una especialidad se ve primero la lista de horarios disponibles (de cualquier
// doctor de esa especialidad) para una fecha. Al elegir un horario, se muestra el/los
// doctor/es que atienden en ese horario puntual; ahí se termina de elegir con quién reservar.
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import type { SlotEspecialidad } from "../Tipos/dominio";
import { getDisponibilidadEspecialidad, reservarTurno } from "../Servicios/turnosService";
import { useAuth } from "../Contextos/AuthContext";

function hoyISO(): string {
  const hoy = new Date();
  const offsetMs = hoy.getTimezoneOffset() * 60000;
  return new Date(hoy.getTime() - offsetMs).toISOString().slice(0, 10);
}

export default function EspecialidadTurnos() {
  const { id } = useParams<{ id: string }>();
  const idEspecialidad = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const { estaAutenticado } = useAuth();

  const [fecha, setFecha] = useState(hoyISO());
  const [slots, setSlots] = useState<SlotEspecialidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [horarioElegido, setHorarioElegido] = useState<string | null>(null);
  const [doctorElegido, setDoctorElegido] = useState<SlotEspecialidad["doctor"] | null>(null);
  const [reservando, setReservando] = useState(false);
  const [errorReserva, setErrorReserva] = useState<string | null>(null);

  useEffect(() => {
    if (!idEspecialidad) return;
    setLoading(true);
    setError(null);
    getDisponibilidadEspecialidad(idEspecialidad, fecha)
      .then(setSlots)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "No se pudo obtener la disponibilidad.")
      )
      .finally(() => setLoading(false));
  }, [idEspecialidad, fecha]);

  // Agrupa por horario: puede haber más de un doctor disponible en el mismo momento.
  const horarios = useMemo(() => {
    const mapa = new Map<string, SlotEspecialidad["doctor"][]>();
    for (const slot of slots) {
      const lista = mapa.get(slot.fechaHoraTurno) ?? [];
      lista.push(slot.doctor);
      mapa.set(slot.fechaHoraTurno, lista);
    }
    return Array.from(mapa.entries()).sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );
  }, [slots]);

  const elegirHorario = (horario: string) => {
    setHorarioElegido(horario);
    setDoctorElegido(null);
    setErrorReserva(null);
  };

  const elegirDoctor = (doctor: SlotEspecialidad["doctor"]) => {
    if (!estaAutenticado) {
      navigate("/login", {
        state: { from: location.pathname, mensaje: "Iniciá sesión para reservar un turno." },
      });
      return;
    }
    setDoctorElegido(doctor);
    setErrorReserva(null);
  };

  const confirmarReserva = async () => {
    if (!horarioElegido || !doctorElegido) return;
    setReservando(true);
    setErrorReserva(null);
    try {
      await reservarTurno(doctorElegido.matricula, horarioElegido);
      navigate("/mis-turnos");
    } catch (err) {
      setErrorReserva(err instanceof Error ? err.message : "No se pudo reservar el turno.");
    } finally {
      setReservando(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Turnos disponibles
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Elegí un horario y después con qué doctor querés atenderte.
        </Typography>

        <TextField
          type="date"
          label="Fecha"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
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
      ) : horarios.length === 0 ? (
        <Alert severity="info">No hay turnos disponibles para esta fecha.</Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(3, 1fr)",
              sm: "repeat(4, 1fr)",
              md: "repeat(6, 1fr)",
            },
            gap: "5px",
          }}
        >
          {horarios.map(([horario, doctores]) => (
            <Button key={horario} variant="outlined" onClick={() => elegirHorario(horario)}>
              {new Date(horario).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
              {doctores.length > 1 ? ` (${doctores.length})` : ""}
            </Button>
          ))}
        </Box>
      )}

      <Dialog open={horarioElegido !== null} onClose={() => setHorarioElegido(null)} fullWidth maxWidth="xs">
        <DialogTitle>Elegí el doctor</DialogTitle>
        <DialogContent>
          {horarioElegido && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Horario: {new Date(horarioElegido).toLocaleString("es-AR")}
            </Typography>
          )}
          <List>
            {(horarios.find(([h]) => h === horarioElegido)?.[1] ?? []).map((doctor) => (
              <ListItemButton key={doctor.matricula} onClick={() => elegirDoctor(doctor)}>
                <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <ListItemText
                  primary={`Dr./Dra. ${doctor.nombre} ${doctor.apellido}`}
                  secondary={
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: "wrap" }}>
                      {doctor.especialidades?.map((esp) => (
                        <Chip key={esp.idEspecialidad} label={esp.descripcionEsp} size="small" />
                      ))}
                    </Stack>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHorarioElegido(null)}>Volver</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={doctorElegido !== null} onClose={() => setDoctorElegido(null)}>
        <DialogTitle>Confirmar turno</DialogTitle>
        <DialogContent>
          {errorReserva && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorReserva}
            </Alert>
          )}
          {doctorElegido && horarioElegido && (
            <Typography>
              Turno con Dr./Dra. {doctorElegido.nombre} {doctorElegido.apellido} el{" "}
              {new Date(horarioElegido).toLocaleString("es-AR")}.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDoctorElegido(null)}>Cancelar</Button>
          <Button variant="contained" onClick={confirmarReserva} disabled={reservando}>
            {reservando ? <CircularProgress size={20} color="inherit" /> : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
