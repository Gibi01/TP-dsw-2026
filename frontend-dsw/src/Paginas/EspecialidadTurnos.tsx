// src/Paginas/EspecialidadTurnos.tsx
// aca se elige primero el horario disponible (de cualquier doctor de la especialidad) y
// despues se muestra que doctor/es atienden en ese horario para terminar de elegir
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
  MenuItem,
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
import type { ObraSocial, SlotEspecialidad } from "../Tipos/dominio";
import {
  getDisponibilidadEspecialidad,
  getDisponibilidadMesEspecialidad,
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

export default function EspecialidadTurnos() {
  const { id } = useParams<{ id: string }>();
  const idEspecialidad = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const { estaAutenticado } = useAuth();

  const [fecha, setFecha] = useState(hoyISO());
  const [fechasConTurnos, setFechasConTurnos] = useState<Set<string>>(new Set());
  const [slots, setSlots] = useState<SlotEspecialidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
  const [obraSocialId, setObraSocialId] = useState<number | "sin-obra-social" | "">("");
  const [cargandoObrasSociales, setCargandoObrasSociales] = useState(false);

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

  useEffect(() => {
    setCargandoObrasSociales(true);
    getObrasSociales()
      .then(setObrasSociales)
      .catch(() => setObrasSociales([]))
      .finally(() => setCargandoObrasSociales(false));
  }, []);

  const cargarMesDisponible = (anio: number, mes: number) => {
    if (!idEspecialidad) return;
    getDisponibilidadMesEspecialidad(idEspecialidad, anio, mes)
      .then((fechas) => setFechasConTurnos(new Set(fechas)))
      .catch(() => {});
  };

  // agrupo por horario porque puede haber mas de un doctor en el mismo momento
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
      navigate("/registro", {
        state: { from: location.pathname, mensaje: "Creá una cuenta para reservar un turno." },
      });
      return;
    }
    setDoctorElegido(doctor);
    setErrorReserva(null);
    setObraSocialId("");
  };

  const confirmarReserva = async () => {
    if (!horarioElegido || !doctorElegido || obraSocialId === "") return;
    setReservando(true);
    setErrorReserva(null);
    try {
      await reservarTurno(
        doctorElegido.matricula,
        horarioElegido,
        obraSocialId === "sin-obra-social" ? null : obraSocialId
      );
      navigate("/mis-turnos");
    } catch (err) {
      setErrorReserva(err instanceof Error ? err.message : "No se pudo reservar el turno.");
    } finally {
      setReservando(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Turnos disponibles
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Elegí un horario y después con qué doctor querés atenderte.
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "380px minmax(0, 1fr)" }, gap: 3 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" component="h2" gutterBottom>Elegí una fecha</Typography>
            <CalendarioTurnos
              fecha={fecha}
              onCambiarFecha={setFecha}
              fechasConTurnos={fechasConTurnos}
              onCambiarMes={cargarMesDisponible}
            />
          </Box>
          <Box sx={{ minWidth: 0, borderLeft: { md: 1 }, borderColor: { md: "divider" }, pl: { md: 3 } }}>
            <Typography variant="h6" component="h2" gutterBottom>Horarios disponibles</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {new Date(`${fecha}T00:00:00`).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
            </Typography>

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
              <Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(3, 1fr)",
                      sm: "repeat(4, 1fr)",
                      md: "repeat(4, 1fr)",
                    },
                    gap: 1.5,
                  }}
                >
                  {horarios.map(([horario, doctores]) => (
                    <Button key={horario} variant="outlined" sx={{ minHeight: 56 }} onClick={() => elegirHorario(horario)}>
                      {formatearHora(horario)}
                      {doctores.length > 1 ? ` (${doctores.length})` : ""}
                    </Button>
                  ))}
                </Box>
                <Alert severity="info" sx={{ mt: 3 }}>Seleccioná un horario para ver los doctores disponibles.</Alert>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      <Dialog open={horarioElegido !== null} onClose={() => setHorarioElegido(null)} fullWidth maxWidth="xs">
        <DialogTitle>Elegí el doctor</DialogTitle>
        <DialogContent>
          {horarioElegido && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Horario: {formatearFechaHora(horarioElegido)}
            </Typography>
          )}
          <List>
            {(horarios.find(([h]) => h === horarioElegido)?.[1] ?? []).map((doctor) => (
              <ListItemButton key={doctor.matricula} onClick={() => elegirDoctor(doctor)}>
                <Avatar src={doctor.foto ?? undefined} alt={`${doctor.nombre} ${doctor.apellido}`} sx={{ bgcolor: "primary.main", mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <ListItemText
                  primary={`Dr./Dra. ${doctor.nombre} ${doctor.apellido}`}
                  slotProps={{ secondary: { component: "div" } }}
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
            <Typography sx={{ mb: 2 }}>
              Turno con Dr./Dra. {doctorElegido.nombre} {doctorElegido.apellido} el{" "}
              {formatearFechaHora(horarioElegido)}.
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
          <Button onClick={() => setDoctorElegido(null)}>Cancelar</Button>
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
