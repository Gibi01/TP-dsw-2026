// src/Paginas/MiAgenda.tsx
// aca el doctor logueado maneja su agenda (bloques semanales recurrentes)
// esto no toca turnos ya reservados, solo los bloques que definen que horarios se ofrecen
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
import type { Doctor } from "../Tipos/dominio";
import { getMisDatosDeDoctor } from "../Servicios/doctoresService";
import { getAgendas, crearAgenda, eliminarAgenda, type Agenda } from "../Servicios/agendaService";

const DIAS_SEMANA = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

export default function MiAgenda() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agendas, setAgendas] = useState<Agenda[]>([]);

  const cargarAgendas = (matricula: number) => {
    getAgendas(matricula).then(setAgendas);
  };

  useEffect(() => {
    getMisDatosDeDoctor()
      .then((doc) => {
        setDoctor(doc);
        cargarAgendas(doc.matricula);
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
          Mi agenda
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dr./Dra. {doctor.nombre} {doctor.apellido} — Matrícula {doctor.matricula}
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <ListaAgendaPropia
          matricula={doctor.matricula}
          agendas={agendas}
          onCambio={() => cargarAgendas(doctor.matricula)}
        />
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
