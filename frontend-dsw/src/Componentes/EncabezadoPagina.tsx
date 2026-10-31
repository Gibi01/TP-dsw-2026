import type { ReactNode } from 'react';
import { Box } from '@mui/material';

export default function EncabezadoPagina({ children }: { children: ReactNode }) {
  return <Box sx={{ bgcolor: 'primary.light', p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2,
    '& h1': { overflowWrap: 'anywhere', '&::after': { content: '""', display: 'block', width: 48, height: 4,
      bgcolor: 'primary.main', borderRadius: 1, mt: 1.5, mb: 2 } },
    '& > p:last-child': { mb: 0 },
  }}>{children}</Box>;
}
