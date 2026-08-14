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
  CircularProgress,
  Alert,
} from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import type { Especialidad } from "../Tipos/dominio";
import { getEspecialidades } from "../Servicios/especialidadesService";

export default function Especialidades() {
  const navigate = useNavigate();
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEspecialidades()
      .then(setEspecialidades)
      .catch(() => setError("No se pudieron cargar las especialidades."))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (esp: Especialidad) => {
    navigate(`/doctores?especialidadId=${esp.idEspecialidad}`);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Especialidades
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Elegí una especialidad para ver los doctores disponibles.
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
      ) : (
        <Grid container spacing={2}>
          {especialidades.map((esp) => (
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
