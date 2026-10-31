import { iconosEspecialidad } from '../iconosEspecialidad';
import { Box } from '@mui/material';

export default function IconoEspecialidad({ icono }: { icono?: string }) {
  const opcion = iconosEspecialidad.find(opcion => opcion.id === icono) ?? iconosEspecialidad[0];
  const mascara = `url(/iconos-especialidades/${opcion.archivo}) center / contain no-repeat`;
  return <Box component="span" aria-hidden="true" data-icono={opcion.id} sx={{ display: 'inline-block', width: 36, height: 36, flexShrink: 0,
    bgcolor: 'primary.main', mask: mascara, WebkitMask: mascara }} />;
}
