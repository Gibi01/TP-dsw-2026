// src/Paginas/Doctores.tsx
// Cubre búsqueda por nombre/apellido y filtro por especialidad a la vez.
// Si se llega desde Especialidades.tsx con ?especialidadId=, el filtro
// viene preseleccionado.

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import type { Especialidad, Profesional } from "../Tipos/dominio";
import { getProfesionales } from "../Servicios/profesionalesService";
import { getEspecialidades } from "../Servicios/especialidadesService";

export default function Doctores() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [nombre, setNombre] = useState(searchParams.get("nombre") ?? "");
  const [especialidadId, setEspecialidadId] = useState<number | "">(
    searchParams.get("especialidadId")
      ? Number(searchParams.get("especialidadId"))
      : ""
  );

  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
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

    getProfesionales({
      nombre,
      especialidadId: especialidadId === "" ? undefined : especialidadId,
    })
      .then(setProfesionales)
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
    return especialidades.find((e) => e.id === especialidadId)?.descripcionEsp;
  }, [especialidadId, especialidades]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Doctores
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {tituloEspecialidad
          ? `Mostrando doctores de ${tituloEspecialidad}`
          : "Buscá un doctor por nombre o apellido, o filtrá por especialidad."}
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Buscar por nombre o apellido"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
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
            <MenuItem key={esp.id} value={esp.id}>
              {esp.descripcionEsp}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : profesionales.length === 0 ? (
        <Alert severity="info">No se encontraron doctores con ese criterio.</Alert>
      ) : (
        <Stack spacing={2}>
          {profesionales.map((prof) => (
            <Card key={prof.id} variant="outlined">
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <PersonIcon />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div">
                    Dr./Dra. {prof.nombrePr} {prof.apellidoPr}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Matrícula {prof.matricula}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                    {prof.especialidades.map((esp) => (
                      <Chip
                        key={esp.id}
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
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
