import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

export default function TituloSeccion({ children, icono, id }: { children: ReactNode; icono: ReactNode; id?: string }) {
  return <Typography id={id} component="h2" variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'primary.dark', mb: 2 }}>
    <Box component="span" aria-hidden="true" sx={{ display: 'grid', placeItems: 'center', bgcolor: 'primary.light', color: 'primary.main', p: 1, borderRadius: 1, flexShrink: 0 }}>{icono}</Box>
    {children}
  </Typography>;
}
