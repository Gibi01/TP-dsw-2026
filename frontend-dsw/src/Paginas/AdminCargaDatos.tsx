// src/Paginas/AdminCargaDatos.tsx
// Página de administración: alta de especialidades, doctores y agendas.
// Solo accesible por un usuario con rol admin (ver RutaAdmin).

import { useEffect, useState, type FormEvent } from "react";
import {
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
  Stack,
} from "@mui/material";
import type { Doctor, Especialidad } from "../Tipos/dominio";
import { getEspecialidades, crearEspecialidad } from "../Servicios/especialidadesService";
import { getDoctores, crearDoctor } from "../Servicios/doctoresService";
import { crearAgenda } from "../Servicios/agendaService";

const DIAS_SEMANA = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

export default function AdminCargaDatos() {
  const [tab, setTab] = useState(0);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [doctores, setDoctores] = useState<Doctor[]>([]);

  const cargarListas = () => {
    getEspecialidades().then(setEspecialidades).catch(() => {});
    getDoctores().then(setDoctores).catch(() => {});
  };

  useEffect(() => {
    cargarListas();
  }, []);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper variant="outlined">
        <Box sx={{ p: 3, pb: 0 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Cargar datos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Alta de especialidades, doctores y agendas.
          </Typography>
        </Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ mt: 2 }}>
          <Tab label="Especialidad" />
          <Tab label="Doctor" />
          <Tab label="Agenda" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {tab === 0 && <FormEspecialidad onCreada={cargarListas} />}
          {tab === 1 && <FormDoctor especialidades={especialidades} onCreado={cargarListas} />}
          {tab === 2 && <FormAgenda doctores={doctores} onCreada={cargarListas} />}
        </Box>
      </Paper>
    </Container>
  );
}

function FormEspecialidad({ onCreada }: { onCreada: () => void }) {
  const [descripcionEsp, setDescripcionEsp] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(false);
    if (!descripcionEsp.trim()) {
      setError("Completá la descripción.");
      return;
    }
    setGuardando(true);
    try {
      await crearEspecialidad({ descripcionEsp: descripcionEsp.trim() });
      setDescripcionEsp("");
      setOk(true);
      onCreada();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la especialidad.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {ok && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Especialidad creada.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        fullWidth
        margin="normal"
        label="Descripción"
        value={descripcionEsp}
        onChange={(e) => setDescripcionEsp(e.target.value)}
      />
      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={guardando}>
        {guardando ? <CircularProgress size={24} color="inherit" /> : "Crear especialidad"}
      </Button>
    </Box>
  );
}

function FormDoctor({
  especialidades,
  onCreado,
}: {
  especialidades: Especialidad[];
  onCreado: () => void;
}) {
  const [matricula, setMatricula] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dni, setDni] = useState("");
  const [especialidadIds, setEspecialidadIds] = useState<number[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(false);
    if (!matricula || !nombre.trim() || !apellido.trim() || !email.trim() || !password || !dni.trim()) {
      setError("Completá matrícula, nombre, apellido, email, contraseña y DNI.");
      return;
    }
    setGuardando(true);
    try {
      await crearDoctor({
        matricula: Number(matricula),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        password,
        dni: dni.trim(),
        especialidadIds,
      });
      setMatricula("");
      setNombre("");
      setApellido("");
      setEmail("");
      setPassword("");
      setDni("");
      setEspecialidadIds([]);
      setOk(true);
      onCreado();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el doctor.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {ok && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Doctor creado. Ya puede iniciar sesión con el email y contraseña cargados.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        fullWidth
        margin="normal"
        type="number"
        label="Matrícula"
        value={matricula}
        onChange={(e) => setMatricula(e.target.value)}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Apellido"
        value={apellido}
        onChange={(e) => setApellido(e.target.value)}
      />
      <TextField
        fullWidth
        margin="normal"
        label="DNI"
        value={dni}
        onChange={(e) => setDni(e.target.value)}
      />
      <TextField
        fullWidth
        margin="normal"
        type="email"
        label="Email (para iniciar sesión)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        fullWidth
        margin="normal"
        type="password"
        label="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
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
      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={guardando}>
        {guardando ? <CircularProgress size={24} color="inherit" /> : "Crear doctor"}
      </Button>
    </Box>
  );
}

function FormAgenda({ doctores, onCreada }: { doctores: Doctor[]; onCreada: () => void }) {
  const [doctorId, setDoctorId] = useState("");
  const [diaSemana, setDiaSemana] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [duracionTurnoMinutos, setDuracionTurnoMinutos] = useState("30");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(false);
    if (!doctorId || diaSemana === "" || !horaInicio || !horaFin || !duracionTurnoMinutos) {
      setError("Completá todos los campos.");
      return;
    }
    setGuardando(true);
    try {
      await crearAgenda({
        doctorId: Number(doctorId),
        diaSemana: Number(diaSemana),
        horaInicio,
        horaFin,
        duracionTurnoMinutos: Number(duracionTurnoMinutos),
      });
      setOk(true);
      onCreada();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la agenda.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {ok && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Agenda creada.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        fullWidth
        select
        margin="normal"
        label="Doctor"
        value={doctorId}
        onChange={(e) => setDoctorId(e.target.value)}
      >
        {doctores.map((d) => (
          <MenuItem key={d.matricula} value={d.matricula}>
            Dr./Dra. {d.nombre} {d.apellido} (matrícula {d.matricula})
          </MenuItem>
        ))}
      </TextField>
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
      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={guardando}>
        {guardando ? <CircularProgress size={24} color="inherit" /> : "Crear agenda"}
      </Button>
    </Box>
  );
}
