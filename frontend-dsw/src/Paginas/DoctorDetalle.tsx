// src/Paginas/DoctorDetalle.tsx
// pagina de detalle del doctor: info + horarios disponibles de la fecha elegida
// se hace click en un horario, se confirma y listo, se reserva el turno
// ver la agenda es publico, para reservar hay que estar logueado

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
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import type { Doctor, ObraSocial } from "../Tipos/dominio";
import { getDoctor } from "../Servicios/doctoresService";
import {
  getDisponibilidadDoctor,
  getDisponibilidadMesDoctor,
  reservarTurno,
} from "../Servicios/turnosService";
import { getObrasSociales } from "../Servicios/obraSocialService";
import { useAuth } from "../Contextos/AuthContext";
import { formatearHora, formatearFechaHora } from "../Servicios/formatoFechaHora";
import CalendarioTurnos from "../Componentes/CalendarioTurnos";

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
  const [fechasConTurnos, setFechasConTurnos] = useState<Set<string>>(new Set());
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errorSlots, setErrorSlots] = useState<string | null>(null);

  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
  const [obraSocialId, setObraSocialId] = useState<number | "sin-obra-social" | "">("");
  const [cargandoObrasSociales, setCargandoObrasSociales] = useState(false);

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

  useEffect(() => {
    setCargandoObrasSociales(true);
    getObrasSociales()
      .then(setObrasSociales)
      .catch(() => setObrasSociales([]))
      .finally(() => setCargandoObrasSociales(false));
  }, []);

  const cargarMesDisponible = (anio: number, mes: number) => {
    if (!matricula) return;
    getDisponibilidadMesDoctor(matriculaNum, anio, mes)
      .then((fechas) => setFechasConTurnos(new Set(fechas)))
      .catch(() => {});
  };

  const elegirSlot = (slot: string) => {
    if (!estaAutenticado) {
      navigate("/login", {
        state: { from: location.pathname, mensaje: "Iniciá sesión para reservar un turno." },
      });
      return;
    }
    setSlotElegido(slot);
    setErrorReserva(null);
    setObraSocialId("");
  };

  const confirmarReserva = async () => {
    if (!slotElegido || obraSocialId === "") return;
    setReservando(true);
    setErrorReserva(null);
    try {
      await reservarTurno(
        matriculaNum,
        slotElegido,
        obraSocialId === "sin-obra-social" ? null : obraSocialId
      );
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
               Dr./Dra. {doctor.nombre} {doctor.apellido}
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

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Turnos disponibles
        </Typography>

        <Box sx={{ mb: 3 }}>
          <CalendarioTurnos
            fecha={fecha}
            onCambiarFecha={setFecha}
            fechasConTurnos={fechasConTurnos}
            onCambiarMes={cargarMesDisponible}
          />
        </Box>

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
            {slots.map((slot) => (
              <Button key={slot} variant="outlined" onClick={() => elegirSlot(slot)}>
                {formatearHora(slot)}
              </Button>
            ))}
          </Box>
        )}
      </Paper>

      <Dialog open={slotElegido !== null} onClose={() => setSlotElegido(null)}>
        <DialogTitle>Confirmar turno</DialogTitle>
        <DialogContent>
          {errorReserva && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorReserva}
            </Alert>
          )}
          {slotElegido && (
            <Typography sx={{ mb: 2 }}>
              Turno con Dr./Dra. {doctor.nombre} {doctor.apellido} el{" "}
              {formatearFechaHora(slotElegido)}.
            </Typography>
          )}
          {cargandoObrasSociales && <CircularProgress size={24} />}
          {!cargandoObrasSociales && (
            <TextField
              select
              fullWidth
              label="Obra social a usar en este turno"
              value={obraSocialId}
              onChange={(e) => {
                const valor = e.target.value;
                setObraSocialId(
                  valor === "" || valor === "sin-obra-social" ? valor : Number(valor)
                );
              }}
            >
              <MenuItem value="" disabled>
                Elegí una opción
              </MenuItem>
              <MenuItem value="sin-obra-social">Sin obra social</MenuItem>
              {obrasSociales.map((os) => (
                <MenuItem key={os.id} value={os.id}>
                  {os.nombre}
                </MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSlotElegido(null)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={confirmarReserva}
            disabled={reservando || cargandoObrasSociales || obraSocialId === ""}
          >
            {reservando ? <CircularProgress size={20} color="inherit" /> : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
