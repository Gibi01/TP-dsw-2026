import { useEffect, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import type { Doctor, ObraSocial } from '../Tipos/dominio';
import { formatearFechaHora } from '../Servicios/formatoFechaHora';

interface Props {
  doctor: Doctor;
  horario: string;
  obrasSociales: ObraSocial[];
  obraSocialId: number | 'sin-obra-social' | '';
  cargandoObrasSociales: boolean;
  reservando: boolean;
  confirmado: boolean;
  error: string | null;
  onObraSocial: (valor: Props['obraSocialId']) => void;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ConfirmacionTurno({ doctor, horario, obrasSociales, obraSocialId, cargandoObrasSociales, reservando, confirmado, error, onObraSocial, onConfirmar, onCancelar }: Props) {
  const navigate = useNavigate();
  const tituloId = useId();
  const bloqueado = reservando || confirmado;
  const cobertura = obraSocialId === 'sin-obra-social' ? 'Sin obra social' : obrasSociales.find(os => os.id === obraSocialId)?.nombre;

  useEffect(() => {
    if (!confirmado) return;
    const timer = window.setTimeout(() => navigate('/mis-turnos'), 2000);
    return () => window.clearTimeout(timer);
  }, [confirmado, navigate]);

  return (
    <Dialog open fullWidth maxWidth="xs" aria-labelledby={tituloId}
      onClose={() => { if (!bloqueado) onCancelar(); }}
      slotProps={{ paper: { sx: { borderRadius: 2, m: 2, width: 'calc(100% - 32px)' } } }}>
      {confirmado && <Box aria-hidden="true" sx={{ display: 'flex', justifyContent: 'center', pt: 4, pb: 1 }}>
        <Box sx={{
          display: 'grid', placeItems: 'center', width: 88, height: 88, borderRadius: '50%',
          bgcolor: 'success.main', color: 'common.white', boxShadow: '0 0 0 12px rgba(46,125,50,.08)',
          animation: 'confirmar-turno 350ms ease-out both',
          '@keyframes confirmar-turno': { from: { opacity: 0, transform: 'scale(.65)' }, to: { opacity: 1, transform: 'scale(1)' } },
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}><CheckRoundedIcon sx={{ fontSize: 56 }} /></Box>
      </Box>}
      <DialogTitle id={tituloId} sx={{ textAlign: confirmado ? 'center' : 'left', fontWeight: 700, pt: 3 }}>
        {confirmado ? '¡Tu turno está confirmado!' : 'Confirmar turno'}
      </DialogTitle>
      <DialogContent>
        <Box role="status" aria-live="polite" aria-atomic="true">
          {confirmado && <Typography color="text.secondary" sx={{ textAlign: "center", mb: 3 }}>Tu turno está confirmado. Te esperamos en tu próxima consulta.</Typography>}
          {reservando && <Typography color="text.secondary" sx={{ mb: 2 }}>Estamos confirmando tu turno…</Typography>}
        </Box>
        {error && !confirmado && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={2} sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2, mb: 3 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <PersonOutlineRoundedIcon color="action" />
            <Box>
              <Typography sx={{ fontWeight: 600 }}>Dr./Dra. {doctor.nombre} {doctor.apellido}</Typography>
              <Typography variant="body2" color="text.secondary">{doctor.especialidades?.map(esp => esp.descripcionEsp).join(' · ')}</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <EventOutlinedIcon color="action" /><Typography>{formatearFechaHora(horario)}</Typography>
          </Stack>
          {confirmado && <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <LocalHospitalOutlinedIcon color="action" /><Typography>{cobertura}</Typography>
          </Stack>}
        </Stack>
        {!confirmado && (cargandoObrasSociales ? <CircularProgress size={24} aria-label="Cargando obras sociales" /> :
          <TextField select fullWidth label="Obra social a usar en este turno" value={obraSocialId} disabled={reservando}
            onChange={e => { const valor = e.target.value; onObraSocial(valor === '' || valor === 'sin-obra-social' ? valor : Number(valor)); }}>
            <MenuItem value="" disabled>Elegí una opción</MenuItem>
            <MenuItem value="sin-obra-social">Sin obra social</MenuItem>
            {obrasSociales.map(os => <MenuItem key={os.id} value={os.id}>{os.nombre}</MenuItem>)}
          </TextField>)}
        {confirmado && <>
          <Button fullWidth variant="contained" size="large" onClick={() => navigate('/mis-turnos')}>Ver mis turnos</Button>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 2 }}>Te llevaremos a Mis turnos en un momento…</Typography>
          <Box aria-hidden="true" sx={{ height: 4, bgcolor: 'action.hover', borderRadius: 1, mt: 2, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', bgcolor: 'primary.main', transformOrigin: 'left', animation: 'avance-turno 2s linear both',
              '@keyframes avance-turno': { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }} />
          </Box>
        </>}
      </DialogContent>
      {!confirmado && <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button disabled={reservando} onClick={onCancelar}>Cancelar</Button>
        <Button variant="contained" disabled={reservando || cargandoObrasSociales || obraSocialId === ''} onClick={onConfirmar}
          startIcon={reservando ? <CircularProgress size={18} color="inherit" /> : undefined}>
          {reservando ? 'Reservando…' : 'Confirmar'}
        </Button>
      </DialogActions>}
    </Dialog>
  );
}
