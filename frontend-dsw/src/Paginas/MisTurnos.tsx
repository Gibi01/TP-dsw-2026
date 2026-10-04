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
  FormLabel,
  Radio,
  RadioGroup,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import type { EstadoTurno, MotivoCancelacion, Turno } from "../Tipos/dominio";
import { obtenerMisTurnos, cancelarTurno } from "../Servicios/turnosService";
import { getMotivosCancelacion } from "../Servicios/motivoCancelacionService";
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

  // El acceso desde Inicio con ?pendientes=1 mantiene seleccionado ese estado.
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoTurno | "todos">(
    searchParams.get("pendientes") === "1" ? "pendiente" : "todos"
  );
  const [orden, setOrden] = useState<"desc" | "asc">("desc");

  const turnosVisibles = useMemo(() => {
    return turnos
      .filter((turno) => estadoFiltro === "todos" || turno.estado === estadoFiltro)
      .sort((a, b) => {
        const diferencia = new Date(a.fechaHoraTurno).getTime() - new Date(b.fechaHoraTurno).getTime();
        return orden === "asc" ? diferencia : -diferencia;
      });
  }, [turnos, estadoFiltro, orden]);

  const [turnoACancelar, setTurnoACancelar] = useState<Turno | null>(null);
  const [motivo, setMotivo] = useState("");
  const [motivosCancelacion, setMotivosCancelacion] = useState<MotivoCancelacion[]>([]);
  const [motivoPreestablecidoId, setMotivoPreestablecidoId] = useState<number | "">("");
  const [cancelando, setCancelando] = useState(false);
  const [errorCancelacion, setErrorCancelacion] = useState<string | null>(null);

  useEffect(() => {
    getMotivosCancelacion()
      .then(setMotivosCancelacion)
      .catch(() => {});
  }, []);

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
    setMotivoPreestablecidoId("");
    setErrorCancelacion(null);
  };

  // el motivo (tanto el texto libre como el de la lista) es opcional, se puede cancelar sin cargar nada
  const confirmarCancelacion = async () => {
    if (!turnoACancelar) return;

    setCancelando(true);
    setErrorCancelacion(null);
    try {
      await cancelarTurno(
        turnoACancelar.id,
        motivo.trim(),
        motivoPreestablecidoId === "" ? null : motivoPreestablecidoId
      );
      setTurnoACancelar(null);
      cargarTurnos();
    } catch (err) {
      setErrorCancelacion(err instanceof Error ? err.message : "No se pudo cancelar el turno.");
    } finally {
      setCancelando(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mis turnos
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Consultá tus próximos turnos y tu historial.
        </Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ justifyContent: "space-between" }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography id="filtro-estado-label" sx={{ mb: 1 }}>Estado</Typography>
            <ToggleButtonGroup
              exclusive
              value={estadoFiltro}
              onChange={(_, valor: EstadoTurno | "todos" | null) => { if (valor !== null) setEstadoFiltro(valor); }}
              aria-labelledby="filtro-estado-label"
              color="primary"
              sx={{ flexWrap: "wrap" }}
            >
              <ToggleButton value="todos">Todos</ToggleButton>
              <ToggleButton value="pendiente">Pendientes</ToggleButton>
              <ToggleButton value="cancelado">Cancelados</ToggleButton>
              <ToggleButton value="asistido">Asistidos</ToggleButton>
              <ToggleButton value="no_asistido">No asistidos</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <TextField
            select
            label="Ordenar por"
            value={orden}
            onChange={(e) => setOrden(e.target.value as "asc" | "desc")}
            sx={{ minWidth: { md: 270 }, alignSelf: { md: "flex-end" } }}
          >
            <MenuItem value="desc">Recientes a más antiguos</MenuItem>
            <MenuItem value="asc">Antiguos a más recientes</MenuItem>
          </TextField>
        </Stack>
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
          {estadoFiltro === "todos" ? "Todavía no reservaste ningún turno." : "No hay turnos con el estado seleccionado."}
        </Alert>
      ) : (
        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          <Typography sx={{ px: 3, py: 2 }} color="text.secondary" aria-live="polite">
            {turnosVisibles.length} {turnosVisibles.length === 1 ? "turno" : "turnos"}
          </Typography>
          <Box sx={{ display: { xs: "none", md: "grid" }, gridTemplateColumns: "180px minmax(0, 1fr) 170px 130px 150px", gap: 2, px: 3, py: 2, bgcolor: "grey.100", borderBottom: 1, borderColor: "divider" }}>
            <Typography>Fecha y hora</Typography>
            <Typography>Doctor / Especialidad</Typography>
            <Typography>Obra social</Typography>
            <Typography>Estado</Typography>
            <Typography>Acciones</Typography>
          </Box>
          <Box component="ul" aria-label="Listado de turnos" sx={{ listStyle: "none", p: 0, m: 0 }}>
          {turnosVisibles.map((turno, indice) => (
            <Card component="li" key={turno.id} variant="outlined" sx={{ border: 0, borderRadius: 0, borderBottom: 1, borderColor: "divider", bgcolor: indice % 2 === 0 ? "background.paper" : "grey.50", "&:last-child": { borderBottom: 0 } }}>
              <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "180px minmax(0, 1fr) 170px 130px 150px" }, gap: 2, alignItems: "center" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatearFechaHora(turno.fechaHoraTurno)}
                  </Typography>
                  <Box>
                    <Typography variant="h6" component="div">
                       Dr./Dra. {turno.doctor.nombre} {turno.doctor.apellido}
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
                  <Typography variant="body2" color="text.secondary">
                    {turno.obraSocial?.nombre ?? "Sin obra social"}
                  </Typography>
                  <Chip label={ETIQUETA_ESTADO[turno.estado]} color={COLOR_ESTADO[turno.estado]} sx={{ justifySelf: "start" }} />
                  {turno.estado === "pendiente" ? (
                    <Button startIcon={<EventBusyIcon />} color="error" onClick={() => abrirCancelacion(turno)} sx={{ justifySelf: "start" }}>Cancelar turno</Button>
                  ) : <Typography color="text.secondary" aria-label="Sin acciones disponibles">—</Typography>}
                </Box>

                {turno.estado === "cancelado" &&
                  (turno.motivoCancelacion || turno.motivoCancelacionPreestablecido) && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Motivo de cancelación:{" "}
                      {[turno.motivoCancelacionPreestablecido?.descripcion, turno.motivoCancelacion]
                        .filter(Boolean)
                        .join(" — ")}
                    </Alert>
                  )}

              </CardContent>
            </Card>
          ))}
          </Box>
        </Paper>
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

          {motivosCancelacion.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <FormLabel id="motivo-preestablecido-label">
                Motivo (opcional, elegí como mucho uno)
              </FormLabel>
              <RadioGroup
                aria-labelledby="motivo-preestablecido-label"
                value={motivoPreestablecidoId}
                onChange={(e) => setMotivoPreestablecidoId(Number(e.target.value))}
              >
                {motivosCancelacion.map((m) => (
                  <FormControlLabel
                    key={m.id}
                    value={m.id}
                    control={<Radio />}
                    label={m.descripcion}
                  />
                ))}
              </RadioGroup>
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Otro motivo (opcional)"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
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
