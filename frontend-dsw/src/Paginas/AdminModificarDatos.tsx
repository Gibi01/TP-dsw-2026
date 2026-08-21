// src/Paginas/AdminModificarDatos.tsx
// Página de administración: editar o eliminar especialidades, doctores y agendas
// ya cargadas. Solo accesible por un usuario con rol admin (ver RutaAdmin).
// Complementa a AdminCargaDatos.tsx, que es solo alta.

import { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
  Stack,
  Chip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Doctor, Especialidad } from "../Tipos/dominio";
import {
  getEspecialidades,
  actualizarEspecialidad,
  eliminarEspecialidad,
} from "../Servicios/especialidadesService";
import { getDoctores, actualizarDoctor, darDeBajaDoctor } from "../Servicios/doctoresService";
import { getAgendas, actualizarAgenda, eliminarAgenda, type Agenda } from "../Servicios/agendaService";

const DIAS_SEMANA = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

export default function AdminModificarDatos() {
  const [tab, setTab] = useState(0);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper variant="outlined">
        <Box sx={{ p: 3, pb: 0 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Modificar datos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Editá o eliminá especialidades, doctores y agendas ya cargadas.
          </Typography>
        </Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ mt: 2 }}>
          <Tab label="Especialidad" />
          <Tab label="Doctor" />
          <Tab label="Agenda" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {tab === 0 && <ListaEspecialidades />}
          {tab === 1 && <ListaDoctores />}
          {tab === 2 && <ListaAgendas />}
        </Box>
      </Paper>
    </Container>
  );
}

