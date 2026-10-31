import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import ArrowForward from '@mui/icons-material/ArrowForward';

export default function Card({ title = 'titulo no definido', description = 'descripción no definida', href = '#', onClick, icono }: {
  title?: string; description?: string; href?: string; onClick?: () => void; icono?: ReactNode;
}) {
  return <Box component={Link} to={href} onClick={onClick ? e => { e.preventDefault(); onClick(); } : undefined}
    sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3, minHeight: 200, width: '100%',
      textDecoration: 'none', color: 'primary.dark', bgcolor: 'primary.light', border: 1, borderColor: 'divider', borderRadius: 2,
      '&:hover': { borderColor: 'primary.main' }, '&:focus-visible': { outline: '3px solid', outlineColor: 'info.main', outlineOffset: 3 } }}>
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {icono && <Box aria-hidden="true" sx={{ color: 'primary.main', '& svg': { fontSize: 36 } }}>{icono}</Box>}
      <Typography component="h2" variant="h6">{title}</Typography>
    </Box>
    <Typography color="text.secondary">{description}</Typography>
    <ArrowForward aria-hidden="true" sx={{ alignSelf: 'flex-end', mt: 'auto' }} />
  </Box>;
}
