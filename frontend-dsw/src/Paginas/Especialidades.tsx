// src/Paginas/Especialidades.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Box,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import type { Especialidad } from "../Tipos/dominio";
import { getEspecialidades } from "../Servicios/especialidadesService";

export default function Especialidades() {
  const navigate = useNavigate();
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const normalizar = (texto: string) => texto.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const especialidadesVisibles = especialidades.filter((esp) =>
    normalizar(esp.descripcionEsp).includes(normalizar(busqueda))
  );

  useEffect(() => {
    getEspecialidades()
      .then(setEspecialidades)
      .catch(() => setError("No se pudieron cargar las especialidades."))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (esp: Especialidad) => {
    navigate(`/especialidades/${esp.idEspecialidad}/turnos`);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Especialidades
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Elegí una especialidad para ver los turnos disponibles.
        </Typography>
        <TextField
          fullWidth
          label="Buscar especialidad por nombre"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          sx={{ mt: 3 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
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
      ) : especialidadesVisibles.length === 0 && !error ? (
        <Alert severity="info">
          {busqueda.trim() ? "No se encontraron especialidades con ese nombre." : "No hay especialidades disponibles."}
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {especialidadesVisibles.map((esp) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={esp.idEspecialidad}>
              <Card variant="outlined">
                <CardActionArea onClick={() => handleSelect(esp)}>
                  <CardContent sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <MedicalServicesIcon color="primary" />
                    <Typography variant="subtitle1">{esp.descripcionEsp}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
