// src/Paginas/doctores.tsx
// busca por nombre/apellido y filtra por especialidad al mismo tiempo
// si se llega desde Especialidades.tsx con ?especialidadId= ya viene preseleccionado
// cada tarjeta lleva al detalle del doctor donde se reserva el turno

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Avatar,
  Button,
  Chip,
  Paper,
  Stack,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import type { Especialidad, Doctor } from "../Tipos/dominio";
import { getDoctores } from "../Servicios/doctoresService";
import { getEspecialidades } from "../Servicios/especialidadesService";

export default function Doctores() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [nombre, setNombre] = useState(searchParams.get("nombre") ?? "");
  const [especialidadId, setEspecialidadId] = useState<number | "">(
    searchParams.get("especialidadId")
      ? Number(searchParams.get("especialidadId"))
      : ""
  );

  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEspecialidades()
      .then(setEspecialidades)
      .catch(() => setError("No se pudieron cargar las especialidades."));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getDoctores({
      nombre,
      especialidadId: especialidadId === "" ? undefined : especialidadId,
    })
      .then(setDoctores)
      .catch(() => setError("No se pudo obtener el listado de doctores."))
      .finally(() => setLoading(false));

    const params: Record<string, string> = {};
    if (nombre) params.nombre = nombre;
    if (especialidadId !== "") params.especialidadId = String(especialidadId);
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nombre, especialidadId]);

  const tituloEspecialidad = useMemo(() => {
    if (especialidadId === "") return null;
    return especialidades.find((e) => e.idEspecialidad === especialidadId)?.descripcionEsp;
  }, [especialidadId, especialidades]);

  const irAlDetalle = (matricula: number) => navigate(`/doctores/${matricula}`);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Doctores
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {tituloEspecialidad
            ? `Mostrando doctores de ${tituloEspecialidad}`
            : "Buscá un doctor por nombre o apellido, o filtrá por especialidad."}
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          fullWidth
          label="Buscar por nombre o apellido"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          fullWidth
          label="Especialidad"
          value={especialidadId}
          onChange={(e) =>
            setEspecialidadId(e.target.value === "" ? "" : Number(e.target.value))
          }
          sx={{ minWidth: { sm: 220 } }}
        >
          <MenuItem value="">Todas las especialidades</MenuItem>
          {especialidades.map((esp) => (
            <MenuItem key={esp.idEspecialidad} value={esp.idEspecialidad}>
              {esp.descripcionEsp}
            </MenuItem>
          ))}
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
      ) : doctores.length === 0 ? (
        <Alert severity="info">No se encontraron doctores con ese criterio.</Alert>
      ) : (
        <Stack spacing={2}>
          {doctores.map((doc) => (
            <Card key={doc.matricula} variant="outlined">
              <CardActionArea onClick={() => irAlDetalle(doc.matricula)}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <PersonIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">
                       Dr./Dra. {doc.nombre} {doc.apellido}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Matrícula {doc.matricula}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                      {doc.especialidades?.map((esp) => (
                        <Chip
                          key={esp.idEspecialidad}
                          label={esp.descripcionEsp}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<EventAvailableIcon />}
                  onClick={() => irAlDetalle(doc.matricula)}
                >
                  Reservar turno
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
