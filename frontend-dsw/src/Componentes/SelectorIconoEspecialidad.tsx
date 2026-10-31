import { Box, FormControl, FormLabel, Radio, RadioGroup, FormControlLabel, Stack, Typography, TextField } from '@mui/material';
import { useState } from 'react';
import IconoEspecialidad from './IconoEspecialidad';
import { iconosEspecialidad } from '../iconosEspecialidad';

export default function SelectorIconoEspecialidad({ valor, onChange, nombre, disabled = false }: {
  valor: string; onChange: (icono: string) => void; nombre: string; disabled?: boolean;
}) {
  const [busqueda, setBusqueda] = useState('');
  const normalizar = (texto: string) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const opciones = iconosEspecialidad.filter(opcion => normalizar(opcion.nombre).includes(normalizar(busqueda)));
  return <FormControl component="fieldset" disabled={disabled} fullWidth sx={{ mt: 2 }}>
    <FormLabel component="legend">Icono de la especialidad</FormLabel>
    <TextField label="Buscar icono por especialidad" value={busqueda} onChange={e => setBusqueda(e.target.value)} disabled={disabled} size="small" sx={{ mt: 2 }} />
    <Typography variant="caption" role="status" sx={{ mt: 1 }}>{opciones.length} iconos disponibles</Typography>
    <RadioGroup aria-label="Icono de la especialidad" value={valor} onChange={e => onChange(e.target.value)}
      sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1, mt: 1, maxHeight: 320, overflowY: 'auto', p: 0.5 }}>
      {opciones.map(({ id, nombre: etiqueta }) => <FormControlLabel key={id} value={id}
        control={<Radio size="small" />} label={<Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconoEspecialidad icono={id} /><Typography variant="body2">{etiqueta}</Typography>
        </Stack>}
        sx={{ m: 0, p: 0.5, border: 1, borderColor: valor === id ? 'primary.main' : 'divider', borderRadius: 1,
          bgcolor: valor === id ? 'primary.light' : 'background.paper' }} />)}
    </RadioGroup>
    {opciones.length === 0 && <Typography variant="body2">No hay coincidencias. Probá con otra especialidad.</Typography>}
    <Typography variant="caption" sx={{ mt: 2, color: 'text.secondary' }}>Vista previa</Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, mt: 0.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <IconoEspecialidad icono={valor} /><Typography sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{nombre.trim() || 'Nueva especialidad'}</Typography>
    </Box>
  </FormControl>;
}