function ListaEspecialidades() {
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editando, setEditando] = useState<Especialidad | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const [borrando, setBorrando] = useState<Especialidad | null>(null);
  const [errorBorrar, setErrorBorrar] = useState<string | null>(null);

  const cargar = () => {
    setLoading(true);
    getEspecialidades()
      .then(setEspecialidades)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "No se pudieron cargar las especialidades.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirEdicion = (esp: Especialidad) => {
    setEditando(esp);
    setDescripcion(esp.descripcionEsp);
    setErrorForm(null);
  };

  const guardarEdicion = async () => {
    if (!editando) return;
    setGuardando(true);
    setErrorForm(null);
    try {
      await actualizarEspecialidad(editando.idEspecialidad, { descripcionEsp: descripcion });
      setEditando(null);
      cargar();
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : "No se pudo actualizar.");
    } finally {
      setGuardando(false);
    }
  };

  const confirmarBorrado = async () => {
    if (!borrando) return;
    setErrorBorrar(null);
    try {
      await eliminarEspecialidad(borrando.idEspecialidad);
      setBorrando(null);
      cargar();
    } catch (err) {
      setErrorBorrar(err instanceof Error ? err.message : "No se pudo eliminar.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{error}</Alert>;
  if (especialidades.length === 0) return <Alert severity="info">No hay especialidades cargadas.</Alert>;

  return (
    <>
      <List>
        {especialidades.map((esp) => (
          <ListItem
            key={esp.idEspecialidad}
            secondaryAction={
              <Stack direction="row" spacing={1}>
                <IconButton edge="end" onClick={() => abrirEdicion(esp)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  color="error"
                  onClick={() => {
                    setBorrando(esp);
                    setErrorBorrar(null);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            }
          >
            <ListItemText primary={esp.descripcionEsp} secondary={`Id ${esp.idEspecialidad}`} />
          </ListItem>
        ))}
      </List>

      <Dialog open={editando !== null} onClose={() => setEditando(null)} fullWidth maxWidth="xs">
        <DialogTitle>Editar especialidad</DialogTitle>
        <DialogContent>
          {errorForm && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorForm}
            </Alert>
          )}
          <TextField
            fullWidth
            margin="normal"
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditando(null)}>Cancelar</Button>
          <Button variant="contained" onClick={guardarEdicion} disabled={guardando}>
            {guardando ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={borrando !== null} onClose={() => setBorrando(null)}>
        <DialogTitle>Eliminar especialidad</DialogTitle>
        <DialogContent>
          {errorBorrar && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorBorrar}
            </Alert>
          )}
          <Typography>¿Seguro que querés eliminar "{borrando?.descripcionEsp}"?</Typography>
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

function ListaDoctores() {
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editando, setEditando] = useState<Doctor | null>(null);
  const [especialidadIds, setEspecialidadIds] = useState<number[]>([]);
  const [activo, setActivo] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const [dandoBaja, setDandoBaja] = useState<Doctor | null>(null);
  const [errorBaja, setErrorBaja] = useState<string | null>(null);

  const cargar = () => {
    setLoading(true);
    // Como admin, getDoctores también trae los dados de baja (ver findAll en el backend).
    Promise.all([getDoctores(), getEspecialidades()])
      .then(([docs, esps]) => {
        setDoctores(docs);
        setEspecialidades(esps);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudieron cargar los doctores."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirEdicion = (doc: Doctor) => {
    setEditando(doc);
    setEspecialidadIds(doc.especialidades?.map((e) => e.idEspecialidad) ?? []);
    setActivo(doc.activo ?? true);
    setErrorForm(null);
  };

  const guardarEdicion = async () => {
    if (!editando) return;
    setGuardando(true);
    setErrorForm(null);
    try {
      await actualizarDoctor(editando.matricula, { especialidadIds, activo });
      setEditando(null);
      cargar();
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : "No se pudo actualizar.");
    } finally {
      setGuardando(false);
    }
  };

  const confirmarBaja = async () => {
    if (!dandoBaja) return;
    setErrorBaja(null);
    try {
      await darDeBajaDoctor(dandoBaja.matricula);
      setDandoBaja(null);
      cargar();
    } catch (err) {
      setErrorBaja(err instanceof Error ? err.message : "No se pudo dar de baja.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{error}</Alert>;
  if (doctores.length === 0) return <Alert severity="info">No hay doctores cargados.</Alert>;

  return (
    <>
      <List>
        {doctores.map((doc) => (
          <ListItem
            key={doc.matricula}
            secondaryAction={
              <Stack direction="row" spacing={1}>
                <IconButton edge="end" onClick={() => abrirEdicion(doc)}>
                  <EditIcon />
                </IconButton>
                {doc.activo !== false && (
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => {
                      setDandoBaja(doc);
                      setErrorBaja(null);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Stack>
            }
          >
            <ListItemText
              primary={
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <span>Dr./Dra. {doc.nombre} {doc.apellido}</span>
                  {doc.activo === false && <Chip size="small" color="default" label="Dado de baja" />}
                </Stack>
              }
              secondary={`Matrícula ${doc.matricula} — ${
                doc.especialidades?.map((e) => e.descripcionEsp).join(", ") || "sin especialidad"
              }`}
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={editando !== null} onClose={() => setEditando(null)} fullWidth maxWidth="xs">
        <DialogTitle>Editar doctor</DialogTitle>
        <DialogContent>
          {errorForm && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorForm}
            </Alert>
          )}
          {editando && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Dr./Dra. {editando.nombre} {editando.apellido} — matrícula {editando.matricula}
            </Typography>
          )}
          <TextField
            fullWidth
            select
            margin="normal"
            label="Especialidades"
            slotProps={{ select: { multiple: true } }}
            value={especialidadIds}
            onChange={(e) => setEspecialidadIds(e.target.value as unknown as number[])}
          >
            {especialidades.map((esp) => (
              <MenuItem key={esp.idEspecialidad} value={esp.idEspecialidad}>
                {esp.descripcionEsp}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            sx={{ mt: 1 }}
            control={<Switch checked={activo} onChange={(e) => setActivo(e.target.checked)} />}
            label={activo ? "Activo" : "Dado de baja (reactivar)"}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditando(null)}>Cancelar</Button>
          <Button variant="contained" onClick={guardarEdicion} disabled={guardando}>
            {guardando ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dandoBaja !== null} onClose={() => setDandoBaja(null)}>
        <DialogTitle>Dar de baja al doctor</DialogTitle>
        <DialogContent>
          {errorBaja && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorBaja}
            </Alert>
          )}
          <Typography>
            ¿Seguro que querés dar de baja a {dandoBaja?.nombre} {dandoBaja?.apellido}? No se
            borra ni él ni sus turnos, pero deja de ofrecerse como opción a los pacientes. Podés
            reactivarlo después desde "Editar".
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDandoBaja(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={confirmarBaja}>
            Dar de baja
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function ListaAgendas() {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editando, setEditando] = useState<Agenda | null>(null);
  const [diaSemana, setDiaSemana] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [duracionTurnoMinutos, setDuracionTurnoMinutos] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const [borrando, setBorrando] = useState<Agenda | null>(null);
  const [errorBorrar, setErrorBorrar] = useState<string | null>(null);

  const cargar = () => {
    setLoading(true);
    getAgendas()
      .then(setAgendas)
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudieron cargar las agendas."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirEdicion = (agenda: Agenda) => {
    setEditando(agenda);
    setDiaSemana(String(agenda.diaSemana));
    setHoraInicio(agenda.horaInicio);
    setHoraFin(agenda.horaFin);
    setDuracionTurnoMinutos(String(agenda.duracionTurnoMinutos));
    setErrorForm(null);
  };

  const guardarEdicion = async () => {
    if (!editando) return;
    setGuardando(true);
    setErrorForm(null);
    try {
      await actualizarAgenda(editando.id, {
        diaSemana: Number(diaSemana),
        horaInicio,
        horaFin,
        duracionTurnoMinutos: Number(duracionTurnoMinutos),
      });
      setEditando(null);
      cargar();
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : "No se pudo actualizar.");
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
      cargar();
    } catch (err) {
      setErrorBorrar(err instanceof Error ? err.message : "No se pudo eliminar.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{error}</Alert>;
  if (agendas.length === 0) return <Alert severity="info">No hay agendas cargadas.</Alert>;

  return (
    <>
      <List>
        {agendas.map((agenda) => (
          <ListItem
            key={agenda.id}
            secondaryAction={
              <Stack direction="row" spacing={1}>
                <IconButton edge="end" onClick={() => abrirEdicion(agenda)}>
                  <EditIcon />
                </IconButton>
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
              </Stack>
            }
          >
            <ListItemText
              primary={`Dr./Dra. ${agenda.doctor.nombre} ${agenda.doctor.apellido}`}
              secondary={
                <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: "wrap" }}>
                  <Chip size="small" label={DIAS_SEMANA[agenda.diaSemana].label} />
                  <Chip size="small" label={`${agenda.horaInicio} - ${agenda.horaFin}`} />
                  <Chip size="small" label={`turnos de ${agenda.duracionTurnoMinutos} min`} />
                </Stack>
              }
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={editando !== null} onClose={() => setEditando(null)} fullWidth maxWidth="xs">
        <DialogTitle>Editar agenda</DialogTitle>
        <DialogContent>
          {errorForm && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorForm}
            </Alert>
          )}
          {editando && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Doctor: {editando.doctor.nombre} {editando.doctor.apellido}
            </Typography>
          )}
          <TextField
            fullWidth
            select
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
          <Stack direction="row" spacing={2}>
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
          </Stack>
          <TextField
            fullWidth
            margin="normal"
            type="number"
            label="Duración de cada turno (minutos)"
            value={duracionTurnoMinutos}
            onChange={(e) => setDuracionTurnoMinutos(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditando(null)}>Cancelar</Button>
          <Button variant="contained" onClick={guardarEdicion} disabled={guardando}>
            {guardando ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={borrando !== null} onClose={() => setBorrando(null)}>
        <DialogTitle>Eliminar agenda</DialogTitle>
        <DialogContent>
          {errorBorrar && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorBorrar}
            </Alert>
          )}
          <Typography>¿Seguro que querés eliminar este bloque de agenda?</Typography>
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
