// src/Paginas/MisTurnosDoctor.tsx
// Vista de "Mis turnos" para un usuario con rol doctor: primero su propia agenda
// (que puede administrar), y debajo el listado de turnos pendientes que tiene que atender.
import { useEffect, useState, type FormEvent } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Stack,
  Chip,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import type { Doctor, TurnoParaDoctor } from "../Tipos/dominio";
import { getMisDatosDeDoctor } from "../Servicios/doctoresService";
import {
  getAgendas,
  crearAgenda,
  eliminarAgenda,
  type Agenda,
} from "../Servicios/agendaService";
import {
  obtenerTurnosQueAtiendo,
  marcarTurnoAsistido,
  marcarTurnoNoAsistido,
} from "../Servicios/turnosService";

const DIAS_SEMANA = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

export default function MisTurnosDoctor() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [turnos, setTurnos] = useState<TurnoParaDoctor[]>([]);

  const cargarTodo = async (matricula: number) => {
    const [agendasRes, turnosRes] = await Promise.all([
      getAgendas(matricula),
      obtenerTurnosQueAtiendo("pendiente"),
    ]);
    setAgendas(agendasRes);
    setTurnos(turnosRes);
  };

  useEffect(() => {
    getMisDatosDeDoctor()
      .then(async (doc) => {
        setDoctor(doc);
        await cargarTodo(doc.matricula);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudo cargar tu información."))
      .finally(() => setLoading(false));
  }, []);

  const refrescar = () => {
    if (doctor) cargarTodo(doctor.matricula);
  };

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
          Mis turnos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dr./Dra. {doctor.nombre} {doctor.apellido} — Matrícula {doctor.matricula}
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Mi agenda
        </Typography>
        <ListaAgendaPropia matricula={doctor.matricula} agendas={agendas} onCambio={refrescar} />
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Turnos pendientes
        </Typography>
        <ListaTurnosPendientes turnos={turnos} onCambio={refrescar} />
      </Paper>
    </Container>
  );
}

function ListaAgendaPropia({
  matricula,
  agendas,
  onCambio,
}: {
  matricula: number;
  agendas: Agenda[];
  onCambio: () => void;
}) {
  const [diaSemana, setDiaSemana] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [duracionTurnoMinutos, setDuracionTurnoMinutos] = useState("30");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [borrando, setBorrando] = useState<Agenda | null>(null);
  const [errorBorrar, setErrorBorrar] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (diaSemana === "" || !horaInicio || !horaFin || !duracionTurnoMinutos) {
      setError("Completá todos los campos.");
      return;
    }
    setGuardando(true);
    try {
      await crearAgenda({
        doctorId: matricula,
        diaSemana: Number(diaSemana),
        horaInicio,
        horaFin,
        duracionTurnoMinutos: Number(duracionTurnoMinutos),
      });
      setDiaSemana("");
      setHoraInicio("");
      setHoraFin("");
      setDuracionTurnoMinutos("30");
      onCambio();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el bloque de agenda.");
    } finally {
      setGuardando(false);
    }
  };

  const confirmarBorrado = async () => {
    if (!borrando) return;
    setErrorBorrar(null);
    try {
      await eliminarAgenda(borrando.id);
      setBorrando(null);
      onCambio();
    } catch (err) {
      setErrorBorrar(err instanceof Error ? err.message : "No se pudo eliminar.");
    }
  };

  return (
    <>
      {agendas.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Todavía no cargaste bloques de agenda.
        </Alert>
      ) : (
        <List dense sx={{ mb: 2 }}>
          {agendas.map((agenda) => (
            <ListItem
              key={agenda.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  color="error"
                  onClick={() => {
                    setBorrando(agenda);
                    setErrorBorrar(null);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Chip size="small" label={DIAS_SEMANA[agenda.diaSemana].label} />
                    <Chip size="small" label={`${agenda.horaInicio} - ${agenda.horaFin}`} />
                    <Chip size="small" label={`turnos de ${agenda.duracionTurnoMinutos} min`} />
                  </Stack>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle2" gutterBottom>
        Agregar bloque de agenda
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            select
            fullWidth
            margin="normal"
            label="Día de la semana"
            value={diaSemana}
            onChange={(e) => setDiaSemana(e.target.value)}
          >
            {DIAS_SEMANA.map((d) => (
              <MenuItem key={d.value} value={d.value}>
                {d.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            margin="normal"
            type="time"
            label="Hora inicio"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            fullWidth
            margin="normal"
            type="time"
            label="Hora fin"
            value={horaFin}
            onChange={(e) => setHoraFin(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            fullWidth
            margin="normal"
            type="number"
            label="Duración (min)"
            value={duracionTurnoMinutos}
            onChange={(e) => setDuracionTurnoMinutos(e.target.value)}
          />
        </Stack>
        <Button type="submit" variant="contained" sx={{ mt: 1 }} disabled={guardando}>
          {guardando ? <CircularProgress size={20} color="inherit" /> : "Agregar bloque"}
        </Button>
      </Box>

      <Dialog open={borrando !== null} onClose={() => setBorrando(null)}>
        <DialogTitle>Eliminar bloque de agenda</DialogTitle>
        <DialogContent>
          {errorBorrar && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorBorrar}
            </Alert>
          )}
          <Typography>¿Seguro que querés eliminar este bloque de tu agenda?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBorrando(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={confirmarBorrado}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
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
                  {new Date(turno.fechaHoraTurno).toLocaleString("es-AR")}
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
